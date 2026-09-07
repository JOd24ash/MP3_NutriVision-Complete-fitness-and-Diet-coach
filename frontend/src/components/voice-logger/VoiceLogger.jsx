import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import confetti from 'canvas-confetti';
import { 
  Mic, 
  Square, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  Languages
} from 'lucide-react';

export const VoiceLogger = () => {
  const { showToast, setActiveMeal, setActiveTab } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const samplePhrases = [
    "Maine 2 roti, 1 katori dal tadka aur thoda dahi khaya",
    "Had 3 steamed idlis with sambar and 2 spoons coconut chutney",
    "1 plate chicken biryani with cucumber raita and sliced onions",
    "2 besan cheelas with mint chutney and 1 cup chai"
  ];

  const handleSimulateRecording = (text) => {
    setIsRecording(true);
    setTranscript('');
    setParsedItems([]);

    setTimeout(() => {
      setIsRecording(false);
      setTranscript(text);
      processTranscript(text);
    }, 1800);
  };

  const processTranscript = async (text) => {
    setIsLoading(true);
    try {
      // NLP parsing simulation
      await new Promise(r => setTimeout(r, 600));

      let items = [];
      if (text.includes('idli')) {
        items = [
          { food_label: 'steamed_idli', quantity: 3, unit: 'pieces', est_grams: 120, calories: 180, protein_g: 5.4, carbs_g: 36.0, fat_g: 0.6 },
          { food_label: 'sambar', quantity: 1, unit: 'bowl', est_grams: 180, calories: 110, protein_g: 5.8, carbs_g: 16.5, fat_g: 2.2 },
          { food_label: 'coconut_chutney', quantity: 2, unit: 'spoons', est_grams: 30, calories: 70, protein_g: 0.8, carbs_g: 2.1, fat_g: 6.5 }
        ];
      } else if (text.includes('biryani')) {
        items = [
          { food_label: 'chicken_biryani', quantity: 1, unit: 'plate', est_grams: 280, calories: 480, protein_g: 24.0, carbs_g: 58.0, fat_g: 14.5 },
          { food_label: 'cucumber_raita', quantity: 1, unit: 'katori', est_grams: 90, calories: 65, protein_g: 3.2, carbs_g: 5.0, fat_g: 2.8 }
        ];
      } else if (text.includes('cheela')) {
        items = [
          { food_label: 'besan_cheela', quantity: 2, unit: 'pieces', est_grams: 140, calories: 220, protein_g: 12.0, carbs_g: 28.0, fat_g: 6.0 },
          { food_label: 'mint_chutney', quantity: 1, unit: 'spoon', est_grams: 25, calories: 18, protein_g: 0.5, carbs_g: 1.2, fat_g: 0.2 },
          { food_label: 'masala_chai', quantity: 1, unit: 'cup', est_grams: 150, calories: 95, protein_g: 2.8, carbs_g: 12.0, fat_g: 3.2 }
        ];
      } else {
        items = [
          { food_label: 'whole_wheat_roti', quantity: 2, unit: 'pieces', est_grams: 80, calories: 240, protein_g: 6.2, carbs_g: 44.0, fat_g: 2.4 },
          { food_label: 'dal_tadka', quantity: 1, unit: 'katori', est_grams: 150, calories: 175, protein_g: 8.5, carbs_g: 22.0, fat_g: 5.5 },
          { food_label: 'fresh_curd', quantity: 1, unit: 'katori', est_grams: 100, calories: 62, protein_g: 3.5, carbs_g: 4.4, fat_g: 3.3 }
        ];
      }

      setParsedItems(items);
      showToast('Whisper & NLP extracted ' + items.length + ' meal items', 'success');
    } catch (e) {
      showToast('Failed to parse voice transcript', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToActiveMeal = () => {
    const formatted = parsedItems.map((item, idx) => ({
      id: 'voice-item-' + idx,
      food_label: item.food_label,
      confidence: 0.95,
      est_grams: item.est_grams,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      guardrail_status: 'ok',
      guardrail_reason: 'Parsed via voice NLP',
      box: { x: 20 + idx * 22, y: 30, w: 22, h: 22 }
    }));

    setActiveMeal({
      meal_log_id: 'meal-voice-' + Date.now(),
      plate_image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
      plate_name: 'Voice Logged Meal',
      items: formatted,
      total: {
        calories: formatted.reduce((s, i) => s + i.calories, 0),
        protein_g: Math.round(formatted.reduce((s, i) => s + i.protein_g, 0) * 10) / 10,
        carbs_g: Math.round(formatted.reduce((s, i) => s + i.carbs_g, 0) * 10) / 10,
        fat_g: Math.round(formatted.reduce((s, i) => s + i.fat_g, 0) * 10) / 10,
      }
    });

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    showToast('Voice meal transferred to plate review', 'success');
    setActiveTab('scan');
  };

  const totalCalories = parsedItems.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = Math.round(parsedItems.reduce((acc, item) => acc + item.protein_g, 0) * 10) / 10;
  const totalCarbs = Math.round(parsedItems.reduce((acc, item) => acc + item.carbs_g, 0) * 10) / 10;
  const totalFat = Math.round(parsedItems.reduce((acc, item) => acc + item.fat_g, 0) * 10) / 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Voice Recorder Hero Card */}
      <div 
        className="glass-panel"
        style={{
          padding: '36px 32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.9) 60%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-warning">
            <Languages size={13} />
            <span>Hinglish & English Supported</span>
          </span>
        </div>

        <div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>
            Code-Mixed Voice Meal Logging
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '540px' }}>
            Tap the microphone and speak your meal naturally. Whisper ASR will transcribe and extract food items, quantities, and units (katori, roti, bowl).
          </p>
        </div>

        {/* Big Animated Mic Button */}
        <div style={{ position: 'relative', margin: '14px 0' }}>
          {isRecording && (
            <div style={{
              position: 'absolute',
              inset: '-14px',
              borderRadius: '50%',
              border: '2px solid var(--saffron-400)',
              animation: 'pulseGlow 1.2s infinite ease-out'
            }} />
          )}

          <button
            onClick={() => handleSimulateRecording(samplePhrases[0])}
            disabled={isRecording}
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: isRecording 
                ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' 
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isRecording ? '0 0 30px rgba(244, 63, 94, 0.6)' : '0 8px 26px rgba(245, 158, 11, 0.4)',
              transition: 'var(--transition)'
            }}
          >
            {isRecording ? <Square size={32} /> : <Mic size={36} />}
          </button>
        </div>

        {isRecording ? (
          <div style={{ color: 'var(--rose-400)', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rose-400)' }} />
            Listening to your speech in Hinglish / English...
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tap button to start speaking, or click any sample prompt below
          </div>
        )}

        {/* Quick Sample Voice Prompts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '650px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            TRY PRESET VOICE PHRASES:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {samplePhrases.map((phrase, i) => (
              <button
                key={i}
                className="btn btn-secondary btn-sm"
                onClick={() => handleSimulateRecording(phrase)}
                disabled={isRecording}
                style={{ fontSize: '0.82rem', textAlign: 'left' }}
              >
                <Volume2 size={13} color="var(--saffron-400)" />
                <span>"{phrase}"</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript Card if available */}
      {transcript && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span className="badge badge-warning">Whisper ASR Transcript</span>
          </div>
          <div style={{ 
            padding: '14px 18px', 
            background: 'rgba(255, 255, 255, 0.04)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-subtle)',
            fontSize: '1.05rem',
            fontStyle: 'italic',
            color: '#f8fafc',
            marginBottom: '20px'
          }}>
            "{transcript}"
          </div>

          {/* Parsed Items Breakdown */}
          <h4 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
            Extracted Food Items & Portions
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {parsedItems.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', textTransform: 'capitalize' }}>
                    {item.food_label.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.quantity} {item.unit} ≈ <strong>{item.est_grams}g</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', textAlign: 'right' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CALORIES</span>
                    <div style={{ fontWeight: 700, color: 'var(--emerald-400)' }}>{item.calories} kcal</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PROTEIN</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8' }}>{item.protein_g}g</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Sum & Push to Log */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Meal Total:</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {totalCalories} kcal • {totalProtein}g Protein • {totalCarbs}g Carbs
              </div>
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleSaveToActiveMeal}
            >
              <span>Transfer to Plate Review</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
