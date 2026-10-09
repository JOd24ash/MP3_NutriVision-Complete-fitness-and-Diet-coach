import React, { useState } from 'react';
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
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Apple,
  Settings,
  TrendingUp,
  Salad
} from 'lucide-react';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    isBackendOnline,
    setIsChatOpen,
    setIsProfileModalOpen
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Today\'s overview' },
    { id: 'scan', label: 'Plate Scanner', icon: Camera, desc: 'AI meal detection' },
    { id: 'voice', label: 'Voice Logger', icon: Mic, desc: 'Log by speaking' },
    { id: 'history', label: 'Meal History', icon: History, desc: 'Past meals' },
    { id: 'metrics', label: 'Health Metrics', icon: Activity, desc: 'Body stats & trends' },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand" onClick={() => setActiveTab('dashboard')}>
        <div className="sidebar-brand-icon">
          <Salad size={22} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">
              <span className="gradient-text-warm">Nutri</span>
              <span>Vision</span>
            </div>
            <div className="sidebar-brand-tagline">AI Diet & Fitness Coach</div>
          </div>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Status Pill */}
      <div className={`sidebar-status ${isBackendOnline ? 'sidebar-status-online' : 'sidebar-status-demo'}`}>
        <div className="sidebar-status-dot" />
        {!collapsed && (
          <span>{isBackendOnline ? 'FastAPI Live' : 'Demo Engine'}</span>
        )}
        {collapsed && (isBackendOnline ? <Wifi size={13} /> : <WifiOff size={13} />)}
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section-label">
          {!collapsed && <span>Navigation</span>}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : ''}
            >
              <div className="sidebar-nav-icon">
                <Icon size={20} />
              </div>
              {!collapsed && (
                <div className="sidebar-nav-text">
                  <span className="sidebar-nav-label">{item.label}</span>
                  <span className="sidebar-nav-desc">{item.desc}</span>
                </div>
              )}
              {isActive && !collapsed && <div className="sidebar-active-dot" />}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* AI Coach CTA */}
      <div className="sidebar-cta-area">
        <button
          className="sidebar-ai-btn"
          onClick={() => setIsChatOpen(true)}
          title={collapsed ? 'AI Coach' : ''}
        >
          <Sparkles size={18} />
          {!collapsed && <span>Ask AI Coach</span>}
        </button>
      </div>

      {/* User Profile at Bottom */}
      <div className="sidebar-footer">
        <button
          className="sidebar-user-btn"
          onClick={() => setIsProfileModalOpen(true)}
          title={collapsed ? (user.name || 'Profile') : ''}
        >
          <div className="sidebar-user-avatar">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name?.split(' ')[0] || 'User'}</span>
              <span className="sidebar-user-role">View Profile</span>
            </div>
          )}
          {!collapsed && <Settings size={15} className="sidebar-settings-icon" />}
        </button>
      </div>
    </aside>
  );
};
