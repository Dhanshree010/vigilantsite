import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, quickLoginAs, loading, error: authError } = useAuth();
  const [username, setUsername] = useState('officer@vigilantsite.ai');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!username.trim() || !password.trim()) {
      setLocalError('Please enter both User name and Password.');
      return;
    }
    const res = await login(username.trim(), password.trim());
    if (!res.success) {
      setLocalError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = async (email, defaultPass = 'admin') => {
    setLocalError('');
    setUsername(email);
    setPassword(defaultPass);
    await quickLoginAs(email, defaultPass);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d131d',
      padding: '1.25rem',
      position: 'relative',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Main Reference Canvas Container */}
      <div style={{
        width: '100%',
        maxWidth: '1060px',
        background: '#1e2838',
        border: '2px solid #334155',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        position: 'relative'
      }}>
        {/* ================= LEFT SECTION (Deep Navy Hero) ================= */}
        <div style={{
          background: '#1e2838',
          padding: '2.75rem 2.5rem 1.75rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Main Hero Typography */}
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              marginBottom: '1.5rem'
            }}>
              VigilantSite:<br />
              Workplace<br />
              Safety OS
            </h1>

            {/* AI Camera Guardian Graphic & HUD Overlay */}
            <div style={{ position: 'relative', marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '260px',
                height: '260px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#151d29',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.15)',
                position: 'relative'
              }}>
                <img
                  src="/ai_camera_guardian.jpg"
                  alt="AI Camera Guardian"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                {/* Glowing camera lens target overlay */}
                <div style={{
                  position: 'absolute',
                  top: '32%',
                  left: '26%',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1.5px dashed #f59e0b',
                  pointerEvents: 'none',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.6)'
                }} />
              </div>

              {/* Target brackets and AI Camera Guardian label */}
              <div style={{ marginLeft: '1.25rem', position: 'relative' }}>
                <div style={{
                  borderLeft: '2px solid #f59e0b',
                  borderTop: '2px solid #f59e0b',
                  width: '14px',
                  height: '14px',
                  marginBottom: '2px'
                }} />
                <div style={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#ffffff',
                  lineHeight: 1.25,
                  padding: '2px 0 2px 6px'
                }}>
                  AI Camera<br />
                  Guardian
                </div>
                <div style={{
                  borderRight: '2px solid #f59e0b',
                  borderBottom: '2px solid #f59e0b',
                  width: '14px',
                  height: '14px',
                  marginLeft: 'auto',
                  marginTop: '2px'
                }} />
                <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700, marginTop: '6px', letterSpacing: '0.05em' }}>
                  24/7 PPE EDGE AI
                </div>
              </div>
            </div>
          </div>

          {/* Clean Security Status Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span>VigilantSite Neural Engine Online</span>
            </div>
            <span>•</span>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>OSHA 1910 Enforced</span>
          </div>
        </div>

        {/* ================= RIGHT SECTION (Off-White Backdrop + Layered Tabs + White Login Card) ================= */}
        <div style={{
          background: '#f1f5f9',
          position: 'relative',
          padding: '2.5rem 3.5rem 2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Layered Rounded Tabs on the far right edge (matching reference design) */}
          <div style={{
            position: 'absolute',
            right: '0',
            top: '18%',
            bottom: '18%',
            width: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}>
            <div style={{
              height: '54px',
              background: '#334155',
              borderTopLeftRadius: '12px',
              borderBottomLeftRadius: '12px',
              boxShadow: '-3px 0 8px rgba(0,0,0,0.1)'
            }} />
            <div style={{
              height: '75px',
              background: '#f59e0b',
              borderTopLeftRadius: '12px',
              borderBottomLeftRadius: '12px',
              boxShadow: '-3px 0 10px rgba(245, 158, 11, 0.3)'
            }} />
            <div style={{
              height: '54px',
              background: '#334155',
              borderTopLeftRadius: '12px',
              borderBottomLeftRadius: '12px',
              boxShadow: '-3px 0 8px rgba(0,0,0,0.1)'
            }} />
          </div>

          {/* ================= WHITE LOGIN CARD ================= */}
          <div style={{
            width: '100%',
            maxWidth: '380px',
            background: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 12px 35px rgba(30, 40, 56, 0.16)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            zIndex: 10
          }}>
            {/* Top Hazard Caution Stripe Bar */}
            <div style={{
              height: '14px',
              width: '100%',
              background: 'repeating-linear-gradient(-45deg, #f59e0b, #f59e0b 12px, #1e2838 12px, #1e2838 24px)'
            }} />

            <div style={{ padding: '1.75rem 1.65rem 1.25rem 1.65rem' }}>
              <h2 style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#1e2838',
                letterSpacing: '-0.02em',
                marginBottom: '1.25rem'
              }}>
                Login
              </h2>

              {/* Error Notice */}
              {(localError || authError) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{localError || authError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '0.35rem'
                  }}>
                    User name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1.5px solid #f59e0b',
                      borderRadius: '6px',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                      color: '#1e2838',
                      outline: 'none',
                      boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.12)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '0.35rem'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.55rem 2rem 0.55rem 0.75rem',
                        fontSize: '0.85rem',
                        color: '#1e2838',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember password checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                  <input
                    type="checkbox"
                    id="remPass"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <label htmlFor="remPass" style={{ cursor: 'pointer' }}>
                    Remember password
                  </label>
                </div>

                {/* Primary Button (Exact Alert Amber Style) */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: '#f59e0b',
                    color: '#1e2838',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.65rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                    transition: 'all 0.15s ease',
                    marginTop: '0.2rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#d97706'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f59e0b'}
                >
                  {loading ? 'Authenticating...' : 'Access Secure Portal'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', cursor: 'pointer' }}>
                    Access Secure Portal?
                  </span>
                </div>
              </form>

              {/* 1-Click Demo Accounts Section (Safety Officer & Controller) */}
              <div style={{
                marginTop: '1.1rem',
                paddingTop: '0.9rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick 1-Click Role Login:
                </div>

                <button
                  onClick={() => handleQuickLogin('officer@vigilantsite.ai', 'admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    color: '#1e2838',
                    fontWeight: 700
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f59e0b'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#f59e0b" />
                    <span>1. Safety Officer (Checked Work & Reports)</span>
                  </div>
                  <ArrowRight size={13} color="#94a3b8" />
                </button>

                <button
                  onClick={() => handleQuickLogin('controller@vigilantsite.ai', 'admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    color: '#1e2838',
                    fontWeight: 700
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={14} color="#38bdf8" />
                    <span>2. Controller (Webcam & Dashboard Only)</span>
                  </div>
                  <ArrowRight size={13} color="#94a3b8" />
                </button>
              </div>
            </div>

            {/* Bottom Hazard Caution Stripe Bar */}
            <div style={{
              height: '14px',
              width: '100%',
              background: 'repeating-linear-gradient(-45deg, #f59e0b, #f59e0b 12px, #1e2838 12px, #1e2838 24px)'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
