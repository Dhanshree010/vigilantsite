let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Allow client to subscribe to specific camera feeds or all
    socket.on('subscribe_camera', (cameraId) => {
      socket.join(`camera_${cameraId}`);
      console.log(`[Socket.io] Client ${socket.id} joined room camera_${cameraId}`);
    });

    socket.on('unsubscribe_camera', (cameraId) => {
      socket.leave(`camera_${cameraId}`);
    });

    // Support simulated edge event triggered directly from interactive frontend demo
    socket.on('simulate_violation', (simulatedData) => {
      console.log('[Socket.io] Received demo simulation event:', simulatedData.violationType);
      broadcastViolation(simulatedData);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}

function broadcastViolation(violation) {
  if (!ioInstance) return;
  // Broadcast to global feed
  ioInstance.emit('new_violation', violation);
  // Also broadcast to specific camera room if subscribed
  if (violation.cameraId) {
    ioInstance.to(`camera_${violation.cameraId}`).emit('camera_violation', violation);
  }
}

function broadcastStatusUpdate(updatedViolation) {
  if (!ioInstance) return;
  ioInstance.emit('violation_status_updated', updatedViolation);
}

function broadcastEdgeHeartbeat(telemetry) {
  if (!ioInstance) return;
  ioInstance.emit('edge_heartbeat', telemetry);
}

module.exports = {
  initSocket,
  broadcastViolation,
  broadcastStatusUpdate,
  broadcastEdgeHeartbeat
};
