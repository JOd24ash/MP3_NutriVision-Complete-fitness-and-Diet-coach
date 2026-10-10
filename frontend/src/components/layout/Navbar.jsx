import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Camera,
  Mic,
  History,
  Activity,
  Sparkles,
  Wifi,
  WifiOff,
  Bell
} from 'lucide-react';

const pageTitles = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, desc: 'Your nutritional overview for today' },
  scan: { label: 'Plate Scanner', icon: Camera, desc: 'AI-powered multi-item meal detection' },
  voice: { label: 'Voice Logger', icon: Mic, desc: 'Log meals by speaking naturally' },
  history: { label: 'Meal History', icon: History, desc: 'Browse and review your past meals' },
  metrics: { label: 'Health Metrics', icon: Activity, desc: 'Track body stats and health trends' },
};

export const Navbar = () => {
  const { activeTab, isBackendOnline, setIsChatOpen, user } = useApp();

  const page = pageTitles[activeTab] || pageTitles.dashboard;
  const PageIcon = page.icon;

  const now = new Date();
  const timeStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-page-info">
          <div className="topbar-page-icon">
            <PageIcon size={18} />
          </div>
          <div>
            <h1 className="topbar-page-title">{page.label}</h1>
            <p className="topbar-page-desc">{page.desc}</p>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        {/* Date */}
        <div className="topbar-date">{timeStr}</div>

        {/* Backend Status */}
        <div
          className={`topbar-status-pill ${isBackendOnline ? 'status-online' : 'status-demo'}`}
          title={isBackendOnline
            ? 'Connected to live FastAPI backend on :8000'
            : 'Demo mode (backend offline)'}
        >
          {isBackendOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isBackendOnline ? 'FastAPI Live' : 'Backend offline'}</span>
        </div>

        {/* AI Coach Button */}
        <button
          className="btn btn-ai btn-sm topbar-ai-btn"
          onClick={() => setIsChatOpen(true)}
        >
          <Sparkles size={15} />
          <span>AI Coach</span>
        </button>
      </div>
    </header>
  );
};
