import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useWebRTC = (roomToken, appointmentId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const peerConnection = useRef(null);
  const socket = useRef(null);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Get User Media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        // 2. Connect to Signaling Server
        socket.current = io("http://localhost:4000", {
          auth: { token: roomToken }
        });

        // 3. Initialize Peer Connection
        peerConnection.current = new RTCPeerConnection(configuration);

        // Add tracks to Peer Connection
        stream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, stream);
        });

        // Handle Remote Stream
        peerConnection.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          setConnectionStatus('connected');
        };

        // Handle ICE Candidates
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.current.emit('ice-candidate', { candidate: event.candidate });
          }
        };

        // Handle Signaling Events
        socket.current.on('offer', async (data) => {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.current.emit('answer', { answer });
        });

        socket.current.on('answer', async (data) => {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        socket.current.on('ice-candidate', async (data) => {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {
            console.error("Error adding ice candidate", e);
          }
        });

        // Caller side: Create Offer
        // (Simple logic: first one in room waits for second to join and then offer is triggered)
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.current.emit('offer', { offer });

      } catch (error) {
        console.error("WebRTC initialization failed", error);
        setConnectionStatus('failed');
      }
    };

    if (roomToken) init();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      peerConnection.current?.close();
      socket.current?.disconnect();
    };
  }, [roomToken, appointmentId]);

  return { localStream, remoteStream, connectionStatus };
};
