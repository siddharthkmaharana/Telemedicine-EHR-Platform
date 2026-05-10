import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebRTC } from '../../hooks/useWebRTC';
import axios from 'axios';

const ConsultationRoom = () => {
  const { appointmentId } = useParams();
  const [roomToken, setRoomToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get(`/api/telehealth/token/${appointmentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRoomToken(response.data.token);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to join room");
      }
    };
    fetchToken();
  }, [appointmentId]);

  const { localStream, remoteStream, connectionStatus } = useWebRTC(roomToken, appointmentId);

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

      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Remote Video (Main) */}
        <div className="w-full h-full bg-black">
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
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-500 shadow-xl">
          <video
            autoPlay
            playsInline
            muted
            ref={(v) => v && (v.srcObject = localStream)}
            className="w-full h-full object-cover mirror"
          />
        </div>
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
