import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mic, Square, Sparkles, Clock, ChevronRight,
  Lightbulb, Check, Volume2, ArrowRight
} from 'lucide-react';

export const VoiceLoggerReal = () => {
  const { user, showToast, setActiveMeal, activeMeal, updateActiveMealItems, setActiveTab, setIsChatOpen } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Listening...');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Recent Voice Logs matching the user reference screenshot exactly
  const [recentLogs, setRecentLogs] = useState([
    {
      id: 'log-1',
      name: 'Dal + Rice + Sabzi',
      time: 'Today, 09:12 AM',
      kcal: 420,
      p: 16, c: 72, f: 8,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'log-2',
      name: 'Banana',
      time: 'Yesterday, 07:45 PM',
      kcal: 105,
      p: 1, c: 27, f: 0,
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'log-3',
      name: 'Sandwich',
      time: 'Yesterday, 01:20 PM',
      kcal: 290,
      p: 10, c: 42, f: 9,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'log-4',
      name: 'Boiled Egg',
      time: '10 Oct, 08:05 AM',
      kcal: 78,
      p: 6, c: 1, f: 5,
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=150&auto=format&fit=crop&q=80'
    }
  ]);

  // Timer effect for recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(sec => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Parse simulated voice meal into item details
  const parsePhrase = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('chapati') || lower.includes('roti') || lower.includes('sabzi')) {
      return {
        name: 'Dal + Rice + Sabzi',
        kcal: 420, p: 16, c: 72, f: 8,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=80',
        items: [
          { food_name: 'Chapati / Roti', portion: '2 pieces', calories: 192, protein_g: 6, carbs_g: 36, fat_g: 2 },
          { food_name: 'Yellow Dal', portion: '1 bowl', calories: 120, protein_g: 9, carbs_g: 20, fat_g: 2 },
          { food_name: 'Mixed Sabzi', portion: '1 plate', calories: 108, protein_g: 3, carbs_g: 16, fat_g: 4 }
        ]
      };
    } else if (lower.includes('apple') || lower.includes('banana')) {
      return {
        name: 'Apple + Banana',
        kcal: 184, p: 2, c: 48, f: 0,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=150&auto=format&fit=crop&q=80',
        items: [
          { food_name: 'Fresh Apple', portion: '1 medium', calories: 95, protein_g: 0, carbs_g: 25, fat_g: 0 },
          { food_name: 'Banana', portion: '1 medium', calories: 89, protein_g: 1, carbs_g: 23, fat_g: 0 }
        ]
      };
    } else if (lower.includes('chicken') || lower.includes('salad')) {
      return {
        name: 'Chicken Rice + Salad',
        kcal: 485, p: 38, c: 52, f: 8,
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=150&auto=format&fit=crop&q=80',
        items: [
          { food_name: 'Grilled Chicken Breast', portion: '150g', calories: 248, protein_g: 34, carbs_g: 0, fat_g: 6 },
          { food_name: 'Cooked Rice', portion: '1 cup', calories: 206, protein_g: 4, carbs_g: 45, fat_g: 0 },
          { food_name: 'Green Salad', portion: '1 bowl', calories: 31, protein_g: 1, carbs_g: 7, fat_g: 0 }
        ]
      };
    } else {
      return {
        name: 'Custom Logged Meal',
        kcal: 350, p: 15, c: 45, f: 6,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=80',
        items: [
          { food_name: text, portion: '1 serving', calories: 350, protein_g: 15, carbs_g: 45, fat_g: 6 }
        ]
      };
    }
  };

  // Process text transcript
  const handleProcessText = (phrase) => {
    setIsProcessing(true);
    setTranscript(phrase);
    setStatusMessage('Processing speech with AI...');

    setTimeout(() => {
      const parsed = parsePhrase(phrase);

      // Add to recent logs
      const newLog = {
        id: 'log-' + Date.now(),
        name: parsed.name,
        time: 'Just now',
        kcal: parsed.kcal,
        p: parsed.p,
        c: parsed.c,
        f: parsed.f,
        image: parsed.image
      };
      setRecentLogs(prev => [newLog, ...prev.slice(0, 3)]);

      // Update activeMeal in context
      if (updateActiveMealItems && activeMeal) {
        updateActiveMealItems([...(activeMeal.items || []), ...parsed.items]);
      } else if (setActiveMeal) {
        setActiveMeal(prev => ({
          ...prev,
          items: [...(prev?.items || []), ...parsed.items]
        }));
      }

      setIsProcessing(false);
      setStatusMessage('Listening...');
      showToast(`Logged "${parsed.name}" via voice!`, 'success');
    }, 1100);
  };

  // Toggle voice recording
  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      } else {
        handleProcessText('2 chapatis, dal and sabzi');
      }
    } else {
      // Start recording
      setStatusMessage('Listening...');
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          audioChunksRef.current = [];

          recorder.ondataavailable = e => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };

          recorder.onstop = () => {
            stream.getTracks().forEach(t => t.stop());
            handleProcessText('I ate 2 chapatis, dal and sabzi');
          };

          mediaRecorderRef.current = recorder;
          recorder.start();
          setIsRecording(true);
        } else {
          setIsRecording(true);
        }
      } catch (err) {
        // Fallback for environments without microphone permissions
        setIsRecording(true);
        showToast('Listening in simulation mode (speak naturally)', 'info');
      }
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top Green Banner Card ─────────────────────────────── */}
      <div style={{
        background: '#ecfdf5',
        borderRadius: 16,
        border: '1px solid #a7f3d0',
        padding: '20px 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 18,
        boxShadow: '0 1px 3px rgba(16,185,129,0.06)'
      }}>
        {/* Left: Icon + Heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 280, flex: 1 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            flexShrink: 0
          }}>
            <Mic size={26} strokeWidth={2.4} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Speak Your Meal
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#4b5563' }}>
              Just say what you ate, and we'll detect the food, estimate nutrition and add it to your meal log.
            </p>
          </div>
        </div>

        {/* Right: Examples */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>
            Examples:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              '"I ate 2 chapatis, dal and sabzi"',
              '"Apple and a banana"',
              '"Chicken rice with salad"'
            ].map(phrase => (
              <button
                key={phrase}
                onClick={() => handleProcessText(phrase.replace(/"/g, ''))}
                disabled={isProcessing}
                style={{
                  background: '#fff',
                  border: '1px solid #a7f3d0',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#065f46',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#dcfce7';
                  e.currentTarget.style.borderColor = '#059669';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#a7f3d0';
                }}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ───────────────────────────── */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Left Column: Start Recording */}
        <div style={{
          flex: 1,
          minWidth: 0,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#ecfdf5',
              border: '1px solid #d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <Mic size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                Start Recording
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
                Click the button below and speak clearly about the food you ate.
              </p>
            </div>
          </div>

          {/* Central Recording Mic Area */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '42px 0 24px'
          }}>
            {/* Concentric Circle Halo */}
            <div style={{
              width: 176,
              height: 176,
              borderRadius: '50%',
              background: isRecording ? '#fee2e2' : '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: isRecording
                ? '0 0 0 12px rgba(239,68,68,0.12), 0 0 0 24px rgba(239,68,68,0.06)'
                : '0 0 0 10px rgba(16,185,129,0.08)'
            }}>
              {/* Inner Green Button */}
              <button
                onClick={handleToggleRecording}
                disabled={isProcessing}
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: '50%',
                  background: isRecording ? '#dc2626' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isProcessing ? 'wait' : 'pointer',
                  boxShadow: isRecording
                    ? '0 10px 25px rgba(220,38,38,0.45)'
                    : '0 10px 25px rgba(16,185,129,0.38)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none'
                }}
                onMouseEnter={e => {
                  if (!isRecording) e.currentTarget.style.background = '#059669';
                }}
                onMouseLeave={e => {
                  if (!isRecording) e.currentTarget.style.background = '#10b981';
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isRecording ? (
                  <Square size={38} color="#fff" fill="#fff" />
                ) : (
                  <Mic size={48} color="#fff" strokeWidth={2.4} />
                )}
              </button>
            </div>

            {/* Instruction labels below button */}
            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#111827',
              marginTop: 18,
              textAlign: 'center'
            }}>
              {isRecording
                ? `Recording... (${recordingSeconds}s) - Tap to Stop`
                : isProcessing
                ? 'Processing your voice...'
                : 'Tap to start recording'}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: 3,
              textAlign: 'center'
            }}>
              Or hold to keep recording
            </div>

            {/* Status Indicator Badges */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              {/* Listening Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 16px',
                borderRadius: 20,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                color: '#475569',
                fontWeight: 500
              }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isRecording ? '#dc2626' : '#94a3b8',
                  display: 'inline-block'
                }} />
                {isRecording ? `Recording (${recordingSeconds}s)...` : statusMessage}
              </div>

              {/* Speak Naturally Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 16px',
                borderRadius: 20,
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                fontSize: '0.78rem',
                color: '#7c3aed',
                fontWeight: 600
              }}>
                <Sparkles size={14} color="#7c3aed" />
                Speak naturally, take your time
              </div>
            </div>
          </div>

          {/* Bottom Card: Tips for better results */}
          <div style={{
            marginTop: 26,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 14,
            padding: '16px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb size={18} color="#059669" />
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#065f46' }}>
                Tips for better results
              </div>
            </div>

            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Speak clearly and naturally',
                'Mention quantities (e.g., 1 cup, 2 pieces)',
                'You can say full meal or individual items'
              ].map((tip, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.85rem' }}>✓</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Voice Logs & AI Nutrition Insight */}
        <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Card 1: Recent Voice Logs */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}>
                  <Clock size={15} strokeWidth={2.4} />
                </div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#111827' }}>
                  Recent Voice Logs
                </h3>
              </div>

              <button
                onClick={() => setActiveTab('history')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                View All
              </button>
            </div>

            {/* List of 4 recent logs */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentLogs.map((log, index) => (
                <div
                  key={log.id}
                  onClick={() => {
                    showToast(`Viewed log for ${log.name}`, 'info');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 6px',
                    borderBottom: index < recentLogs.length - 1 ? '1px solid #f1f5f9' : 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Left: Thumbnail + Name/Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: '#f8fafc',
                      flexShrink: 0
                    }}>
                      <img
                        src={log.image}
                        alt={log.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                        {log.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: 2 }}>
                        {log.time}
                      </div>
                    </div>
                  </div>

                  {/* Right: Calories, Macros & Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>
                        {log.kcal} kcal
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2, letterSpacing: '-0.01em' }}>
                        P {log.p}g | C {log.c}g | F {log.f}g
                      </div>
                    </div>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: AI Nutrition Insight */}
          <div style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            border: '1px solid #e9d5ff',
            borderRadius: 16,
            padding: '20px 22px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Sparkles size={17} color="#7c3aed" />
                <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#6b21a8' }}>
                  AI Nutrition Insight
                </h3>
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#7c3aed',
                background: '#ede9fe',
                padding: '2px 8px',
                borderRadius: 12
              }}>
                Beta
              </span>
            </div>

            {/* Insight Text */}
            <p style={{
              margin: '10px 0 16px',
              fontSize: '0.78rem',
              color: '#4b5563',
              lineHeight: 1.48,
              maxWidth: 240
            }}>
              You're doing great with your protein intake today! Consider adding more fiber-rich foods like vegetables and fruits for better digestion.
            </p>

            {/* Ask AI Coach Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#7c3aed',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(124,58,237,0.3)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            >
              Ask AI Coach →
            </button>

            {/* Robot Illustration in bottom right */}
            <div style={{
              position: 'absolute',
              right: 12,
              bottom: 8,
              fontSize: '48px',
              opacity: 0.9,
              pointerEvents: 'none'
            }}>
              🤖
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VoiceLogger = VoiceLoggerReal;
