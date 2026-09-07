import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/layout/Toast';
import { TodaySummary } from './components/dashboard/TodaySummary';
import { PhotoScanner } from './components/meal-scanner/PhotoScanner';
import { VoiceLogger } from './components/voice-logger/VoiceLogger';
import { MealHistory } from './components/history/MealHistory';
import { HealthMetrics } from './components/history/HealthMetrics';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { ProfileSettingsModal } from './components/guardrails/ProfileSettingsModal';
import { Sparkles } from 'lucide-react';

export const App = () => {
  const { activeTab, setIsChatOpen } = useApp();

  return (
    <div className="app-container">
      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="app-main">
        {activeTab === 'dashboard' && <TodaySummary />}
        {activeTab === 'scan' && <PhotoScanner />}
        {activeTab === 'voice' && <VoiceLogger />}
        {activeTab === 'history' && <MealHistory />}
        {activeTab === 'metrics' && <HealthMetrics />}
      </main>

      {/* Floating Chat Trigger Button on bottom-right */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="btn btn-ai animate-pulse-glow"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 40,
          padding: '14px 22px',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.45)',
          gap: '10px'
        }}
      >
        <Sparkles size={20} />
        <span>Ask Diet Coach</span>
      </button>

      {/* Slideover / Modals */}
      <ChatDrawer />
      <ProfileSettingsModal />
      <ToastContainer />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 9, 14, 0.85)',
        padding: '24px 20px',
        marginTop: 'auto',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>NutriVision AI</span>
            <span>•</span>
            <span>ICMR-NIN 2024 Dietary Guardrails & YOLOv8 Multi-Item Plate Segmentation</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>FastAPI • React 19 • ChromaDB • Whisper</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
