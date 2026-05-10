const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error: Token missing"));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // Contains { appointmentId, userId, role }
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on('connection', (socket) => {
  const { appointmentId } = socket.user;
  
  socket.join(appointmentId);
  console.log(`User ${socket.id} joined room: ${appointmentId}`);

  // Relay WebRTC Offer
  socket.on('offer', (data) => {
    socket.to(appointmentId).emit('offer', {
      offer: data.offer,
      senderId: socket.id
    });
  });

  // Relay WebRTC Answer
  socket.on('answer', (data) => {
    socket.to(appointmentId).emit('answer', {
      answer: data.answer,
      senderId: socket.id
    });
  });

  // Relay ICE Candidates
  socket.on('ice-candidate', (data) => {
    socket.to(appointmentId).emit('ice-candidate', {
      candidate: data.candidate,
      senderId: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
