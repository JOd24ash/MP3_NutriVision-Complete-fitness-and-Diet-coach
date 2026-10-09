import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
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
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Right Column: topbar + content */}
      <div className="app-body">
        {/* Top Header Bar */}
        <Navbar />

        {/* Main Content */}
        <main className="app-main">
          {activeTab === 'dashboard' && <TodaySummary />}
          {activeTab === 'scan' && <PhotoScanner />}
          {activeTab === 'voice' && <VoiceLogger />}
          {activeTab === 'history' && <MealHistory />}
          {activeTab === 'metrics' && <HealthMetrics />}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="app-footer-inner">
            <div className="footer-brand">
              <span className="footer-logo">🥗</span>
              <span className="footer-name">NutriVision AI</span>
              <span className="footer-sep">•</span>
              <span className="footer-tagline">ICMR-NIN 2024 Dietary Guardrails &amp; YOLOv8 Multi-Item Plate Segmentation</span>
            </div>
            <div className="footer-tech">
              <span>FastAPI</span>
              <span className="footer-dot" />
              <span>React 19</span>
              <span className="footer-dot" />
              <span>ChromaDB</span>
              <span className="footer-dot" />
              <span>Whisper</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="btn btn-ai animate-pulse-glow fab-chat"
        aria-label="Open AI Diet Coach"
      >
        <Sparkles size={20} />
        <span>Ask Diet Coach</span>
      </button>

      {/* Overlays */}
      <ChatDrawer />
      <ProfileSettingsModal />
      <ToastContainer />
    </div>
  );
};

export default App;
