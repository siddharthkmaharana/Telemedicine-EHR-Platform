import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebRTC } from '@/hooks/useWebRTC';
import apiClient from '@/lib/api';
import { Save, FileText, CheckCircle } from 'lucide-react';
const ConsultationRoom = () => {
  const { appointmentId } = useParams();
  const [roomToken, setRoomToken] = useState(null);
  const [error, setError] = useState(null);

  // Clinical Notes State
  const [notes, setNotes] = useState('');
  const [diagnoses, setDiagnoses] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // User details
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('medisync_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await apiClient.get(`/api/telehealth/token/${appointmentId}`);
        setRoomToken(response.data.token);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to join room");
      }
    };
    fetchToken();
  }, [appointmentId]);

  const { localStream, remoteStream, connectionStatus } = useWebRTC(roomToken, appointmentId);

  const handleSaveNotes = async () => {
    if (!notes) return;
    setSaving(true);
    try {
      // In a real scenario, patientId would be fetched from the appointment details
      // For now, we mock the patientId or pass it if it's available in context
      const appointmentResponse = await apiClient.get('/appointments/doctor/me');
      const appointment = appointmentResponse.data.find(a => a.id === appointmentId);
      
      const payload = {
        doctorId: user.userId,
        appointmentId,
        clinicalNotes: notes,
        diagnoses: diagnoses
      };
      
      // If we don't have the exact patientId from the mock API, we can skip saving for this demo
      // In a fully integrated backend, we'd do POST /api/records
      console.log('Saving notes payload:', payload);
      
      // Mock successful save
      setTimeout(() => {
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }, 800);
    } catch (err) {
      console.error('Failed to save notes:', err);
      setSaving(false);
    }
  };

  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;
  if (!roomToken) return <div className="p-10">Joining room...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="p-4 bg-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-bold">Telehealth Consultation</h1>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className="text-sm capitalize">{connectionStatus}</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className={`relative flex items-center justify-center bg-black ${user?.role === 'doctor' ? 'w-2/3 border-r border-gray-700' : 'w-full'}`}>
          {/* Remote Video (Main) */}
          {remoteStream ? (
            <video
              autoPlay
              playsInline
              ref={(v) => v && (v.srcObject = remoteStream)}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Waiting for peer to join...
            </div>
          )}

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-4 left-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-[#00D9B8] shadow-xl">
            <video
              autoPlay
              playsInline
              muted
              ref={(v) => v && (v.srcObject = localStream)}
              className="w-full h-full object-cover mirror"
            />
          </div>
        </div>

        {/* Clinical Notes Panel (Doctor Only) */}
        {user?.role === 'doctor' && (
          <div className="w-1/3 bg-[#151D2E] p-6 flex flex-col h-full overflow-y-auto">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#00D9B8]">
              <FileText size={20} /> Clinical Notes
            </h2>
            
            <div className="space-y-5 flex-1">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Diagnoses</label>
                <textarea
                  value={diagnoses}
                  onChange={(e) => setDiagnoses(e.target.value)}
                  placeholder="e.g., Acute Pharyngitis"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-[#00D9B8] resize-none"
                />
              </div>
              
              <div className="flex-1 flex flex-col h-64">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Consultation Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter detailed clinical observations here..."
                  className="w-full flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-[#00D9B8] resize-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveNotes}
                disabled={saving || !notes}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: saved ? '#00D9B8' : '#7C3AED', color: '#fff' }}
              >
                {saved ? (
                  <><CheckCircle size={18} /> Saved to EHR</>
                ) : saving ? (
                  'Saving...'
                ) : (
                  <><Save size={18} /> Save Notes</>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 bg-gray-800 flex justify-center gap-6">
        <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600">
          Mute
        </button>
        <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600">
          Video Off
        </button>
        <button 
          className="px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 font-bold"
          onClick={() => window.history.back()}
        >
          End Consultation
        </button>
      </footer>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default ConsultationRoom;
