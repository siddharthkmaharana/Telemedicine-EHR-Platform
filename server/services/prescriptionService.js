const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class PrescriptionService {
  /**
   * Generates a digital prescription PDF and a verification hash
   * @param {Object} prescriptionData 
   */
  async generatePrescription(data) {
    const { 
      prescriptionId, 
      patientName, 
      doctorName, 
      doctorLicense, 
      issuedAt, 
      medications, 
      instructions 
    } = data;

    // 1. Build canonical payload for hashing
    const payload = JSON.stringify({
      prescriptionId,
      patientName,
      doctorName,
      doctorLicense,
      issuedAt,
      medications,
      instructions
    });

    // 2. Compute cryptographic hash
    const secret = process.env.PDF_SIGNING_SECRET || 'default_secret_key_change_in_prod';
    const hash = crypto.createHmac('sha256', secret)
                       .update(payload)
                       .digest('hex');

    // 3. Generate QR Code
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/api/prescriptions/verify/${hash}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl);

    // 4. Build PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Header
    doc.fontSize(20).text('TeleMed EHR - Digital Prescription', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date(issuedAt).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Doctor Info
    doc.fontSize(14).text('Doctor Information', { underline: true });
    doc.fontSize(12).text(`Name: ${doctorName}`);
    doc.text(`License No: ${doctorLicense}`);
    doc.moveDown();

    // Patient Info
    doc.fontSize(14).text('Patient Information', { underline: true });
    doc.fontSize(12).text(`Name: ${patientName}`);
    doc.moveDown();

    // Medications
    doc.fontSize(14).text('Medications', { underline: true });
    medications.forEach((med, index) => {
      doc.fontSize(12).text(`${index + 1}. ${med.name} - ${med.dosage}`);
      doc.fontSize(10).text(`   Frequency: ${med.frequency}, Duration: ${med.duration}`);
    });
    doc.moveDown();

    // Instructions
    if (instructions) {
      doc.fontSize(14).text('Instructions', { underline: true });
      doc.fontSize(12).text(instructions);
      doc.moveDown();
    }

    // Digital Signature & QR Code
    doc.fontSize(10).text('Digitally Signed by TeleMed EHR Platform', { align: 'center' });
    doc.text(`Hash: ${hash}`, { align: 'center', color: 'grey' });
    
    // Add QR Code
    doc.image(qrDataUrl, doc.page.width - 150, doc.page.height - 150, { width: 100 });

    doc.end();

    return { doc, hash };
  }

  /**
   * Verifies the authenticity of a prescription hash
   * @param {string} hash 
   * @param {Object} originalData 
   */
  verifyHash(hash, originalData) {
    const payload = JSON.stringify(originalData);
    const secret = process.env.PDF_SIGNING_SECRET || 'default_secret_key_change_in_prod';
    const expectedHash = crypto.createHmac('sha256', secret)
                               .update(payload)
                               .digest('hex');
    return hash === expectedHash;
  }
}

module.exports = new PrescriptionService();
