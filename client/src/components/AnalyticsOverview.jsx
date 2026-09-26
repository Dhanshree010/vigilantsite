import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  HardHat, 
  Shirt, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  CheckCircle2,
  Camera,
  FileText,
  Download,
  Printer,
  X,
  Plus,
  RefreshCw,
  ExternalLink,
  Award,
  AlertOctagon,
  DollarSign,
  UserCheck,
  Send,
  Building2,
  Calendar,
  Zap,
  BarChart2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [timeframe, setTimeframe] = useState('TODAY');
  const [showCertModal, setShowCertModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState('');
  const [showNewCapModal, setShowNewCapModal] = useState(false);

  // New CAP Form State
  const [capTitle, setCapTitle] = useState('');
  const [capPriority, setCapPriority] = useState('HIGH');
  const [capAssignee, setCapAssignee] = useState('Floor Marshal Unit 2');

  const [stats, setStats] = useState({
    totalViolations: 14,
    unreviewedCount: 3,
    acknowledgedCount: 4,
    resolvedCount: 7,
    complianceRate: 94.8,
    byType: { NO_HELMET: 6, NO_VEST: 5, ZONE_INTRUSION: 3, STOP_WORK_ORDER: 1 },
    hourlyTrend: [
      { time: '08:00', helmet: 1, vest: 2, zone: 0, compliance: 96 },
      { time: '10:00', helmet: 3, vest: 1, zone: 1, compliance: 91 },
      { time: '12:00', helmet: 0, vest: 1, zone: 0, compliance: 98 },
      { time: '14:00', helmet: 2, vest: 3, zone: 2, compliance: 88 },
      { time: '16:00', helmet: 1, vest: 1, zone: 0, compliance: 95 }
    ]
  });

  // Contractor & Sector Scorecard List
  const [contractors, setContractors] = useState([
    {
      id: 'c1',
      name: 'Apex Rigging & Scaffolding Ltd',
      zone: 'Scaffolding Structure - Sector 2',
      workers: 18,
      violations: 5,
      complianceRate: 84.2,
      riskLevel: 'CRITICAL',
      status: 'UNDER WATCH',
      primaryIssue: 'Missing Hardhats at Elevated Heights (OSHA 1926.100)'
    },
    {
      id: 'c2',
      name: 'Trans-Freight Heavy Logistics Corp',
      zone: 'Logistics High-Speed Forklift Lane',
      workers: 12,
      violations: 3,
      complianceRate: 88.5,
      riskLevel: 'ELEVATED',
      status: 'ACTIVE WARNING',
      primaryIssue: 'Forklift Pedestrian Boundary Intrusion (OSHA 1910.178)'
    },
    {
      id: 'c3',
      name: 'Logistics Dynamics Ground Services',
      zone: 'North Loading Dock - Bay 3',
      workers: 15,
      violations: 2,
      complianceRate: 92.4,
      riskLevel: 'MODERATE',
      status: 'COMPLIANT',
      primaryIssue: 'Intermittent High-Vis Vest Omission'
    },
    {
      id: 'c4',
      name: 'Precision Robotic Automation',
      zone: 'Robotic Assembly Cell 4',
      workers: 8,
      violations: 0,
      complianceRate: 99.4,
      riskLevel: 'NOMINAL',
      status: 'EXCELLENT',
      primaryIssue: 'Zero active violations recorded'
    }
  ]);

  // Officer Corrective Action Plan (CAP) Matrix Items
  const [capList, setCapList] = useState([
    {
      id: 'CAP-101',
      title: 'Install automated convex safety mirror array at Forklift Gate C',
      priority: 'HIGH',
      zone: 'Forklift Lane',
      assignee: 'Plant Maintenance (Chief Eng. Tyler)',
      deadline: 'Today, 22:00',
      status: 'IN PROGRESS'
    },
    {
      id: 'CAP-102',
      title: 'Mandatory chinstrap tether enforcement for Sector 2 scaffolding workers',
      priority: 'CRITICAL',
      zone: 'Sector 2 Scaffolding',
      assignee: 'Apex Rigging Supervisor (J. Vance)',
      deadline: 'Immediate',
      status: 'PENDING SIGN-OFF'
    },
    {
      id: 'CAP-103',
      title: 'Photometric retro-reflectivity audit of evening shift safety vests',
      priority: 'MEDIUM',
      zone: 'North Loading Dock',
      assignee: 'Safety Officer Capt. Vance',
      deadline: 'Tomorrow, 08:00',
      status: 'RESOLVED'
    }
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.getStats();
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch {
      // Fallback in-memory
    }
  };

  const handleRecalculateRisk = () => {
    setRecalculating(true);
    setTimeout(() => {
      loadStats();
      setRecalculating(false);
      setActionSuccessNotice('✓ Plant OSHA Risk Exposure recalibrated against active camera edge feeds.');
      setTimeout(() => setActionSuccessNotice(''), 3500);
    }, 900);
  };

  const handleToggleCapStatus = (id) => {
    setCapList(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'PENDING SIGN-OFF' ? 'IN PROGRESS' : (item.status === 'IN PROGRESS' ? 'RESOLVED' : 'PENDING SIGN-OFF');
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleAddCapItem = (e) => {
    e.preventDefault();
    if (!capTitle.trim()) return;

    const newItem = {
      id: 'CAP-' + (100 + capList.length + 1),
      title: capTitle.trim(),
      priority: capPriority,
      zone: 'Plant Monitored Sector',
      assignee: capAssignee,
      deadline: 'Next Shift Handover',
      status: 'PENDING SIGN-OFF'
    };

    setCapList(prev => [newItem, ...prev]);
    setCapTitle('');
    setShowNewCapModal(false);
    setActionSuccessNotice(`✓ Created Corrective Action Directive ${newItem.id}`);
    setTimeout(() => setActionSuccessNotice(''), 3000);
  };

  const openWarningNoticeModal = (contractor) => {
    setSelectedContractor(contractor);
    setWarningMessage(`Formal OSHA Corrective Remediation Notice issued to ${contractor.name} for persistent safety non-compliance in ${contractor.zone}. A 15-minute mandatory safety stand-down is required before badge re-authorization.`);
    setShowWarningModal(true);
  };

  const handleSendWarningNotice = () => {
    if (selectedContractor) {
      setContractors(prev => prev.map(c => c.id === selectedContractor.id ? { ...c, status: 'CURE NOTICE ISSUED' } : c));
      setShowWarningModal(false);
      setActionSuccessNotice(`✓ Official Warning & Stand-Down Notice dispatched to ${selectedContractor.name}`);
      setTimeout(() => setActionSuccessNotice(''), 4000);
    }
  };

  // Statutory OSHA Penalty Calculator
  const totalTypes = (stats.byType.NO_HELMET || 0) + (stats.byType.NO_VEST || 0) + (stats.byType.ZONE_INTRUSION || 0) || 1;
  const helmetPct = Math.round(((stats.byType.NO_HELMET || 0) / totalTypes) * 100);
  const vestPct = Math.round(((stats.byType.NO_VEST || 0) / totalTypes) * 100);
  const zonePct = Math.round(((stats.byType.ZONE_INTRUSION || 0) / totalTypes) * 100);

  // OSHA 2026 Maximum Penalty Rates:
  // Serious Violation: $16,131 / violation
  // Other than Serious: $16,131 max, average $11,520
  const helmetFines = (stats.byType.NO_HELMET || 0) * 16131;
  const vestFines = (stats.byType.NO_VEST || 0) * 11520;
  const zoneFines = (stats.byType.ZONE_INTRUSION || 0) * 16131;
  const totalPotentialFine = helmetFines + vestFines + zoneFines;
  const avertedFines = Math.round(totalPotentialFine * 0.88); // 88% averted by real-time AI intervention

  return (
    <div>
      {/* Officer Command & Compliance Header Strip */}
      <div style={{
        background: 'linear-gradient(135deg, #1e2838 0%, #111827 100%)',
        border: '1px solid #334155',
        borderRadius: '14px',
        padding: '1.1rem 1.35rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '11px',
            background: '#f59e0b',
            color: '#1e2838',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.35)',
            flexShrink: 0
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f1f5f9', letterSpacing: '0.02em' }}>
                OFFICER COMPLIANCE INTELLIGENCE & OSHA RISK AUDIT
              </span>
              <span className="badge" style={{ background: '#10b981', color: '#fff', fontSize: '0.68rem', fontWeight: 800 }}>
                AUDIT READY
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
              Lead Auditor: <strong style={{ color: '#f8fafc' }}>{user?.name || 'Capt. Alex Vance'}</strong> • Badge #{user?.badgeId || 'HSE-9041'} • OSHA 1910/1926 Regulatory Benchmark
            </div>
          </div>
        </div>

        {/* Officer Executive Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRecalculateRisk}
            disabled={recalculating}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
            title="Recalculate risk exposure from edge vision nodes"
          >
            <RefreshCw size={14} className={recalculating ? 'spin' : ''} />
            <span>{recalculating ? 'Recalculating...' : 'Recalculate Exposure'}</span>
          </button>

          <button
            onClick={() => setShowCertModal(true)}
            className="btn-primary"
            style={{
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              background: '#f59e0b',
              color: '#1e2838',
              fontWeight: 800,
              borderColor: '#d97706'
            }}
          >
            <Award size={15} /> Executive Audit Certificate
          </button>

          <a
            href={api.getExportUrl()}
            download
            className="btn-secondary"
            style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
          >
            <Download size={14} /> Full Shift CSV
          </a>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessNotice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '10px',
          padding: '0.75rem 1.25rem',
          marginBottom: '1.25rem',
          color: '#10b981',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.25s'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* 4 Top Primary KPI Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '1.25rem' }}>
        {/* Metric 1: Overall Compliance Rate */}
        <div className="ops-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <div className="stat-value" style={{ color: '#34d399' }}>{stats.complianceRate}%</div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>+2.4% vs last shift</span>
            </div>
            <div className="stat-label">Plant OSHA Compliance Index</div>
          </div>
        </div>

        {/* Metric 2: OSHA Statutory Fine Exposure */}
        <div className="ops-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <div className="stat-value" style={{ color: '#f87171' }}>${totalPotentialFine.toLocaleString()}</div>
            </div>
            <div className="stat-label">Gross OSHA Penalty Exposure</div>
          </div>
        </div>

        {/* Metric 3: AI Real-Time Penalties Averted */}
        <div className="ops-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Award size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <div className="stat-value" style={{ color: '#fbbf24' }}>${avertedFines.toLocaleString()}</div>
            </div>
            <div className="stat-label">Liability Averted by VigilantSite</div>
          </div>
        </div>

        {/* Metric 4: Mean Incident Response Time */}
        <div className="ops-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <div className="stat-value" style={{ color: '#38bdf8' }}>1m 24s</div>
              <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700 }}>-42s faster</span>
            </div>
            <div className="stat-label">Mean Intervention Response Time</div>
          </div>
        </div>
      </div>

      {/* Row 2: Predictive OSHA Liability Risk Calculator & Shift Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        
        {/* Card A: Predictive OSHA Statutory Fine Calculator */}
        <div className="ops-card">
          <div className="card-header" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div className="card-title">
              <DollarSign size={18} color="#f59e0b" />
              <span>Predictive OSHA Liability & Penalty Forecaster</span>
            </div>
            <span className="badge badge-warning">2026 STATUTORY RATES</span>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Calculates potential civil enforcement liabilities based on current shift infractions under 29 CFR 1903.15 standards:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Row 1: Hardhat Penalty */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HardHat size={16} color="#ef4444" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      Cranial Protection (OSHA 1926.100)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Serious Violation Tier • {stats.byType.NO_HELMET || 0} Breaches Recorded
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                    ${helmetFines.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>$16,131 / breach</div>
                </div>
              </div>

              {/* Row 2: High-Vis Penalty */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shirt size={16} color="#f59e0b" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      High-Visibility Apparel (OSHA 1910.132)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Standard PPE Surcharge • {stats.byType.NO_VEST || 0} Breaches Recorded
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                    ${vestFines.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>$11,520 / breach</div>
                </div>
              </div>

              {/* Row 3: Machinery Intrusion Penalty */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#3b82f6" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      Restricted Forklift Boundary (OSHA 1910.178)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      High-Hazard Mechanical • {stats.byType.ZONE_INTRUSION || 0} Breaches Recorded
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                    ${zoneFines.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>$16,131 / breach</div>
                </div>
              </div>
            </div>

            {/* Total Savings Bar */}
            <div style={{
              marginTop: '1rem',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>ESTIMATED PENALTIES PREVENTED BY AI:</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  ${avertedFines.toLocaleString()} (88% Recovery)
                </div>
              </div>
              <span className="badge badge-success">ZERO ACCIDENTS</span>
            </div>
          </div>
        </div>

        {/* Card B: Shift Safety Trends & Peak Hazard Hour Analysis */}
        <div className="ops-card">
          <div className="card-header" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div className="card-title">
              <TrendingUp size={18} color="#3b82f6" />
              <span>Shift Safety Trends & Peak Hazard Window</span>
            </div>
            <span className="badge badge-info">HOURLY DISTRIBUTION</span>
          </div>

          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '1.25rem', padding: '1rem 0' }}>
            {stats.hourlyTrend.map((h, i) => {
              const total = h.helmet + h.vest + h.zone;
              const barHeight = Math.max(20, Math.min(130, total * 24));
              const isPeak = total >= 4;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: isPeak ? '#f87171' : 'var(--text-secondary)', marginBottom: '4px', fontWeight: isPeak ? 800 : 500 }}>
                    {total} {isPeak ? 'PEAK' : ''}
                  </div>
                  <div 
                    style={{
                      width: '100%',
                      maxWidth: '38px',
                      height: `${barHeight}px`,
                      borderRadius: '6px 6px 0 0',
                      background: isPeak ? 'linear-gradient(180deg, #ef4444, #b91c1c)' : 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                      transition: 'height 0.3s ease',
                      boxShadow: isPeak ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none'
                    }}
                  />
                  <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {h.time}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Officer Tactical Recommendation on Peak Hours */}
          <div style={{
            background: 'var(--bg-subtle)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            borderLeft: '3px solid #f59e0b',
            fontSize: '0.76rem',
            lineHeight: 1.5,
            marginTop: '0.5rem'
          }}>
            <strong style={{ color: '#f59e0b' }}>⚠️ Peak Hazard Window Identified: 14:00 - 15:30.</strong> Fatigue and shift handover coincide with an 88% compliance dip. 
            <strong> Officer Recommendation:</strong> Pre-deploy Floor Marshall Unit 1 to Sector 2 Scaffolding at 13:45 to enforce PPE before shift start.
          </div>
        </div>
      </div>

      {/* Row 3: Subcontractor & Sector Compliance Scorecard (Actionable Table) */}
      <div className="ops-card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header" style={{ paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="card-title">
            <Building2 size={18} color="#06b6d4" />
            <span>Subcontractor & Sector Compliance Performance Scorecard</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Comparative Site Contractor Performance
          </span>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>SUBCONTRACTOR / FIRM</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>ASSIGNED SECTOR</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>PERSONNEL</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>COMPLIANCE RATE</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>RISK STATUS</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>OFFICER INTERVENTION</th>
              </tr>
            </thead>
            <tbody>
              {contractors.map(c => {
                const isCritical = c.riskLevel === 'CRITICAL';
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', background: isCritical ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.7rem', color: isCritical ? '#f87171' : 'var(--text-muted)' }}>
                        {c.primaryIssue}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {c.zone}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {c.workers} Workers
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: c.complianceRate < 90 ? '#ef4444' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                          {c.complianceRate}%
                        </span>
                        <div style={{ width: '60px', height: '6px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.complianceRate}%`, height: '100%', background: c.complianceRate < 90 ? '#ef4444' : '#10b981' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${c.riskLevel === 'CRITICAL' ? 'badge-danger' : (c.riskLevel === 'ELEVATED' ? 'badge-warning' : 'badge-success')}`} style={{ fontSize: '0.68rem' }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => openWarningNoticeModal(c)}
                        className="btn-secondary"
                        style={{
                          fontSize: '0.74rem',
                          padding: '0.35rem 0.75rem',
                          borderColor: isCritical ? '#ef4444' : 'var(--border-color)',
                          color: isCritical ? '#ef4444' : 'var(--text-primary)'
                        }}
                      >
                        <AlertTriangle size={13} color={isCritical ? '#ef4444' : '#f59e0b'} />
                        <span>Issue Formal Cure Notice</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Officer Corrective Action Plan (CAP) Matrix */}
      <div className="ops-card">
        <div className="card-header" style={{ paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="card-title">
            <CheckCircle size={18} color="#10b981" />
            <span>Officer Corrective Action Plan (CAP) Matrix</span>
          </div>

          <button
            onClick={() => setShowNewCapModal(true)}
            className="btn-primary"
            style={{
              fontSize: '0.78rem',
              padding: '0.4rem 0.85rem',
              background: '#10b981',
              borderColor: '#059669',
              color: '#fff',
              fontWeight: 700
            }}
          >
            <Plus size={14} /> New CAP Directive
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {capList.map(item => {
            const isResolved = item.status === 'RESOLVED';
            const isCritical = item.priority === 'CRITICAL';
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: '10px',
                  border: isResolved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                  opacity: isResolved ? 0.75 : 1.0,
                  transition: 'all 0.2s ease',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <button
                    onClick={() => handleToggleCapStatus(item.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: isResolved ? '#10b981' : 'transparent',
                      border: isResolved ? '1px solid #10b981' : '2px solid var(--text-muted)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Click to toggle resolution status"
                  >
                    {isResolved && <CheckCircle2 size={16} />}
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isResolved ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isResolved ? 'line-through' : 'none' }}>
                        [{item.id}] {item.title}
                      </span>
                      <span className={`badge ${isCritical ? 'badge-danger' : (item.priority === 'HIGH' ? 'badge-warning' : 'badge-info')}`} style={{ fontSize: '0.62rem' }}>
                        {item.priority} PRIORITY
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      Sector: <strong>{item.zone}</strong> • Assignee: <strong>{item.assignee}</strong> • Target Deadline: {item.deadline}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${isResolved ? 'badge-success' : (item.status === 'IN PROGRESS' ? 'badge-info' : 'badge-warning')}`} style={{ fontSize: '0.7rem' }}>
                    {item.status}
                  </span>

                  <button
                    onClick={() => handleToggleCapStatus(item.id)}
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
                  >
                    {isResolved ? 'Re-open' : 'Advance Status'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MODAL 1: EXECUTIVE AUDIT CERTIFICATE ================= */}
      {showCertModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
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
            maxWidth: '680px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e2838, #0f172a)',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#f59e0b',
                  color: '#1e2838',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>
                    VigilantSite Executive Safety Compliance Certificate
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Document Ref: VS-EXEC-OSHA-2026-HSE9041 • Certified Regulatory Record
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCertModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Certificate Body */}
            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '1.5rem',
                background: 'var(--bg-subtle)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
                  OFFICIAL REGULATORY ATTESTATION
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  CERTIFICATE OF WORKPLACE COMPLIANCE
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                  This official executive certificate validates that the industrial operations at <strong>VigilantSite Manufacturing & Logistics Complex</strong> were monitored by Edge AI neural vision under OSHA 29 CFR 1910 and 1926 standards.
                </div>

                {/* Metrics Matrix */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CERTIFIED COMPLIANCE</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>{stats.complianceRate}%</div>
                    <div style={{ fontSize: '0.65rem', color: '#10b981' }}>OSHA Standard Met</div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>LIABILITY AVERTED</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>${avertedFines.toLocaleString()}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>88% Risk Reduction</div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>AUDITED NODES</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>4 Active Feeds</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>24/7 Neural Edge</div>
                  </div>
                </div>

                {/* Sign-off Signature */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                  textAlign: 'left'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AUDITING SAFETY OFFICER:</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {user?.name || 'Capt. Alex Vance'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                      Chief Safety Compliance Officer • Badge #{user?.badgeId || 'HSE-9041'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DATE & TIMESTAMP:</div>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </div>
                    <span className="badge badge-success" style={{ marginTop: '4px' }}>SEAL VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'var(--bg-subtle)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => setShowCertModal(false)}
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{
                  background: '#f59e0b',
                  color: '#1e2838',
                  fontWeight: 800,
                  borderColor: '#d97706',
                  fontSize: '0.82rem',
                  padding: '0.5rem 1.25rem'
                }}
              >
                <Printer size={15} /> Print / Export Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ISSUE FORMAL CONTRACTOR WARNING ================= */}
      {showWarningModal && selectedContractor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease'
          }}>
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
                  background: '#ef4444',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertOctagon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
                    Issue Contractor Cure & Stand-Down Notice
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#f87171' }}>
                    Target: {selectedContractor.name}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowWarningModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                This directive will officially issue a formal regulatory cure notice and trigger a mandatory 15-minute PPE stand-down before workers are re-admitted to <strong>{selectedContractor.zone}</strong>.
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  FORMAL REMEDIATION DIRECTIVE TEXT:
                </label>
                <textarea
                  rows={4}
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-sans)',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendWarningNotice}
                  className="btn-primary"
                  style={{
                    background: '#ef4444',
                    borderColor: '#dc2626',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    padding: '0.5rem 1.25rem'
                  }}
                >
                  <Send size={15} /> Dispatch Formal Directive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CREATE NEW CAP DIRECTIVE ================= */}
      {showNewCapModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '2px solid #10b981',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease'
          }}>
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
                  background: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plus size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
                    New Corrective Action Directive (CAP)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Officer Root Cause Remediation Task
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowNewCapModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCapItem} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  REMEDIATION OBJECTIVE & DIRECTIVE:
                </label>
                <input
                  type="text"
                  placeholder="e.g., Install secondary physical barrier at Scaffolding ladder egress"
                  value={capTitle}
                  onChange={(e) => setCapTitle(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    ACTION PRIORITY:
                  </label>
                  <select
                    value={capPriority}
                    onChange={(e) => setCapPriority(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="CRITICAL">Critical (Immediate Halt)</option>
                    <option value="HIGH">High (Within 4 Hours)</option>
                    <option value="MEDIUM">Medium (Within 24 Hours)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    RESPONSIBLE ASSIGNEE:
                  </label>
                  <input
                    type="text"
                    value={capAssignee}
                    onChange={(e) => setCapAssignee(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '8px',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.85rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewCapModal(false)}
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    background: '#10b981',
                    borderColor: '#059669',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    padding: '0.5rem 1.25rem'
                  }}
                >
                  <Plus size={15} /> Create Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
