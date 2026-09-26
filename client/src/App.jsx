import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LiveMonitor from './components/LiveMonitor';
import IncidentLog from './components/IncidentLog';
import AnalyticsOverview from './components/AnalyticsOverview';
import ZoneManager from './components/ZoneManager';
import SimulateFeed from './components/SimulateFeed';
import Login from './components/Login';
import { useSocket } from './context/SocketContext';
import { useAuth } from './context/AuthContext';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('visionops_theme') || 'dark';
  });
  const { isAuthenticated, user } = useAuth();
  const { toastAlert, dismissToast } = useSocket();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('visionops_theme', theme);
  }, [theme]);

  // Restrict Controller account strictly to Webcams & Dashboard
  useEffect(() => {
    if (user?.role === 'CONTROLLER' && activeTab !== 'monitor') {
      setActiveTab('monitor');
    }
  }, [user, activeTab]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // If user is not authenticated, show modern Operator & Officer Login Portal
  if (!isAuthenticated) {
    return <Login theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-content">
        {activeTab === 'monitor' && <LiveMonitor />}
        {activeTab === 'incidents' && <IncidentLog />}
        {activeTab === 'analytics' && <AnalyticsOverview />}
        {activeTab === 'zones' && <ZoneManager />}
        {activeTab === 'simulator' && <SimulateFeed />}
      </main>

      {/* Floating Real-Time Alert Toast */}
      {toastAlert && (
        <div className="toast-alert">
          <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.02em' }}>
              CRITICAL SAFETY INFRACTION
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '2px' }}>
              Worker #{toastAlert.workerTrackId} violated: <strong>{toastAlert.violationType}</strong> on {toastAlert.cameraId}
            </div>
          </div>
          <button 
            onClick={dismissToast}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
