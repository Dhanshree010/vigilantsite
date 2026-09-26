require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initSocket } = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io with cross-origin support
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach socket event listeners
initSocket(io);

// Start server
server.listen(PORT, () => {
  console.log('=====================================================');
  console.log(`🚀 VisionOps Backend API & WebSocket Server Online`);
  console.log(`🌐 HTTP API:        http://localhost:${PORT}`);
  console.log(`⚡ WebSocket URL:   ws://localhost:${PORT}`);
  console.log(`🩺 Health Check:    http://localhost:${PORT}/health`);
  console.log('=====================================================');
});

module.exports = server;
