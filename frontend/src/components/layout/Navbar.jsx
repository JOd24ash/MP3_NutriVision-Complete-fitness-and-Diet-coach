import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Camera,
  Mic,
  History,
  Activity,
  Sparkles,
  LogOut,
  Calendar,
  Apple,
  Bell
} from 'lucide-react';

const pageTitles = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, desc: 'Your nutritional overview for today' },
  scan: { label: 'Plate Scanner', icon: Camera, desc: 'AI-powered multi-item meal detection' },
  manual: { label: 'Add Food', icon: Apple, desc: 'Search foods manually' },
  voice: { label: 'Voice Logger', icon: Mic, desc: 'Log your meals by speaking naturally' },
  history: { label: 'Meal History', icon: History, desc: 'Browse and review your past meals' },
  metrics: { label: 'Health Metrics', icon: Activity, desc: 'Track body stats and health trends' },
};

export const Navbar = () => {
  const { activeTab, setIsChatOpen, user, logout } = useApp();

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
        <div className="topbar-date" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ opacity: 0.75 }} />
          <span>{timeStr}</span>
        </div>

        {/* AI Coach Button */}
        <button
          className="btn btn-ai btn-sm topbar-ai-btn"
          onClick={() => setIsChatOpen(true)}
        >
          <Sparkles size={15} />
          <span>AI Coach</span>
        </button>

        {/* Logout Button */}
        {user && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={logout}
            title="Log out"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        )}
      </div>
    </header>
  );
};

