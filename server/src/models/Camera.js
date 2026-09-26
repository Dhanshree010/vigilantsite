// In-memory & Mongoose compatible Camera Registry
const defaultCameras = [
  {
    id: 'CAM_01_BAY_NORTH',
    name: 'North Loading Dock - Bay 3',
    location: 'Building A, Ground Level',
    status: 'ACTIVE',
    streamUrl: 'rtsp://edge-gateway.local:8554/live/cam01',
    fps: 30,
    resolution: '1080p',
    activeWorkers: 4,
    lastPing: new Date()
  },
  {
    id: 'CAM_02_SCAFFOLDING',
    name: 'Scaffolding Structure - Sector 2',
    location: 'West Wing Expansion',
    status: 'ACTIVE',
    streamUrl: 'rtsp://edge-gateway.local:8554/live/cam02',
    fps: 28,
    resolution: '1080p',
    activeWorkers: 6,
    lastPing: new Date()
  },
  {
    id: 'CAM_03_ASSEMBLY_LINE',
    name: 'Robotic Assembly Cell 4',
    location: 'Main Plant Floor',
    status: 'ACTIVE',
    streamUrl: 'rtsp://edge-gateway.local:8554/live/cam03',
    fps: 30,
    resolution: '1080p',
    activeWorkers: 8,
    lastPing: new Date()
  },
  {
    id: 'CAM_04_FORKLIFT_LANE',
    name: 'Logistics High-Speed Forklift Lane',
    location: 'Warehouse Gate C',
    status: 'ACTIVE',
    streamUrl: 'rtsp://edge-gateway.local:8554/live/cam04',
    fps: 25,
    resolution: '720p',
    activeWorkers: 3,
    lastPing: new Date()
  }
];

class CameraStore {
  constructor() {
    this.cameras = [...defaultCameras];
  }

  async getAll() {
    return this.cameras;
  }

  async getById(id) {
    return this.cameras.find(c => c.id === id) || null;
  }

  async updatePing(id, stats = {}) {
    const cam = await this.getById(id);
    if (cam) {
      cam.lastPing = new Date();
      if (stats.fps) cam.fps = stats.fps;
      if (stats.activeWorkers !== undefined) cam.activeWorkers = stats.activeWorkers;
    }
    return cam;
  }
}

module.exports = new CameraStore();
