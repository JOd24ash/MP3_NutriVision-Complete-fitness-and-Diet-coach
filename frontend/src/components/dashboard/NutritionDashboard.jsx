/**
 * NutritionDashboard.jsx
 *
 * Personalized nutrition dashboard showing:
 *   - Daily macro targets (from backend daily-summary) with progress rings
 *   - Macro education cards with role explanations
 *   - Food suggestions filtered to user's dietary preference and allergies
 *   - Calculation method explanation with sources
 *   - Disclaimer that this is general guidance, not medical advice
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import {
  Flame, Dumbbell, Wheat, Droplet, Utensils, BookOpen,
  Target, Info, AlertTriangle, ExternalLink, Leaf,
  Sprout, ChevronDown, ChevronUp, Sparkles, RefreshCw
} from 'lucide-react';

// ─── Donut Progress Ring ────────────────────────────────────────────────────
const MacroRing = ({ consumed, target, color, trackColor, size = 96, stroke = 9 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: '1rem', fontWeight: 800, color: '#18181b' }}>{pct}%</span>
    </div>
  );
};

// ─── Macro Education Card ───────────────────────────────────────────────────
const MacroCard = ({ icon, label, color, bg, border, consumed, target, unit, pct, role, expandable }) => {
  const [expanded, setExpanded] = useState(false);
  const progress = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const remaining = Math.max(0, target - consumed);
  const over = consumed > target;

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: `1.5px solid ${border}`,
      padding: '20px', display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#18181b' }}>{label}</div>
            <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{pct}% of daily energy</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color }}>
            {consumed}<span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#6b7280' }}>/{target}{unit}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: over ? '#ef4444' : '#6b7280' }}>
            {over ? `${Math.round(consumed - target)}${unit} over` : `${Math.round(remaining)}${unit} left`}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, progress)}%`,
          background: over ? '#ef4444' : color,
          borderRadius: 999,
          transition: 'width 0.8s ease'
        }} />
      </div>

      {/* Role explanation (toggle) */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.74rem', padding: 0 }}
      >
        <BookOpen size={12} />
        <span>What does {label} do?</span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {expanded && (
        <div style={{ fontSize: '0.78rem', color: '#475569', background: bg, padding: '10px 12px', borderRadius: 10, lineHeight: 1.6 }}>
          {role}
        </div>
      )}
    </div>
  );
};

// ─── Food Suggestion Card ───────────────────────────────────────────────────
const SuggestionCard = ({ item }) => (
  <div style={{
    background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12,
    padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12
  }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Utensils size={18} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#166534' }}>{item.display_name}</div>
      <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: 1 }}>{item.reason}</div>
    </div>
    {item.per_100g && (
      <div style={{ flexShrink: 0, textAlign: 'right', fontSize: '0.7rem', color: '#6b7280' }}>
        <div>{item.per_100g.kcal} kcal</div>
        <div>per 100g</div>
      </div>
    )}
  </div>
);

