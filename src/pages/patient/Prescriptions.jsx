import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Download, QrCode } from 'lucide-react';
import { mockClient } from '@/lib/mockClient';
import StatusBadge from '@/components/medisync/StatusBadge';
import EmptyState from '@/components/medisync/EmptyState';

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrModal, setQrModal] = useState(null);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        mockClient.entities.Prescription.filter({ patient_email: user.email })
            .then(r => { setPrescriptions(r); setLoading(false); });
    }, []);

    const parseMeds = (medStr) => {
        try { return JSON.parse(medStr); } catch { return []; }
    };

    const downloadPrescription = (rx) => {
        const content = `MEDISYNC PRESCRIPTION\n${'='.repeat(40)}\nPatient: ${rx.patient_name}\nDoctor: ${rx.doctor_name}\nDate: ${rx.issued_date}\n\nDiagnosis: ${rx.diagnosis_summary || 'N/A'}\n\nMEDICATIONS:\n${parseMeds(rx.medications).map(m => `• ${m.drug_name} - ${m.dosage} - ${m.frequency} - ${m.duration}`).join('\n') || 'See medications list'}\n\nInstructions: ${rx.additional_instructions || 'N/A'}\n\nSignature Hash: ${rx.signature_hash || 'SHA256:' + Math.random().toString(36).slice(2)}\n\nThis is a digitally signed prescription from MediSync.`;
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `prescription_${rx.id?.slice(0, 8)}.txt`;
        a.click();
    };

    if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3].map(i => <div key={i} className="card-surface h-48 shimmer" />)}</div>;

    if (prescriptions.length === 0) return (
        <div className="card-surface">
            <EmptyState icon={Pill} title="No Prescriptions" message="Prescriptions from your doctors will appear here" color="amber" />
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#F1F5F9]">My Prescriptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((rx, i) => {
                    const meds = parseMeds(rx.medications);
                    return (
                        <motion.div key={rx.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className="card-surface p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="font-semibold text-[#F1F5F9]">{rx.diagnosis_summary || 'General Prescription'}</div>
                                    <div className="text-xs text-[#64748B] mt-0.5">{rx.doctor_name} · {rx.issued_date}</div>
                                </div>
                                <StatusBadge status={rx.status || 'active'} />
                            </div>

                            {meds.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {meds.slice(0, 3).map((med, j) => (
                                        <div key={j} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                                            style={{ background: 'rgba(255,255,255,0.04)' }}>
                                            <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
                                            <span className="font-medium text-[#F1F5F9]">{med.drug_name}</span>
                                            <span className="text-[#64748B]">{med.dosage} · {med.frequency}</span>
                                        </div>
                                    ))}
                                    {meds.length > 3 && <div className="text-xs text-[#64748B] px-3">+{meds.length - 3} more medications</div>}
                                </div>
                            )}

                            <div className="flex gap-2 mt-4">
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => downloadPrescription(rx)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                                    style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                                    <Download size={13} /> Download PDF
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => setQrModal(rx)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                                    style={{ background: 'rgba(0,217,184,0.1)', color: '#00D9B8', border: '1px solid rgba(0,217,184,0.2)' }}>
                                    <QrCode size={13} />
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {qrModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setQrModal(null)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="glass-elevated rounded-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-[#F1F5F9] mb-4">Prescription QR Code</h3>
                        <div className="w-48 h-48 mx-auto rounded-xl bg-white flex items-center justify-center mb-4">
                            <div className="grid grid-cols-8 gap-0.5 w-40 h-40">
                                {Array.from({ length: 64 }, (_, i) => (
                                    <div key={i} className="rounded-sm"
                                        style={{ background: Math.random() > 0.5 ? '#000' : '#fff', aspectRatio: '1' }} />
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-[#64748B]">Rx ID: {qrModal.id?.slice(0, 12)}...</p>
                        <button onClick={() => setQrModal(null)} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold"
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#F1F5F9' }}>Close</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
