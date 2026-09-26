const defaultZones = [
  {
    id: 'zone_01',
    name: 'Zone-A Heavy Machinery Perimeter',
    cameraId: 'CAM_01_BAY_NORTH',
    dangerLevel: 'CRITICAL',
    // Normalized 0..1 polygon coordinates for canvas rendering & edge worker check
    polygon: [
      { x: 0.15, y: 0.45 },
      { x: 0.65, y: 0.45 },
      { x: 0.75, y: 0.90 },
      { x: 0.10, y: 0.90 }
    ],
    requiredPPE: ['HARDHAT', 'SAFETY_VEST']
  },
  {
    id: 'zone_02',
    name: 'Scaffold Fall-Risk Boundary',
    cameraId: 'CAM_02_SCAFFOLDING',
    dangerLevel: 'HIGH',
    polygon: [
      { x: 0.20, y: 0.20 },
      { x: 0.80, y: 0.20 },
      { x: 0.85, y: 0.85 },
      { x: 0.15, y: 0.85 }
    ],
    requiredPPE: ['HARDHAT', 'SAFETY_VEST', 'HARNESS']
  }
];

class ZoneStore {
  constructor() {
    this.zones = [...defaultZones];
  }

  async getAll() {
    return this.zones;
  }

  async getByCamera(cameraId) {
    return this.zones.filter(z => z.cameraId === cameraId);
  }

  async save(zoneData) {
    const existingIndex = this.zones.findIndex(z => z.id === zoneData.id);
    if (existingIndex >= 0) {
      this.zones[existingIndex] = { ...this.zones[existingIndex], ...zoneData };
      return this.zones[existingIndex];
    } else {
      const newZone = {
        id: zoneData.id || 'zone_' + Date.now(),
        ...zoneData
      };
      this.zones.push(newZone);
      return newZone;
    }
  }
}

module.exports = new ZoneStore();