// ─── Main NutritionDashboard Component ─────────────────────────────────────
export const NutritionDashboard = () => {
  const { user, setIsProfileModalOpen, showToast, profileRefreshTrigger } = useApp();
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [sumData, sugData] = await Promise.allSettled([
        api.fitness.summary(user.id),
        api.fitness.suggestions(user.id),
      ]);
      if (sumData.status === 'fulfilled' && sumData.value) setSummary(sumData.value);
      else setError('Complete your profile to see personalised nutrition targets.');
      if (sugData.status === 'fulfilled') setSuggestions(sugData.value || []);
    } catch {
      setError('Could not load nutrition data. Ensure your profile is saved.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user?.id, profileRefreshTrigger]);

  const target = summary?.target ?? {};
  const consumed = summary?.consumed ?? {};
  const macroSrc = summary?.food_data_source ?? '';

  const caloriesConsumed = consumed.calories ?? 0;
  const caloriesTarget = target.calories ?? 0;
  const proteinConsumed = consumed.protein_g ?? 0;
  const proteinTarget = target.protein_g ?? 0;
  const carbsConsumed = consumed.carbs_g ?? 0;
  const carbsTarget = target.carbs_g ?? 0;
  const fatConsumed = consumed.fat_g ?? 0;
  const fatTarget = target.fat_g ?? 0;

  const macroPct = target.macro_percent_energy ?? {};

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, flexDirection: 'column', gap: 12 }}>
      <RefreshCw size={28} style={{ color: '#10b981', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading your personalised nutrition plan…</p>
    </div>
  );

  // ── No profile yet ───────────────────────────────────────────────────────
  if (error || !summary) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 16,
        padding: '24px', display: 'flex', gap: 16, alignItems: 'flex-start'
      }}>
        <AlertTriangle size={24} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 6 }}>Profile needed for personalised targets</div>
          <p style={{ color: '#78350f', fontSize: '0.84rem', margin: '0 0 12px' }}>
            {error || 'Enter your age, height, weight, activity level, and fitness goal to get evidence-based macro targets.'}
          </p>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
          >
            Set up profile
          </button>
        </div>
      </div>

      {/* Static educational content even without a profile */}
      <MacroEducationSection />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Section 1: Personalized Summary Header ────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%)',
        border: '1.5px solid #a7f3d0', borderRadius: 18, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: '#10b981',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0
        }}>
          <Target size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
              Your Personalised Nutrition Plan
            </h2>
            {target.age_group_label && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 99,
                background: target.is_minor ? '#ecfdf5' : '#eff6ff',
                color: target.is_minor ? '#065f46' : '#1e40af',
                border: target.is_minor ? '1px solid #a7f3d0' : '1px solid #bfdbfe'
              }}>
                {target.age_group_label}
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            {target.explanation || 'Targets calculated from your profile using validated nutritional equations.'}
          </p>
        </div>
        <button
          onClick={() => setIsProfileModalOpen(true)}
          style={{
            background: '#fff', border: '1.5px solid #a7f3d0', borderRadius: 10,
            padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600,
            color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            flexShrink: 0
          }}
        >
          <Sparkles size={14} /> Update profile
        </button>
      </div>

      {/* ── Minor caution banner ────────────────────────────────────────── */}
      {target.is_minor && target.caution && (
        <div style={{
          background: '#fef9c3', border: '1.5px solid #fef08a', borderRadius: 12,
          padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
          <AlertTriangle size={18} style={{ color: '#ca8a04', flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#854d0e', lineHeight: 1.6 }}>
            {target.caution}
          </p>
        </div>
      )}

      {/* ── Adult caution for weight-loss ───────────────────────────────── */}
      {!target.is_minor && target.caution && (
        <div style={{
          background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 12,
          padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start'
        }}>
          <Info size={16} style={{ color: '#ea580c', flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#7c2d12', lineHeight: 1.5 }}>
            {target.caution}
          </p>
        </div>
      )}

      {/* ── Section 2: Daily Summary Ring + Calories ──────────────────── */}
      <div style={{
        background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 18,
        padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Flame size={18} style={{ color: '#ef4444' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Today's Calorie Budget</h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#6b7280' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <MacroRing
            consumed={caloriesConsumed} target={caloriesTarget}
            color="#ef4444" trackColor="#fee2e2" size={120} stroke={11}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{caloriesConsumed}</div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Consumed (kcal)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{caloriesTarget}</div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Target (kcal)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: caloriesConsumed > caloriesTarget ? '#ef4444' : '#18181b' }}>
                  {Math.abs(caloriesTarget - caloriesConsumed)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                  {caloriesConsumed > caloriesTarget ? 'Over (kcal)' : 'Remaining (kcal)'}
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: '#f3f4f6', margin: '16px 0' }} />
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              <strong>BMR:</strong> {target.bmr ?? '—'} kcal &nbsp;|&nbsp;
              <strong>TDEE:</strong> {target.tdee ?? '—'} kcal &nbsp;|&nbsp;
              <strong>Method:</strong> {target.method ?? '—'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Macro Cards ──────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Sprout size={17} style={{ color: '#10b981' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Macronutrient Targets</h3>
          <span style={{ marginLeft: 4, fontSize: '0.72rem', color: '#6b7280' }}>
            grams · % of daily energy
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <MacroCard
            icon={<Wheat size={18} />}
            label="Carbohydrates" color="#f59e0b" bg="#fffbeb" border="rgba(245,158,11,0.25)"
            consumed={Math.round(carbsConsumed)} target={carbsTarget} unit="g"
            pct={macroPct.carbs ?? 50}
            role="Carbohydrates are your body's primary and most efficient fuel source. They power your brain, muscles, and organs during everyday activities and exercise. Complex carbs from whole grains, legumes, and vegetables also provide fibre, which supports gut health and steady blood sugar levels. The key is quality and portion — not elimination."
          />
          <MacroCard
            icon={<Dumbbell size={18} />}
            label="Protein" color="#10b981" bg="#ecfdf5" border="rgba(16,185,129,0.25)"
            consumed={Math.round(proteinConsumed)} target={proteinTarget} unit="g"
            pct={macroPct.protein ?? 20}
            role="Protein is the building block of every cell, muscle, enzyme, and hormone in your body. Adequate protein supports muscle repair after exercise, immune function, and helps you feel fuller for longer. Requirements increase with age, activity level, and goals like muscle gain. Good Indian sources include dal, paneer, eggs, soya chunks, moong sprouts, and chicken."
          />
          <MacroCard
            icon={<Droplet size={18} />}
            label="Fats" color="#8b5cf6" bg="#f5f3ff" border="rgba(139,92,246,0.25)"
            consumed={Math.round(fatConsumed)} target={fatTarget} unit="g"
            pct={macroPct.fat ?? 30}
            role="Dietary fats are essential for absorbing fat-soluble vitamins (A, D, E, K), producing hormones, supporting brain health, and protecting organs. Unsaturated fats from nuts, seeds, olive oil, and fatty fish are beneficial. Saturated fats (ghee, butter) should be consumed in moderation. Fats are calorie-dense (9 kcal/g vs 4 for protein/carbs), so portion awareness matters."
          />
        </div>
      </div>

      {/* ── Section 4: Food Suggestions ────────────────────────────────── */}
      {suggestions.length > 0 && (
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 18, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Leaf size={17} style={{ color: '#16a34a' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Suggested Foods for Your Profile</h3>
            <span style={{ marginLeft: 4, fontSize: '0.72rem', color: '#6b7280' }}>
              matched to your diet preference · allergy-screened
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {suggestions.map((s, i) => <SuggestionCard key={i} item={s} />)}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '0.72rem', color: '#6b7280' }}>
            Suggestions come from the verified nutrition catalogue and respect your saved dietary preferences and allergies. They are not ranked by individual health suitability — consult a dietitian for a tailored meal plan.
          </p>
        </div>
      )}

      {/* ── Section 5: Calculation Methodology ────────────────────────── */}
      <MethodologyPanel target={target} macroSrc={macroSrc} />

      {/* ── Section 6: Disclaimer ──────────────────────────────────────── */}
      <DisclaimerPanel />

    </div>
  );
};

// ─── Macro Education (shown even without a profile) ────────────────────────
const MacroEducationSection = () => (
  <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 18, padding: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <BookOpen size={17} style={{ color: '#6366f1' }} />
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Understanding Macronutrients</h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
      {[
        { icon: <Wheat size={18} />, label: 'Carbohydrates', color: '#f59e0b', bg: '#fffbeb', text: 'Primary fuel for brain and muscles. Found in rice, roti, dal, fruits, and vegetables.' },
        { icon: <Dumbbell size={18} />, label: 'Protein', color: '#10b981', bg: '#ecfdf5', text: 'Builds and repairs muscle, enzymes, and hormones. Found in dal, paneer, eggs, chicken, and soya.' },
        { icon: <Droplet size={18} />, label: 'Fats', color: '#8b5cf6', bg: '#f5f3ff', text: 'Absorbs vitamins, supports hormones and brain health. Found in nuts, seeds, ghee, and oils.' },
      ].map(({ icon, label, color, bg, text }) => (
        <div key={label} style={{ background: bg, borderRadius: 12, padding: '14px', border: `1.5px solid ${color}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
            {icon}
            <strong style={{ fontSize: '0.9rem' }}>{label}</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>{text}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Methodology Panel ───────────────────────────────────────────────────────
const MethodologyPanel = ({ target, macroSrc }) => (
  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '18px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <Info size={16} style={{ color: '#64748b' }} />
      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>How your targets are calculated</h4>
    </div>
    <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.7 }}>
      <strong>Energy estimate:</strong> {target.method ?? 'Validated equation'} is used to estimate your Basal Metabolic Rate (BMR). 
      This is then multiplied by an activity factor (Harris &amp; Benedict / WHO/FAO/UNU Schofield for minors) 
      to give your Total Daily Energy Expenditure (TDEE). A calorie adjustment (±300 kcal/day for adults on weight-change goals) 
      is then applied if appropriate. No changes are made for minors.
    </p>
    <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.7 }}>
      <strong>Macronutrient distribution:</strong> Applied using Acceptable Macronutrient Distribution Ranges (AMDRs) 
      from the National Academies of Sciences (2005), calibrated per age group:{' '}
      <em>carbs {target.macro_percent_energy?.carbs ?? 50}% · protein {target.macro_percent_energy?.protein ?? 20}% · fat {target.macro_percent_energy?.fat ?? 30}%</em>.
    </p>
    {macroSrc && (
      <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
        <strong>Food composition data:</strong> {macroSrc}
      </p>
    )}
    {target.sources?.length > 0 && (
      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Sources:</span>
        {target.sources.map(s => (
          <a key={s.url} href={s.url} target="_blank" rel="noreferrer"
            style={{ fontSize: '0.72rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
            {s.title} <ExternalLink size={10} />
          </a>
        ))}
      </div>
    )}
  </div>
);

// ─── Disclaimer Panel ───────────────────────────────────────────────────────
const DisclaimerPanel = () => (
  <div style={{
    background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 14,
    padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start'
  }}>
    <AlertTriangle size={18} style={{ color: '#f97316', flexShrink: 0, marginTop: 1 }} />
    <div>
      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#7c2d12', marginBottom: 4 }}>
        General nutrition guidance only — not medical advice
      </div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#9a3412', lineHeight: 1.65 }}>
        The calorie and macronutrient targets shown here are general estimates based on publicly documented 
        nutritional equations (Mifflin-St Jeor; WHO/FAO/UNU Schofield). They are not a substitute for 
        personalised advice from a registered dietitian, nutritionist, or physician. Individuals with medical 
        conditions (diabetes, kidney disease, cardiovascular disease, eating disorders, pregnancy, etc.) should 
        seek professional medical guidance before making dietary changes. For children and adolescents under 18, 
        a qualified healthcare professional should always be consulted.
      </p>
    </div>
  </div>
);

export default NutritionDashboard;
