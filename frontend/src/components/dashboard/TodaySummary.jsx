import React from 'react';
import { useApp } from '../../context/AppContext';
import { MacroRing } from './MacroRing';
import { 
  Camera, 
  Mic, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  ChevronRight, 
  AlertTriangle,
  HeartPulse,
  TrendingUp
} from 'lucide-react';

export const TodaySummary = () => {
  const { user, setActiveTab, setIsChatOpen, setIsProfileModalOpen } = useApp();

  // Simulated today sums
  const consumedCalories = 1115;
  const targetCalories = user.target_calories || 2150;
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);

  const consumedProtein = 54;
  const targetProtein = user.target_protein || 115;

  const consumedCarbs = 143;
  const targetCarbs = user.target_carbs || 240;

  const consumedFat = 35;
  const targetFat = user.target_fat || 65;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner */}
      <div 
        className="glass-panel"
        style={{ 
          padding: '28px 32px', 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.9) 60%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-success">ICMR-NIN Aligned</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• Daily Diet Coach Active</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>
            Namaste, <span className="gradient-text">{user.name?.split(' ')[0] || 'Friend'}</span>!
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', fontSize: '0.95rem' }}>
            Ready to log your meal? NutriVision automatically segments multi-item Indian thalis, computes portions, and guards against medical conflicts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('scan')}
          >
            <Camera size={18} />
            <span>Scan Plate</span>
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setActiveTab('voice')}
          >
            <Mic size={18} />
            <span>Voice Log</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid-2">
        {/* Calorie & Macro Card */}
        <div className="glass-panel" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Today's Energy & Macros</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target vs Consumed</span>
            </div>
            <div className="badge badge-success" style={{ gap: '4px' }}>
              <Flame size={13} />
              <span>{remainingCalories} kcal left</span>
            </div>
          </div>

          {/* Calorie Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Calories</span>
              <span>
                <strong>{consumedCalories}</strong> / {targetCalories} kcal
              </span>
            </div>
            <div style={{ 
              height: '10px', 
              borderRadius: 'var(--radius-full)', 
              background: 'rgba(255, 255, 255, 0.08)', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min(100, (consumedCalories / targetCalories) * 100)}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>

          {/* 3 Macro Rings */}
          <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '10px' }}>
            <MacroRing 
              label="Protein" 
              current={consumedProtein} 
              target={targetProtein} 
              unit="g" 
              color="#38bdf8" 
            />
            <MacroRing 
              label="Carbs" 
              current={consumedCarbs} 
              target={targetCarbs} 
              unit="g" 
              color="#fbbf24" 
            />
            <MacroRing 
              label="Healthy Fat" 
              current={consumedFat} 
              target={targetFat} 
              unit="g" 
              color="#f43f5e" 
            />
          </div>
        </div>

        {/* Health Guardrails Shield */}
        <div className="glass-panel" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                padding: '8px', 
                borderRadius: '10px', 
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald-400)'
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Active Health Guardrails</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rules continuously active during vision & voice parsing</span>
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setIsProfileModalOpen(true)}
            >
              Edit Profile
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Conditions */}
            <div style={{ 
              padding: '12px 16px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                MONITORED MEDICAL CONDITIONS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {user.conditions && user.conditions.length > 0 ? (
                  user.conditions.map((cond, i) => (
                    <span key={i} className="badge badge-warning" style={{ textTransform: 'none' }}>
                      <HeartPulse size={12} />
                      {cond}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No medical conditions logged</span>
                )}
              </div>
            </div>

            {/* Allergens */}
            <div style={{ 
              padding: '12px 16px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                STRICT ALLERGEN BLOCKLIST
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {user.allergies && user.allergies.length > 0 ? (
                  user.allergies.map((allg, i) => (
                    <span key={i} className="badge badge-danger" style={{ textTransform: 'none' }}>
                      <AlertTriangle size={12} />
                      {allg}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No allergens recorded</span>
                )}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.06)',
              fontSize: '0.82rem',
              color: 'var(--emerald-400)'
            }}>
              <ShieldCheck size={16} />
              <span>Guardrails will automatically flag high GI carbs & allergen traces</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>NutriVision Core Engine Modules</h3>
        <div className="grid-3">
          {/* Card 1: Vision */}
          <div 
            className="glass-panel glass-panel-interactive"
            onClick={() => setActiveTab('scan')}
            style={{ padding: '24px' }}
          >
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#fff'
            }}>
              <Camera size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>YOLOv8 Plate Segmentation</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Detect multiple Indian food items simultaneously on a single thali with coin/card reference-object scaling.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald-400)', fontWeight: 600, fontSize: '0.85rem' }}>
              <span>Launch Plate Scanner</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 2: Voice */}
          <div 
            className="glass-panel glass-panel-interactive"
            onClick={() => setActiveTab('voice')}
            style={{ padding: '24px' }}
          >
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#fff'
            }}>
              <Mic size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Hinglish Voice Logger</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Speak naturally in code-mixed Hindi & English ("2 roti, 1 katori dal"). Whisper extracts quantities and units.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--saffron-400)', fontWeight: 600, fontSize: '0.85rem' }}>
              <span>Start Voice Recording</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 3: RAG AI Coach */}
          <div 
            className="glass-panel glass-panel-interactive"
            onClick={() => setIsChatOpen(true)}
            style={{ padding: '24px' }}
          >
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#fff'
            }}>
              <Sparkles size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>ICMR RAG Diet Coach</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Context-grounded nutritional advice strictly backed by ICMR-NIN 2024 dietary guidelines with chunk citations.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--violet-400)', fontWeight: 600, fontSize: '0.85rem' }}>
              <span>Chat With Diet Coach</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
