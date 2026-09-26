const zoneStore = require('../models/Zone');

exports.getZones = async (req, res) => {
  try {
    const { cameraId } = req.query;
    let list;
    if (cameraId) {
      list = await zoneStore.getByCamera(cameraId);
    } else {
      list = await zoneStore.getAll();
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch safety zones.' });
  }
};

exports.saveZone = async (req, res) => {
  try {
    const zoneData = req.body;
    if (!zoneData.name || !zoneData.cameraId || !zoneData.polygon) {
      return res.status(400).json({ error: 'Missing zone name, camera ID, or polygon coordinates.' });
    }
    const saved = await zoneStore.save(zoneData);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save safety zone.' });
  }
};
