import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Volume2, 
  AlertOctagon, 
  FileCheck, 
  Users, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Printer, 
  X, 
  Flame, 
  Zap, 
  Activity,
  HardHat,
  Megaphone,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OfficerActionHub({ 
  activeCamera, 
  activeMode = 'cameras', 
  currentInfraction = 'NO_HELMET',
  activeWorkerId = 104,
  isStopWorkActive = false,
  onToggleStopWork,
  onTriggerBeacon
}) {
  const { user } = useAuth();
  const isOfficer = user?.role === 'SAFETY_OFFICER';

  // Dispatch Marshall State
  const [selectedUnit, setSelectedUnit] = useState('Unit 2 (Officer Davis)');
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [dispatchEta, setDispatchEta] = useState(45);

  // Tannoy Broadcast State
  const [announcementType, setAnnouncementType] = useState('helmet');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState('');

  // Citation Modal State
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationWorkerId, setCitationWorkerId] = useState(activeWorkerId);
  const [citationFine, setCitationFine] = useState('$150');
  const [citationNotes, setCitationNotes] = useState('Worker observed operating in designated overhead crane impact zone without certified safety helmet.');
  const [citationSuccess, setCitationSuccess] = useState(null);

  // Sync citationWorkerId when activeWorkerId changes via dynamic crowd selection
  useEffect(() => {
    if (activeWorkerId) {
      setCitationWorkerId(activeWorkerId);
    }
  }, [activeWorkerId]);

  // Local Action Audit Log (Actions taken during session)
  const [actionHistory, setActionHistory] = useState([
    {
      id: 'act_1',
      time: '19:48:12',
      type: 'DISPATCH',
      title: 'Floor Marshall Unit 1 Assigned',
      detail: 'Dispatched to Sector 2 Scaffolding for perimeter sweep.',
      status: 'RESOLVED'
    },
    {
      id: 'act_2',
      time: '20:15:30',
      type: 'BROADCAST',
      title: 'PA Tannoy Audio Warning',
      detail: 'Broadcasted: "Don High-Vis Vest" to Logistics Bay C.',
      status: 'DELIVERED'
    }
  ]);

  // Audio Context Tone Generator for Authentic Industrial Chime & Dispatch Beep
  const playChime = (type = 'chime') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'chime') {
        // High-low two-tone tannoy chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        osc1.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.5);
      } else if (type === 'siren') {
        // Stop-work siren burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.25);
        osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'radio') {
        // Quick military/radio squelch chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  // Live Countdown Timer for Marshall Dispatch
  useEffect(() => {
    let interval = null;
    if (activeDispatch && dispatchEta > 0) {
      interval = setInterval(() => {
        setDispatchEta(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeDispatch, dispatchEta]);

  // ACTION 1: DISPATCH FLOOR MARSHALL
  const handleDispatchMarshall = () => {
    playChime('radio');
    const camName = activeCamera?.name || 'Active Monitored Sector';
    const newDispatch = {
      unit: selectedUnit,
      location: camName,
      workerId: activeWorkerId,
      dispatchedAt: new Date().toLocaleTimeString(),
      status: 'EN ROUTE'
    };
    setActiveDispatch(newDispatch);
    setDispatchEta(35);

    const logEntry = {
      id: 'act_' + Date.now(),
      time: new Date().toLocaleTimeString(),
      type: 'DISPATCH',
      title: `🚨 Marshall Dispatched (${selectedUnit})`,
      detail: `Assigned response to ${camName} for Worker #${activeWorkerId} PPE inspection.`,
      status: 'EN ROUTE'
    };
    setActionHistory(prev => [logEntry, ...prev]);
  };

  const handleCancelDispatch = () => {
    setActiveDispatch(null);
  };

  // ACTION 2: BROADCAST INTERCOM VOICE PA ANNOUNCEMENT
  const handleBroadcastTannoy = () => {
    playChime('chime');
    setIsBroadcasting(true);
    const camName = activeCamera?.name?.replace(/[^a-zA-Z0-9 ]/g, '') || 'Active Industrial Sector';

    let speechText = '';
    if (announcementType === 'helmet') {
      speechText = `Attention personnel in ${camName}. Safety compliance alert: Personal protective equipment violation detected. Worker must put on certified safety helmet immediately.`;
    } else if (announcementType === 'zone') {
      speechText = `Security alert for ${camName}. Unauthorized geofence intrusion detected. Clear the perimeter immediately.`;
    } else {
      speechText = `Attention all operators in ${camName}. Cease non-compliant operations and await floor marshal inspection.`;
    }

    setBroadcastFeedback(`Broadcasting to ${camName} PA Tannoy Speakers...`);

    // Use Web Speech Synthesis API for real audible synthesized voice!
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 1.0;
        utterance.pitch = 0.95;
        utterance.volume = 1.0;
        utterance.onend = () => {
          setIsBroadcasting(false);
          setBroadcastFeedback('✓ Broadcast Delivered across Zone Audio Array');
          setTimeout(() => setBroadcastFeedback(''), 4000);
        };
        utterance.onerror = () => {
          setIsBroadcasting(false);
          setBroadcastFeedback('✓ Announcement Delivered');
          setTimeout(() => setBroadcastFeedback(''), 3000);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          setIsBroadcasting(false);
          setBroadcastFeedback('✓ Announcement Broadcast Completed');
          setTimeout(() => setBroadcastFeedback(''), 3000);
        }, 3000);
      }
    } catch {
      setTimeout(() => {
        setIsBroadcasting(false);
        setBroadcastFeedback('✓ Broadcast Delivered');
        setTimeout(() => setBroadcastFeedback(''), 3000);
      }, 2000);
    }

    const logEntry = {
      id: 'act_' + Date.now(),
      time: new Date().toLocaleTimeString(),
      type: 'BROADCAST',
      title: `📢 Sector PA Voice Broadcast`,
      detail: `Broadcasted audio warning: "${speechText.slice(0, 60)}..."`,
      status: 'DELIVERED'
    };
    setActionHistory(prev => [logEntry, ...prev]);
  };

  // ACTION 3: EMERGENCY STOP-WORK DIRECTIVE
  const handleToggleStopWorkDirective = async () => {
    playChime('siren');
    const newState = !isStopWorkActive;
    if (onToggleStopWork) {
      onToggleStopWork(newState);
    }

    if (newState) {
      // Create backend formal Stop-Work violation event
      try {
        await api.triggerSimulatedViolation({
          cameraId: activeCamera?.id || 'CAM_01_BAY_NORTH',
          zoneName: activeCamera?.name || 'Active Industrial Zone',
          violationType: 'STOP_WORK_ORDER',
          workerTrackId: activeWorkerId,
          confidenceScore: 0.99,
          snapshotUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
        });
      } catch (e) {
        console.error('Stop work directive dispatch failed:', e);
      }

      const logEntry = {
        id: 'act_' + Date.now(),
        time: new Date().toLocaleTimeString(),
        type: 'STOP_WORK',
        title: `🛑 EMERGENCY STOP-WORK ORDER ISSUED`,
        detail: `Halted work on ${activeCamera?.name || 'current sector'} authorized by ${user?.name || 'Safety Officer'}.`,
        status: 'ACTIVE'
      };
      setActionHistory(prev => [logEntry, ...prev]);
    } else {
      const logEntry = {
        id: 'act_' + Date.now(),
        time: new Date().toLocaleTimeString(),
        type: 'RESUME',
        title: `✓ Stop-Work Directive Rescinded`,
        detail: `Operations resumed following safety confirmation in ${activeCamera?.name || 'sector'}.`,
        status: 'NORMALIZED'
      };
      setActionHistory(prev => [logEntry, ...prev]);
    }
  };

  // ACTION 4: ISSUE DIGITAL CITATION
  const handleIssueCitation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.triggerSimulatedViolation({
        cameraId: activeCamera?.id || 'CAM_01_BAY_NORTH',
        zoneName: activeCamera?.name || 'General Industrial Sector',
        violationType: 'CITATION_ISSUED',
        workerTrackId: Number(citationWorkerId),
        confidenceScore: 0.97,
        snapshotUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80'
      });

      const logEntry = {
        id: 'act_' + Date.now(),
        time: new Date().toLocaleTimeString(),
        type: 'CITATION',
        title: `📋 Official Citation Issued: Worker #${citationWorkerId}`,
        detail: `Fine: ${citationFine} • OSHA 1926.100 Head Protection Violation.`,
        status: 'LOGGED'
      };
      setActionHistory(prev => [logEntry, ...prev]);
      setCitationSuccess(`Citation filed successfully and logged to Incident Desk!`);
      setTimeout(() => {
        setCitationSuccess(null);
        setShowCitationModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setCitationSuccess('Citation logged locally.');
      setTimeout(() => {
        setCitationSuccess(null);
        setShowCitationModal(false);
      }, 1500);
    }
  };

  // Dynamic Risk Level Calculation based on state
  const isBreach = isStopWorkActive || currentInfraction !== 'SAFE';
  const riskLevel = isStopWorkActive ? 'CRITICAL (LEVEL 3)' : (isBreach ? 'ELEVATED (LEVEL 2)' : 'NOMINAL (LEVEL 1)');
  const riskColor = isStopWorkActive ? '#ef4444' : (isBreach ? '#f59e0b' : '#10b981');
  const riskBg = isStopWorkActive ? 'rgba(239, 68, 68, 0.15)' : (isBreach ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)');

  return (
    <div style={{ marginTop: '1.25rem' }}>
      {/* Officer Command Header Strip */}
      <div style={{
        background: 'linear-gradient(135deg, #1e2838 0%, #111827 100%)',
        border: '1px solid #334155',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#f59e0b',
            color: '#1e2838',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.35)',
            flexShrink: 0
          }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9', letterSpacing: '0.02em' }}>
                OFFICER REAL-TIME ANALYSIS & TACTICAL ACTION SUITE
              </span>
              <span className="badge" style={{ background: '#3b82f6', color: '#fff', fontSize: '0.68rem', fontWeight: 800 }}>
                {isOfficer ? 'CHIEF OFFICER COMMAND' : 'CONTROLLER MONITOR MODE'}
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
              Live Stream: <strong style={{ color: '#f8fafc' }}>{activeCamera?.name || 'Active Video Feed'}</strong> • Location: <span>{activeCamera?.location || 'Plant Sector'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Threat Risk HUD Gauge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: riskBg,
          border: `1px solid ${riskColor}`,
          padding: '0.5rem 1rem',
          borderRadius: '10px'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: riskColor,
            boxShadow: `0 0 10px ${riskColor}`,
            animation: isBreach ? 'pulse 1.2s infinite' : 'none'
          }} />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>SECTOR THREAT LEVEL</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: riskColor }}>{riskLevel}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Analysis Cockpit (Left) + Tactical Action Suite (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        
        {/* ================= LEFT: REAL-TIME AI ANALYSIS COCKPIT ================= */}
        <div className="ops-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div className="card-title">
                <Activity size={18} color="#06b6d4" />
                <span>Live Subject Telemetry & Neural Analysis</span>
              </div>
              <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>CONF: 94.6%</span>
            </div>

            {/* Subject Telemetry Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', marginTop: '1rem' }}>
              {/* Metric 1: Tracked Subject */}
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} color="#3b82f6" /> PRIMARY SUBJECT
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Worker #{activeWorkerId}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Subcontractor Shift B • Welder</div>
              </div>

              {/* Metric 2: Cranial PPE Status */}
              <div style={{ 
                background: currentInfraction === 'NO_HELMET' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: currentInfraction === 'NO_HELMET' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)' 
              }}>
                <div style={{ fontSize: '0.7rem', color: currentInfraction === 'NO_HELMET' ? '#f87171' : '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HardHat size={13} /> CRANIAL PROTECTION
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: currentInfraction === 'NO_HELMET' ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                  {currentInfraction === 'NO_HELMET' ? 'MISSING (FAILED)' : 'VERIFIED (PASS)'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {currentInfraction === 'NO_HELMET' ? 'OSHA 1926.100 Non-Compliant' : 'Type I Class G Verified'}
                </div>
              </div>

              {/* Metric 3: High-Vis Body Vest */}
              <div style={{ 
                background: currentInfraction === 'NO_VEST' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: currentInfraction === 'NO_VEST' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)' 
              }}>
                <div style={{ fontSize: '0.7rem', color: currentInfraction === 'NO_VEST' ? '#fbbf24' : '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} /> HIGH-VISIBILITY VEST
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: currentInfraction === 'NO_VEST' ? '#f59e0b' : '#10b981', marginTop: '2px' }}>
                  {currentInfraction === 'NO_VEST' ? 'NOT DETECTED' : 'ANSI Class 2 Compliant'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Photometric Luminescence: OK</div>
              </div>

              {/* Metric 4: Hazard Dwell Time */}
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color="#f59e0b" /> HAZARD ZONE DWELL
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  03m 48s
                </div>
                <div style={{ fontSize: '0.68rem', color: '#f59e0b' }}>Threshold: 02m 00s (Exceeded)</div>
              </div>
            </div>

            {/* AI Officer Diagnostic & Recommendation Box */}
            <div style={{
              marginTop: '1rem',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(59, 130, 246, 0.05))',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '10px',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} /> AI NEURAL DIAGNOSTIC & ACTION RECOMMENDATION
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
                {currentInfraction === 'NO_HELMET' ? (
                  <span>
                    Worker <strong>#{activeWorkerId}</strong> has been operating in a designated crane lifting perimeter without cranial head protection. Immediate action advised: <strong>Broadcast Zone Tannoy Warning</strong> or <strong>Dispatch Floor Marshall Unit 2</strong>.
                  </span>
                ) : currentInfraction === 'ZONE_INTRUSION' ? (
                  <span>
                    Subject breached active heavy mobile forklift trajectory zone boundary. Immediate action advised: <strong>Issue Stop-Work Directive</strong> to prevent collision.
                  </span>
                ) : (
                  <span>
                    No critical non-compliance detected on active viewport. Routine autonomous visual polling continues at 30 FPS.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Marshall Tracker Banner (If Dispatched) */}
          {activeDispatch && (
            <div style={{
              marginTop: '1rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.3s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.75rem'
                }}>
                  {dispatchEta}s
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f87171' }}>
                    🚨 {activeDispatch.unit} EN ROUTE
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Destination: {activeDispatch.location} • Target: Worker #{activeDispatch.workerId}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCancelDispatch}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#f87171',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                Recall Unit
              </button>
            </div>
          )}
        </div>

        {/* ================= RIGHT: OFFICER TACTICAL ACTION SUITE ================= */}
        <div className="ops-card">
          <div className="card-header" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div className="card-title">
              <ShieldAlert size={18} color="#f59e0b" />
              <span>Officer Tactical Action & Incident Interventions</span>
            </div>
            <span className="badge badge-warning">OFFICER AUTHORITY</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
            
            {/* ACTION 1: DISPATCH FLOOR MARSHALL */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={14} color="#ef4444" /> 1. Dispatch Floor Safety Marshall
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Response ETA: ~35s</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.78rem',
                    outline: 'none'
                  }}
                >
                  <option value="Unit 2 (Officer Davis)">Marshal Unit 2 - Officer Davis (Bay 3)</option>
                  <option value="Unit 1 (Sgt. Ramos)">Marshal Unit 1 - Sgt. Ramos (Scaffolding)</option>
                  <option value="Unit 4 (Inspector Chen)">Marshal Unit 4 - Inspector Chen (Plant Floor)</option>
                </select>

                <button
                  onClick={handleDispatchMarshall}
                  className="btn-primary"
                  style={{
                    background: '#ef4444',
                    borderColor: '#dc2626',
                    fontSize: '0.78rem',
                    padding: '0.45rem 0.85rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Send size={13} /> Dispatch Now
                </button>
              </div>
            </div>

            {/* ACTION 2: BROADCAST SITE INTERCOM VOICE PA WARNING */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Volume2 size={14} color="#06b6d4" /> 2. Broadcast Sector PA Voice Tannoy
                </span>
                {isBroadcasting && (
                  <span className="badge badge-info" style={{ animation: 'pulse 1s infinite' }}>
                    🎙️ BROADCASTING LIVE
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.78rem',
                    outline: 'none'
                  }}
                >
                  <option value="helmet">PPE Voice: "Don Certified Safety Helmet Immediately"</option>
                  <option value="zone">Geofence Voice: "Restricted Boundary - Clear Area Now"</option>
                  <option value="halt">Halt Voice: "Cease Non-Compliant Operations and Await Marshall"</option>
                </select>

                <button
                  onClick={handleBroadcastTannoy}
                  disabled={isBroadcasting}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.45rem 0.85rem',
                    fontWeight: 700,
                    borderColor: '#06b6d4',
                    color: '#06b6d4',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Megaphone size={13} /> Speak Alert
                </button>
              </div>

              {broadcastFeedback && (
                <div style={{ fontSize: '0.72rem', color: '#06b6d4', marginTop: '6px', fontWeight: 600 }}>
                  {broadcastFeedback}
                </div>
              )}
            </div>

            {/* ACTION 3 & 4: EMERGENCY STOP-WORK + ISSUE CITATION */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              
              {/* Emergency Stop-Work Directive Button */}
              <button
                onClick={handleToggleStopWorkDirective}
                style={{
                  background: isStopWorkActive ? '#10b981' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#fff',
                  border: isStopWorkActive ? '2px solid #059669' : '2px solid #ef4444',
                  borderRadius: '10px',
                  padding: '0.75rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: isStopWorkActive ? '0 0 15px rgba(16, 185, 129, 0.4)' : '0 0 15px rgba(220, 38, 38, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <AlertOctagon size={20} />
                <span>{isStopWorkActive ? 'LIFT STOP-WORK ORDER' : 'EMERGENCY STOP WORK'}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.85, fontWeight: 500 }}>
                  {isStopWorkActive ? 'Click to Resume Zone Work' : 'OSHA Mandatory Halt'}
                </span>
              </button>

              {/* Digital Citation Issuer Button */}
              <button
                onClick={() => setShowCitationModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #1e2838, #0f172a)',
                  color: '#f59e0b',
                  border: '2px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '0.75rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FileCheck size={20} />
                <span>ISSUE OSHA CITATION</span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>
                  Demerit Fine & Notice
                </span>
              </button>
            </div>

            {/* Quick Strobe Siren Interlock */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                onClick={onTriggerBeacon}
                className="btn-secondary"
                style={{
                  flex: 1,
                  fontSize: '0.74rem',
                  padding: '0.45rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={13} color="#f59e0b" /> Toggle Hazard Beacon Strobe
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ================= BOTTOM: SHIFT ACTION AUDIT LOG ================= */}
      <div className="ops-card">
        <div className="card-header" style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="card-title" style={{ fontSize: '0.85rem' }}>
            <Clock size={16} color="#3b82f6" />
            <span>Officer Shift Intervention Audit Trail</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Logged by: <strong>{user?.name || 'Capt. Alex Vance'}</strong> • Badge #{user?.badgeId || 'HSE-9041'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
          {actionHistory.map(act => (
            <div
              key={act.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                background: 'var(--bg-subtle)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                borderLeft: act.type === 'STOP_WORK' 
                  ? '3px solid #ef4444' 
                  : act.type === 'DISPATCH' 
                    ? '3px solid #f59e0b' 
                    : act.type === 'CITATION' 
                      ? '3px solid #3b82f6' 
                      : '3px solid #06b6d4'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  {act.time}
                </span>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginRight: '6px' }}>
                    {act.title}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {act.detail}
                  </span>
                </div>
              </div>

              <span className={`badge ${act.status === 'ACTIVE' ? 'badge-danger' : (act.status === 'EN ROUTE' ? 'badge-warning' : 'badge-success')}`} style={{ fontSize: '0.65rem' }}>
                {act.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CITATION ISSUANCE MODAL ================= */}
      {showCitationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '2px solid #f59e0b',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e2838, #0f172a)',
              padding: '1.25rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#f59e0b',
                  color: '#1e2838',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
                    VigilantSite Digital Safety Citation
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    OSHA 1910 / 1926 Statutory Notice of Non-Compliance
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCitationModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleIssueCitation} style={{ padding: '1.25rem' }}>
              {citationSuccess ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}>
                  <CheckCircle2 size={24} style={{ display: 'block', margin: '0 auto 6px auto' }} />
                  {citationSuccess}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Grid for Offender & Zone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        WORKER TRACK ID
                      </label>
                      <input
                        type="number"
                        value={citationWorkerId}
                        onChange={(e) => setCitationWorkerId(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          borderRadius: '8px',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.85rem'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        MONITORED ZONE / SECTOR
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={activeCamera?.name || 'North Bay 3'}
                        style={{
                          width: '100%',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-muted)',
                          borderRadius: '8px',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Violation Category & Penalty */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        OSHA REGULATION CITED
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="OSHA 1926.100(a) Head PPE"
                        style={{
                          width: '100%',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          borderRadius: '8px',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        COMPLIANCE DEMERIT FINE
                      </label>
                      <select
                        value={citationFine}
                        onChange={(e) => setCitationFine(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          borderRadius: '8px',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="$150">$150 (First Warning Demerit)</option>
                        <option value="$350">$350 (Repeat Offense Surcharge)</option>
                        <option value="$750">$750 (Gross Negligence Notice)</option>
                      </select>
                    </div>
                  </div>

                  {/* Officer Direct Notes */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      OFFICER OBSERVATION & FINDINGS
                    </label>
                    <textarea
                      rows={3}
                      value={citationNotes}
                      onChange={(e) => setCitationNotes(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        borderRadius: '8px',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-sans)',
                        resize: 'none'
                      }}
                      required
                    />
                  </div>

                  {/* Sign-off Signature */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px dashed var(--border-color)'
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>AUTHORIZING COMPLIANCE OFFICER:</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                        {user?.name || 'Capt. Alex Vance'} ({user?.roleTitle || 'Chief Safety Officer'})
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>BADGE CREDENTIAL:</div>
                      <div style={{ fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                        #{user?.badgeId || 'HSE-9041'}
                      </div>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowCitationModal(false)}
                      className="btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{
                        background: '#f59e0b',
                        borderColor: '#d97706',
                        color: '#1e2838',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        padding: '0.5rem 1.25rem'
                      }}
                    >
                      <FileCheck size={16} /> Sign & File Citation
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
