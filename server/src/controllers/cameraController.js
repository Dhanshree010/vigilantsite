const cameraStore = require('../models/Camera');

exports.getCameras = async (req, res) => {
  try {
    const list = await cameraStore.getAll();
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch cameras.' });
  }
};

exports.pingCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const { fps, activeWorkers } = req.body;
    const updated = await cameraStore.updatePing(id, { fps, activeWorkers });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update camera heartbeat.' });
  }
};
