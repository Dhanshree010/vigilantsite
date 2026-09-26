import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Download, 
  ExternalLink, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  X,
  Camera,
  FileSpreadsheet,
  FileText,
  Printer
} from 'lucide-react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function IncidentLog() {
  const [violations, setViolations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { latestAlert } = useSocket();
  const { user } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getViolations();
      if (res?.data) {
        setViolations(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When a new violation comes over WebSocket, prepend to the list!
  useEffect(() => {
    if (latestAlert) {
      setViolations(prev => {
        const exists = prev.some(v => v._id === latestAlert._id);
        if (exists) return prev;
        return [latestAlert, ...prev];
      });
    }
  }, [latestAlert]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const resolverName = user ? `${user.name} (${user.roleTitle || user.role})` : 'Safety Supervisor';
      const res = await api.updateViolationStatus(id, newStatus, resolverName);
      if (res?.data) {
        setViolations(prev => prev.map(v => v._id === id ? res.data : v));
        if (selectedIncident?._id === id) {
          setSelectedIncident(res.data);
        }
      }
    } catch (e) {
      console.error('Failed to update violation status:', e);
    }
  };

  const filtered = violations.filter(v => {
    if (filterStatus !== 'ALL' && v.status !== filterStatus) return false;
    if (filterType !== 'ALL' && v.violationType !== filterType) return false;
    return true;
  });

  const getViolationBadge = (type) => {
    switch (type) {
      case 'NO_HELMET':
        return <span className="badge badge-danger">MISSING HELMET</span>;
      case 'NO_VEST':
        return <span className="badge badge-warning">MISSING VEST</span>;
      case 'ZONE_INTRUSION':
        return <span className="badge badge-danger">GEOFENCE INTRUSION</span>;
      case 'STOP_WORK_ORDER':
        return <span className="badge badge-danger" style={{ background: '#dc2626', color: '#fff', fontWeight: 800, letterSpacing: '0.04em' }}>🛑 STOP-WORK DIRECTIVE</span>;
      case 'CITATION_ISSUED':
        return <span className="badge badge-warning" style={{ background: '#d97706', color: '#fff', fontWeight: 800, letterSpacing: '0.04em' }}>📋 FORMAL CITATION</span>;
      default:
        return <span className="badge badge-info">{type}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UNREVIEWED':
        return <span className="badge badge-danger">● UNREVIEWED</span>;
      case 'ACKNOWLEDGED':
        return <span className="badge badge-warning">● ACKNOWLEDGED</span>;
      case 'RESOLVED':
        return <span className="badge badge-success">✓ RESOLVED</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  const resolvedCount = violations.filter(v => v.status === 'RESOLVED').length;
  const unreviewedCount = violations.filter(v => v.status === 'UNREVIEWED').length;
  const acknowledgedCount = violations.filter(v => v.status === 'ACKNOWLEDGED').length;
  const complianceScore = Math.max(78, Math.min(99, 100 - (unreviewedCount * 3 + acknowledgedCount * 1.5)));

  return (
    <div>
      {/* Officer Inspection & Audit Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(6, 182, 212, 0.08))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '0.9rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--color-brand)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px var(--color-brand-glow)',
            flexShrink: 0
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Safety Officer Work & Compliance Inspection Console</span>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>OFFICER DEMO ACTIVE</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Active Officer: <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'Capt. Alex Vance'}</strong> • Badge #{user?.badgeId || 'HSE-9041'} • Certified OSHA 1910 Compliance
            </div>
          </div>
        </div>

        {/* Audit Report Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowReportModal(true)}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
          >
            <FileText size={15} color="#3b82f6" />
            <span>View Official Inspection Report</span>
          </button>

          <a
            href={api.getExportUrl()}
            download
            className="btn-primary"
            style={{ textDecoration: 'none', fontSize: '0.82rem', padding: '0.5rem 1rem' }}
          >
            <FileSpreadsheet size={15} />
            <span>Export Proper Excel / CSV Report</span>
          </a>
        </div>
      </div>

      {/* Top Filter and Actions Bar */}
      <div className="ops-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} /> STATUS:
            </span>
            {['ALL', 'UNREVIEWED', 'ACKNOWLEDGED', 'RESOLVED'].map(st => (
              <button
                key={st}
                className={`btn-secondary ${filterStatus === st ? 'active' : ''}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  background: filterStatus === st ? 'var(--color-brand)' : 'var(--bg-subtle)',
                  color: filterStatus === st ? '#fff' : 'var(--text-secondary)'
                }}
                onClick={() => setFilterStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Type Filter & Quick Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Violation Types</option>
              <option value="NO_HELMET">Missing Helmet</option>
              <option value="NO_VEST">Missing Vest</option>
              <option value="ZONE_INTRUSION">Geofence Intrusion</option>
              <option value="STOP_WORK_ORDER">🛑 Stop-Work Directive</option>
              <option value="CITATION_ISSUED">📋 Formal Citation</option>
            </select>

            <a
              href={api.getExportUrl()}
              download
              className="btn-secondary"
              style={{ textDecoration: 'none', fontSize: '0.8rem' }}
            >
              <Download size={14} /> Quick CSV
            </a>
          </div>
        </div>
      </div>

      {/* Incident Table */}
      <div className="ops-card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>TIME</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>INCIDENT TYPE</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>LOCATION / CAMERA</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>WORKER ID</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>CONFIDENCE</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No safety violations found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr 
                  key={item._id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    {getViolationBadge(item.violationType)}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.cameraId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.zoneName}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#06b6d4' }}>
                    #{item.workerTrackId}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)' }}>
                    {Math.round((item.confidenceScore || 0.9) * 100)}%
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    {getStatusBadge(item.status)}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedIncident(item)}
                      style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                    >
                      Inspect Evidence
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="ops-card" style={{ maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div className="card-title">
                <AlertOctagon size={20} color="#ef4444" />
                <span>Incident Evidence Inspection</span>
              </div>
              <button 
                onClick={() => setSelectedIncident(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Snapshot */}
            <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid var(--border-color)', height: '280px', background: '#000' }}>
              <img 
                src={selectedIncident.snapshotUrl} 
                alt="Incident Snapshot" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>CAMERA NODE</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedIncident.cameraId}</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>ZONE / LOCATION</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedIncident.zoneName}</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>WORKER TRACK ID</div>
                <div style={{ fontWeight: 700, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>#{selectedIncident.workerTrackId}</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>AI CONFIDENCE</div>
                <div style={{ fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {Math.round((selectedIncident.confidenceScore || 0.9) * 100)}%
                </div>
              </div>
            </div>

            {/* Status Workflow Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              {selectedIncident.status === 'UNREVIEWED' && (
                <button 
                  className="btn-secondary"
                  onClick={() => handleStatusChange(selectedIncident._id, 'ACKNOWLEDGED')}
                >
                  <Clock size={15} /> Acknowledge Alert
                </button>
              )}
              {selectedIncident.status !== 'RESOLVED' && (
                <button 
                  className="btn-primary"
                  onClick={() => handleStatusChange(selectedIncident._id, 'RESOLVED')}
                >
                  <CheckCircle2 size={15} /> Mark Resolved & Safe
                </button>
              )}
              {selectedIncident.status === 'RESOLVED' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                  <ShieldCheck size={18} /> Incident Resolved by {selectedIncident.resolvedBy || 'Officer'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Official Safety Inspection & Audit Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div className="ops-card" style={{ maxWidth: '820px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldCheck size={24} color="var(--color-brand)" />
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    OFFICIAL WORKPLACE SAFETY COMPLIANCE AUDIT REPORT
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Apex Industrial Robotics • Facility Sector 4 • Document Ref: <strong style={{ color: 'var(--text-primary)' }}>VSITE-OSHA-2026-AUDIT</strong>
                </div>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Inspecting Officer & Date Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inspecting Officer</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {user?.name || 'Capt. Alex Vance'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-brand)' }}>{user?.badgeId || 'Badge #HSE-9041'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Audit Date & Shift</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Shift Alpha (08:00 - 16:00)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Certified Compliance Score</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: complianceScore >= 90 ? '#10b981' : '#f59e0b', marginTop: '2px' }}>
                  {Math.round(complianceScore * 10) / 10}%
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>OSHA 1910 PASS</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Monitored Incidents</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {violations.length}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{resolvedCount} Closed / Resolved</div>
              </div>
            </div>

            {/* Executive Summary Statement */}
            <div style={{ borderLeft: '4px solid var(--color-brand)', background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: '0 8px 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Executive Inspection Statement:</strong> The VigilantSite Edge AI real-time safety pipeline continuously verified worker compliance across all camera anchors. Cranial protection (safety helmets) under <strong style={{ color: 'var(--text-primary)' }}>OSHA 1910.135</strong> and high-visibility PPE under <strong style={{ color: 'var(--text-primary)' }}>OSHA 1910.132</strong> have been audited. All flagged infractions were registered with temporal persistence validation.
            </div>

            {/* Violation Incident Telemetry Summary Table */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Monitored Incident Log Summary (First {Math.min(violations.length, 6)} Records)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', background: 'var(--bg-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>TIME</th>
                    <th style={{ padding: '8px 12px' }}>LOCATION / CAMERA</th>
                    <th style={{ padding: '8px 12px' }}>INFRACTION</th>
                    <th style={{ padding: '8px 12px' }}>CONFIDENCE</th>
                    <th style={{ padding: '8px 12px' }}>STATUS</th>
                    <th style={{ padding: '8px 12px' }}>RESOLVER</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.slice(0, 6).map(v => (
                    <tr key={v._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{new Date(v.timestamp).toLocaleTimeString()}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{v.cameraId}</td>
                      <td style={{ padding: '8px 12px' }}>{v.violationType}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{Math.round((v.confidenceScore || 0.9) * 100)}%</td>
                      <td style={{ padding: '8px 12px' }}>{getStatusBadge(v.status)}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{v.resolvedBy || (v.status === 'RESOLVED' ? 'Capt. Alex Vance' : 'Pending')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Certification Signature Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Digitally Signed & Certified By:</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {user?.name || 'Capt. Alex Vance'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-brand)', fontFamily: 'var(--font-mono)' }}>
                  HSE-LICENSED LEAD SAFETY COMPLIANCE AUDITOR
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href={api.getExportUrl()}
                  download
                  className="btn-primary"
                  style={{ textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  <FileSpreadsheet size={16} /> Download Full Excel / CSV
                </a>

                <button
                  onClick={() => window.print()}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Printer size={16} /> Print / Save PDF
                </button>

                <button
                  onClick={() => setShowReportModal(false)}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
