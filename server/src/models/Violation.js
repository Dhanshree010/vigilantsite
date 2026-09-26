const mongoose = require('mongoose');

// Mongoose schema as defined in VisionOps Technical Specification
const violationSchema = new mongoose.Schema({
  cameraId: { type: String, required: true, index: true },
  zoneName: { type: String, required: true },
  violationType: { 
    type: String, 
    enum: ['NO_HELMET', 'NO_VEST', 'ZONE_INTRUSION', 'STOP_WORK_ORDER', 'CITATION_ISSUED'], 
    required: true 
  },
  workerTrackId: { type: Number, required: true },
  confidenceScore: { type: Number, min: 0, max: 1 },
  snapshotUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['UNREVIEWED', 'ACKNOWLEDGED', 'RESOLVED'], 
    default: 'UNREVIEWED' 
  },
  resolvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  timestamp: { type: Date, default: Date.now, index: true }
});

const MongooseViolation = mongoose.models.Violation || mongoose.model('Violation', violationSchema);

// In-Memory Fallback Store (allows instant standalone execution without MongoDB daemon)
class MemoryViolationStore {
  constructor() {
    this.violations = [
      {
        _id: 'viol_seed_101',
        cameraId: 'CAM_01_BAY_NORTH',
        zoneName: 'Loading Bay 3 - Heavy Machinery Zone',
        violationType: 'NO_HELMET',
        workerTrackId: 104,
        confidenceScore: 0.94,
        snapshotUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        status: 'UNREVIEWED',
        resolvedBy: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 12)
      },
      {
        _id: 'viol_seed_102',
        cameraId: 'CAM_02_SCAFFOLDING',
        zoneName: 'Elevated Deck Zone A',
        violationType: 'NO_VEST',
        workerTrackId: 118,
        confidenceScore: 0.89,
        snapshotUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80',
        status: 'ACKNOWLEDGED',
        resolvedBy: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 35)
      },
      {
        _id: 'viol_seed_103',
        cameraId: 'CAM_04_FORKLIFT_LANE',
        zoneName: 'Restricted Forklift Perimeter',
        violationType: 'ZONE_INTRUSION',
        workerTrackId: 92,
        confidenceScore: 0.96,
        snapshotUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        status: 'RESOLVED',
        resolvedBy: 'Safety Supervisor Mark D.',
        timestamp: new Date(Date.now() - 1000 * 60 * 85)
      }
    ];
  }

  async create(data) {
    const item = {
      _id: 'viol_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      cameraId: data.cameraId,
      zoneName: data.zoneName || 'General Monitored Zone',
      violationType: data.violationType,
      workerTrackId: Number(data.workerTrackId),
      confidenceScore: Number(data.confidenceScore || 0.9),
      snapshotUrl: data.snapshotUrl || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
      status: data.status || 'UNREVIEWED',
      resolvedBy: data.resolvedBy || null,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
    };
    this.violations.unshift(item);
    return item;
  }

  async find(filter = {}) {
    let list = [...this.violations];
    if (filter.cameraId) list = list.filter(v => v.cameraId === filter.cameraId);
    if (filter.violationType) list = list.filter(v => v.violationType === filter.violationType);
    if (filter.status) list = list.filter(v => v.status === filter.status);
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  async findById(id) {
    return this.violations.find(v => v._id.toString() === id.toString()) || null;
  }

  async findByIdAndUpdate(id, updates) {
    const item = await this.findById(id);
    if (!item) return null;
    Object.assign(item, updates);
    return item;
  }

  async countDocuments(filter = {}) {
    const list = await this.find(filter);
    return list.length;
  }
}

const memoryStore = new MemoryViolationStore();

// Wrapper that routes to Mongoose if DB connected, or memoryStore if running locally
const ViolationService = {
  isMongooseActive() {
    return mongoose.connection.readyState === 1;
  },

  async create(data) {
    if (this.isMongooseActive()) {
      return await MongooseViolation.create(data);
    }
    return await memoryStore.create(data);
  },

  async find(query = {}) {
    if (this.isMongooseActive()) {
      return await MongooseViolation.find(query).sort({ timestamp: -1 });
    }
    return await memoryStore.find(query);
  },

  async findById(id) {
    if (this.isMongooseActive()) {
      return await MongooseViolation.findById(id);
    }
    return await memoryStore.findById(id);
  },

  async findByIdAndUpdate(id, update, options = {}) {
    if (this.isMongooseActive()) {
      return await MongooseViolation.findByIdAndUpdate(id, update, { new: true, ...options });
    }
    return await memoryStore.findByIdAndUpdate(id, update);
  },

  async countDocuments(filter = {}) {
    if (this.isMongooseActive()) {
      return await MongooseViolation.countDocuments(filter);
    }
    return await memoryStore.countDocuments(filter);
  }
};

module.exports = {
  MongooseViolation,
  violationSchema,
  ViolationService
};
