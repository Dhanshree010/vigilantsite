import React, { useState, useEffect } from 'react';
import { Play, Pause, Zap, HardHat, Shirt, AlertTriangle, Terminal, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function SimulateFeed() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const triggerEvent = async (type, label) => {
    const randomTrack = Math.floor(Math.random() * 80) + 10;
    const randomConfidence = (0.88 + Math.random() * 0.1).toFixed(2);
    const cameras = ['CAM_01_BAY_NORTH', 'CAM_02_SCAFFOLDING', 'CAM_03_ASSEMBLY_LINE', 'CAM_04_FORKLIFT_LANE'];
    const chosenCam = cameras[Math.floor(Math.random() * cameras.length)];

    const payload = {
      cameraId: chosenCam,
      zoneName: 'Simulated Testing Sector',
      violationType: type,
      workerTrackId: randomTrack,
      confidenceScore: parseFloat(randomConfidence),
      snapshotUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
    };

    addLog(`Firing webhook for ${label} (Worker #${randomTrack} on ${chosenCam})...`);

    try {
      const res = await api.triggerSimulatedViolation(payload);
      if (res?.success) {
        addLog(`✅ Server acknowledged violation! ID: ${res.data?._id || 'OK'} -> Broadcasted via WebSocket.`);
      } else if (res?.status === 'debounced') {
        addLog(`⚠️ Debounce filter active: identical worker violation suppressed to prevent spam.`);
      } else {
        addLog(`Server responded with: ${JSON.stringify(res)}`);
      }
    } catch (e) {
      addLog(`❌ Transmission failed: ${e.message}`);
    }
  };

  // Continuous auto loop
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        const types = [
          { type: 'NO_HELMET', label: 'Missing Hardhat' },
          { type: 'NO_VEST', label: 'Missing Safety Vest' },
          { type: 'ZONE_INTRUSION', label: 'Danger Zone Breach' }
        ];
        const chosen = types[Math.floor(Math.random() * types.length)];
        triggerEvent(chosen.type, chosen.label);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div>
      <div className="ops-card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Zap size={20} color="#06b6d4" />
            <span>Interactive Edge AI Test Console</span>
          </div>
          <button
            className={isRunning ? "btn-danger" : "btn-primary"}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause size={15} /> : <Play size={15} />}
            {isRunning ? "Stop Continuous Stream" : "Start Continuous Stream (Every 4s)"}
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Test the entire end-to-end pipeline instantly. Clicking any trigger below simulates an edge worker detecting a worker, validating temporal persistence over 15+ frames, and transmitting an HTTP webhook to the Express backend, which immediately emits via WebSocket to the live Incident Desk and audio alert pipeline.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => triggerEvent('NO_HELMET', 'No Hardhat')}
            className="btn-secondary"
            style={{ padding: '0.9rem', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.4)' }}
          >
            <HardHat size={18} color="#ef4444" />
            <span>Simulate No Hardhat</span>
          </button>

          <button
            onClick={() => triggerEvent('NO_VEST', 'Missing Vest')}
            className="btn-secondary"
            style={{ padding: '0.9rem', justifyContent: 'center', borderColor: 'rgba(245, 158, 11, 0.4)' }}
          >
            <Shirt size={18} color="#f59e0b" />
            <span>Simulate Missing Vest</span>
          </button>

          <button
            onClick={() => triggerEvent('ZONE_INTRUSION', 'Geofence Intrusion')}
            className="btn-secondary"
            style={{ padding: '0.9rem', justifyContent: 'center', borderColor: 'rgba(59, 130, 246, 0.4)' }}
          >
            <AlertTriangle size={18} color="#3b82f6" />
            <span>Simulate Zone Intrusion</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Log */}
      <div className="ops-card" style={{ background: '#090d16', fontFamily: 'var(--font-mono)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          <Terminal size={14} color="#06b6d4" />
          <span>REAL-TIME PIPELINE DISPATCH LOGS</span>
        </div>

        <div style={{ minHeight: '160px', maxHeight: '240px', overflowY: 'auto', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>
              Ready. Click a trigger button above or run `python edge-ai/simulate_edge.py` in your terminal.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes('✅') ? '#34d399' : log.includes('❌') ? '#f87171' : '#94a3b8' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
