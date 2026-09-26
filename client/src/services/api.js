const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL.replace(/\/$/, '')}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('visionops_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Authentication
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getAuthPresets() {
    const res = await fetch(`${API_BASE}/auth/presets`);
    return res.json();
  },

  // Violations
  async getViolations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/violations${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateViolationStatus(id, status, resolvedBy = 'Safety Supervisor') {
    const res = await fetch(`${API_BASE}/violations/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, resolvedBy })
    });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/violations/stats`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getExportUrl() {
    return `${API_BASE}/violations/export`;
  },

  // Cameras
  async getCameras() {
    const res = await fetch(`${API_BASE}/cameras`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Zones
  async getZones(cameraId) {
    const url = cameraId ? `${API_BASE}/zones?cameraId=${cameraId}` : `${API_BASE}/zones`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async saveZone(zoneData) {
    const res = await fetch(`${API_BASE}/zones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(zoneData)
    });
    return res.json();
  },

  // Trigger demo violation from UI
  async triggerSimulatedViolation(data) {
    const res = await fetch(`${API_BASE}/violations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
