import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  Mic, 
  LayoutDashboard, 
  History, 
  Activity, 
  MessageSquareText, 
  User, 
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';

export const Navbar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    isBackendOnline, 
    setIsChatOpen, 
    setIsProfileModalOpen 
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Plate Scanner', icon: Camera },
    { id: 'voice', label: 'Voice Logger', icon: Mic },
    { id: 'history', label: 'Meal History', icon: History },
    { id: 'metrics', label: 'Health Metrics', icon: Activity },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-logo" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon">
            <span>🥗</span>
          </div>
          <div>
            <div className="brand-name">
              <span className="gradient-text">Nutri</span>
              <span style={{ color: '#f8fafc' }}>Vision</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: '-2px' }}>
              AI Indian Diet & Fitness Coach
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Backend Status Pill */}
          <div 
            title={isBackendOnline ? "Connected to live FastAPI backend on :8000" : "Running in instant demo mode with simulated CV/RAG pipeline"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: isBackendOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${isBackendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isBackendOnline ? 'var(--emerald-400)' : 'var(--saffron-400)',
            }}
          >
            {isBackendOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isBackendOnline ? 'FastAPI Live' : 'Demo Engine'}</span>
          </div>

          {/* AI Coach Button */}
          <button 
            className="btn btn-ai btn-sm"
            onClick={() => setIsChatOpen(true)}
            style={{ gap: '6px' }}
          >
            <Sparkles size={16} />
            <span>AI Coach</span>
          </button>

          {/* User Profile Pill */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsProfileModalOpen(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name?.split(' ')[0] || 'User'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
