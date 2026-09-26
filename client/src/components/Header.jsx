import React from 'react';
import { 
  ShieldAlert, 
  Video, 
  ClipboardList, 
  BarChart3, 
  MapPin, 
  PlayCircle,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Lock
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function Header({ activeTab, setActiveTab, theme, toggleTheme }) {
  const { isConnected, audioEnabled, setAudioEnabled } = useSocket();
  const { user, logout } = useAuth();

  const isController = user?.role === 'CONTROLLER';

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-logo-badge">
          <ShieldAlert size={22} color="#1e2838" />
        </div>
        <div>
          <div className="brand-title">
            VigilantSite <span style={{ fontSize: '0.72rem', background: '#f59e0b', color: '#1e2838', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>SAFETY OS</span>
          </div>
          <div className="brand-subtitle">Workplace Safety OS • Industrial Edge AI</div>
        </div>
      </div>

      <nav className="nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          <Video size={16} /> {isController ? 'All Webcams & Dashboard' : 'Live Feeds'}
        </button>

        {isController ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.73rem',
            color: 'var(--text-muted)',
            fontWeight: 600
          }}>
            <Lock size={13} color="#f59e0b" />
            <span>Work Check & Reports: Officer Only</span>
          </div>
        ) : (
          <>
            <button 
              className={`nav-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
              onClick={() => setActiveTab('incidents')}
            >
              <ClipboardList size={16} /> Work Check & Incident Desk
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={16} /> Compliance & KPIs
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'zones' ? 'active' : ''}`}
              onClick={() => setActiveTab('zones')}
            >
              <MapPin size={16} /> Geo-Fences
            </button>
            <button 
              className={`nav-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulator')}
              style={{ border: '1px solid rgba(6, 182, 212, 0.4)' }}
            >
              <PlayCircle size={16} color="#06b6d4" /> Edge Simulator
            </button>
          </>
        )}
      </nav>

      <div className="nav-status-group">
        {/* Light / Dark Mode Switch */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '8px',
            padding: '6px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="#f59e0b" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#3b82f6" />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* Audio Alert Toggle */}
        <button 
          onClick={() => setAudioEnabled(!audioEnabled)}
          title={audioEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            color: audioEnabled ? '#10b981' : '#64748b',
            borderRadius: '8px',
            padding: '6px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Edge Connection Badge */}
        <div className="status-indicator" style={{
          background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: isConnected ? '#10b981' : '#ef4444',
          borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
        }}>
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isConnected ? 'EDGE LIVE' : 'WS RECONNECTING'}</span>
          {isConnected && <div className="pulse-dot" />}
        </div>

        {/* Authenticated Personnel / Operator Profile */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '9px',
            padding: '4px 10px 4px 6px',
            marginLeft: '0.25rem'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: user.role === 'SAFETY_OFFICER' ? 'rgba(59, 130, 246, 0.2)' : user.role === 'CONTROL_OPERATOR' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem'
            }}>
              {user.avatar || '👷'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-brand)', lineHeight: 1.1 }}>
                {user.roleTitle || user.role}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out / Switch Operator"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '6px',
                marginLeft: '4px',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
