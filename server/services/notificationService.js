const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    try {
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      let testAccount = await nodemailer.createTestAccount();

      // create reusable transporter object using the default SMTP transport
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      console.log('Ethereal Email transporter initialized.');
    } catch (error) {
      console.error('Failed to initialize Ethereal Email:', error);
    }
  }

  async sendAppointmentConfirmation(patientEmail, patientName, doctorName, time) {
    if (!this.transporter) {
      console.warn('Transporter not initialized, skipping email.');
      return;
    }

    try {
      const formattedTime = new Date(time).toLocaleString();
      const mailOptions = {
        from: '"TeleMed EHR" <noreply@telemed-ehr.com>',
        to: patientEmail,
        subject: "Appointment Confirmation",
        text: `Hello ${patientName},\n\nYour appointment with Dr. ${doctorName} has been confirmed for ${formattedTime}.\n\nThank you for choosing TeleMed EHR.`,
        html: `<p>Hello <b>${patientName}</b>,</p><p>Your appointment with Dr. <b>${doctorName}</b> has been confirmed for <b>${formattedTime}</b>.</p><p>Thank you for choosing TeleMed EHR.</p>`,
      };

      let info = await this.transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // Mock SMS service
  sendSMS(phoneNumber, message) {
    console.log(`\n--- MOCK SMS ---`);
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log(`----------------\n`);
  }
}

module.exports = new NotificationService();
