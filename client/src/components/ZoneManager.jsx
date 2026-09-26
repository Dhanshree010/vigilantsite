import React, { useState, useEffect } from 'react';
import { MapPin, Plus, ShieldAlert, Check, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function ZoneManager() {
  const [zones, setZones] = useState([
    {
      id: 'zone_01',
      name: 'Zone-A Heavy Machinery Perimeter',
      cameraId: 'CAM_01_BAY_NORTH',
      dangerLevel: 'CRITICAL',
      requiredPPE: ['HARDHAT', 'SAFETY_VEST']
    },
    {
      id: 'zone_02',
      name: 'Scaffold Fall-Risk Boundary',
      cameraId: 'CAM_02_SCAFFOLDING',
      dangerLevel: 'HIGH',
      requiredPPE: ['HARDHAT', 'SAFETY_VEST', 'HARNESS']
    }
  ]);

  const [newZoneName, setNewZoneName] = useState('');
  const [selectedCam, setSelectedCam] = useState('CAM_01_BAY_NORTH');

  useEffect(() => {
    api.getZones().then(res => {
      if (res?.data?.length) {
        setZones(res.data);
      }
    }).catch(() => {});
  }, []);

  const handleCreateZone = (e) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const newZone = {
      id: 'zone_' + Date.now(),
      name: newZoneName,
      cameraId: selectedCam,
      dangerLevel: 'CRITICAL',
      polygon: [
        { x: 0.25, y: 0.35 },
        { x: 0.75, y: 0.35 },
        { x: 0.80, y: 0.80 },
        { x: 0.20, y: 0.80 }
      ],
      requiredPPE: ['HARDHAT', 'SAFETY_VEST']
    };

    api.saveZone(newZone).then(() => {
      setZones(prev => [...prev, newZone]);
      setNewZoneName('');
    }).catch(err => {
      console.error(err);
      setZones(prev => [...prev, newZone]);
      setNewZoneName('');
    });
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        {/* Zone Creator */}
        <div className="ops-card">
          <div className="card-header">
            <div className="card-title">
              <Plus size={18} color="#06b6d4" />
              <span>Define New Safety Zone</span>
            </div>
          </div>

          <form onSubmit={handleCreateZone} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                ZONE NAME / IDENTIFIER
              </label>
              <input
                type="text"
                placeholder="e.g. Forklift High-Speed Crossing"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                ASSOCIATED CAMERA NODE
              </label>
              <select
                value={selectedCam}
                onChange={(e) => setSelectedCam(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="CAM_01_BAY_NORTH">CAM_01_BAY_NORTH (North Loading Dock)</option>
                <option value="CAM_02_SCAFFOLDING">CAM_02_SCAFFOLDING (Scaffolding Sector 2)</option>
                <option value="CAM_03_ASSEMBLY_LINE">CAM_03_ASSEMBLY_LINE (Robotic Cell 4)</option>
                <option value="CAM_04_FORKLIFT_LANE">CAM_04_FORKLIFT_LANE (Logistics Lane)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                MANDATORY SAFETY PROTOCOL
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-danger">HARDHAT REQUIRED</span>
                <span className="badge badge-warning">HIGH-VIS VEST</span>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
              <Check size={16} /> Save Geo-Fence Perimeter
            </button>
          </form>
        </div>

        {/* Existing Zones List */}
        <div className="ops-card">
          <div className="card-header">
            <div className="card-title">
              <MapPin size={18} color="#ef4444" />
              <span>Configured Restricted Geofences</span>
            </div>
            <span className="badge badge-info">{zones.length} ACTIVE ZONES</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {zones.map(z => (
              <div 
                key={z.id}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.9rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{z.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Camera Anchor: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-brand)', fontWeight: 600 }}>{z.cameraId}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-danger">POLYGON ENFORCED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
