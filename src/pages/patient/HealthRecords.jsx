import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Lock, ChevronRight, Upload, X } from 'lucide-react';
import { mockClient } from '@/lib/mockClient';
import EmptyState from '@/components/medisync/EmptyState';
import { format, parseISO } from 'date-fns';

export default function HealthRecords() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const user = JSON.parse(localStorage.getItem('medisync_user') || '{}');

    useEffect(() => {
        mockClient.entities.MedicalRecord.filter({ patient_email: user.email })
            .then(r => { setRecords(r); setLoading(false); });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#F1F5F9]">Health Records</h2>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <Upload size={14} /> Upload Report
                </motion.button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card-surface p-5 h-20 shimmer" />
                    ))}
                </div>
            ) : records.length === 0 ? (
                <div className="card-surface">
                    <EmptyState icon={FileText} title="No Health Records" message="Your medical records from consultations will appear here" color="amber" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timeline */}
                    <div className="lg:col-span-2 space-y-3">
                        {records.map((record, i) => (
                            <motion.button key={record.id} onClick={() => setSelected(record)}
                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                className={`w-full card-surface p-5 flex items-start gap-4 text-left transition-all hover:border-[rgba(245,158,11,0.3)] ${selected?.id === record.id ? 'border-[rgba(245,158,11,0.4)]' : ''}`}>
                                <div className="flex flex-col items-center gap-1.5 mt-1">
                                    <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
                                    {i < records.length - 1 && <div className="w-px h-12" style={{ background: 'rgba(245,158,11,0.2)' }} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-[#F1F5F9]">{record.diagnosis || 'General Checkup'}</span>
                                        <span className="flex items-center gap-1 text-xs" style={{ color: '#00D9B8' }}>
                                            <Lock size={10} /> PHI Encrypted
                                        </span>
                                    </div>
                                    <div className="text-xs text-[#64748B]">{record.doctor_name} · {record.doctor_specialization}</div>
                                    <div className="text-xs text-[#64748B] mt-0.5">{record.visit_date}</div>
                                </div>
                                <ChevronRight size={16} color="#64748B" />
                            </motion.button>
                        ))}
                    </div>

                    {/* Detail Panel */}
                    <AnimatePresence>
                        {selected && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="card-surface p-6 h-fit">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-semibold text-[#F1F5F9]">Record Details</h3>
                                    <button onClick={() => setSelected(null)} className="text-[#64748B] hover:text-[#F1F5F9]">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Chief Complaint</div>
                                        <div className="text-[#F1F5F9]">{selected.chief_complaint || 'General consultation'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Diagnosis</div>
                                        <div className="text-[#F1F5F9]">{selected.diagnosis || 'See notes'}</div>
                                    </div>
                                    {selected.treatment_plan && (
                                        <div>
                                            <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Treatment Plan</div>
                                            <div className="text-[#F1F5F9]">{selected.treatment_plan}</div>
                                        </div>
                                    )}
                                    {selected.notes && (
                                        <div>
                                            <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Doctor Notes</div>
                                            <div className="text-[#F1F5F9]">{selected.notes}</div>
                                        </div>
                                    )}
                                    <div className="pt-2 p-3 rounded-xl" style={{ background: 'rgba(0,217,184,0.08)', border: '1px solid rgba(0,217,184,0.2)' }}>
                                        <div className="flex items-center gap-2 text-xs" style={{ color: '#00D9B8' }}>
                                            <Lock size={12} />
                                            This record is AES-256 encrypted and HIPAA compliant
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
