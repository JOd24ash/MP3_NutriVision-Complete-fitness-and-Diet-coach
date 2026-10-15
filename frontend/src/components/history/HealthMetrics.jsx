import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { useDailyNutrition } from '../../hooks/useDailyNutrition';
import { calculateTargets } from '../../utils/nutritionCalculator';
import {
  User, Target, ChevronRight, Scale, Activity,
  Droplet, TrendingUp, Clock, Zap, Lightbulb,
  Plus, Check, Sparkles, HeartPulse, Flame
} from 'lucide-react';

export const HealthMetrics = () => {
  const { user, showToast, setIsChatOpen, setActiveTab } = useApp();

  const [timeRange, setTimeRange] = useState('30D');
  const [activeModal, setActiveModal] = useState(null); // 'weight' | 'hydration' | null
  const [weightInput, setWeightInput] = useState('');
  const [hydrationInput, setHydrationInput] = useState('');

  // Metrics state
  const [metrics, setMetrics] = useState([]);
  const weightMetrics = useMemo(() => metrics.filter(item => item.metric_type === 'weight').sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)), [metrics]);
  const waterMetrics = useMemo(() => metrics.filter(item => item.metric_type === 'water'), [metrics]);
  const weight = weightMetrics.at(-1)?.value ?? user?.weight_kg ?? null;
  const bodyFat = null;
  const bmi = user?.height_cm && weight ? Math.round((weight / ((user.height_cm / 100) ** 2)) * 10) / 10 : null;
  const hydration = waterMetrics.reduce((sum, item) => sum + item.value, 0) / 1000;

  // Fetch daily nutrition summary for real-time updates
  const { summary, remaining, percentages } = useDailyNutrition();

  // Calculate BMR, TDEE, and daily targets based on user profile
  const healthTargets = useMemo(() => {
    if (!user?.age || !user?.height_cm || !weight) return null;
    return calculateTargets({
      age: user.age,
      sex: user.sex || 'male',
      height: user.height_cm,
      weight: weight,
      activityLevel: user.activity_level || 'moderate',
      goal: user.goal || 'fitness'
    });
  }, [user?.age, user?.sex, user?.height_cm, user?.activity_level, user?.goal, weight]);

  // Extract computed values with fallbacks
  const bmr = healthTargets?.bmr || summary?.target?.bmr || null;
  const tdee = healthTargets?.tdee || summary?.target?.tdee || null;
  const dailyCalorieTarget = healthTargets?.calories || summary?.target?.calories || 2000;
  const caloriesConsumed = summary?.consumed?.calories || 0;
  const caloriesRemaining = Math.max(0, dailyCalorieTarget - caloriesConsumed);
  const caloriePercentage = dailyCalorieTarget > 0 ? Math.round((caloriesConsumed / dailyCalorieTarget) * 100) : 0;

  // Weight history data for SVG chart matching screenshot
  const chartData = weightMetrics.map(item => ({ date: new Date(item.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }), val: item.value }));
  const recentMeasurements = metrics.slice().sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)).slice(0, 4).map(item => ({ id: item.id, type: item.metric_type.replace('_', ' '), val: `${item.value} ${item.unit}`, time: new Date(item.recorded_at).toLocaleString(), icon: item.metric_type === 'weight' ? Scale : Droplet, iconColor: '#059669', bgColor: '#ecfdf5' }));

  useEffect(() => {
    if (!user?.id) return;
    api.metrics.list(user.id).then(setMetrics).catch(error => showToast?.(error.message || 'Could not load health metrics.', 'danger'));
  }, [user?.id]);

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!weightInput) return;
    const val = parseFloat(weightInput);
    if (!isNaN(val)) {
      const metric = await api.metrics.add(user.id, { metric_type: 'weight', value: val, unit: 'kg' });
      setMetrics(prev => [metric, ...prev]);
      showToast(`Logged weight: ${val} kg`, 'success');
      setWeightInput('');
      setActiveModal(null);
    }
  };

  const handleLogHydration = async (e) => {
    e.preventDefault();
    if (!hydrationInput) return;
    const val = parseFloat(hydrationInput);
    if (!isNaN(val)) {
      const metric = await api.metrics.add(user.id, { metric_type: 'water', value: val * 1000, unit: 'ml' });
      setMetrics(prev => [metric, ...prev]);
      showToast(`Added ${val} L of water!`, 'success');
      setHydrationInput('');
      setActiveModal(null);
    }
  };

  // SVG Chart Dimensions & Calculations
  const chartWidth = 560;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const minVal = 70;
  const maxVal = 80;

  const points = chartData.map((d, i) => {
    const x = paddingX + (i / Math.max(1, chartData.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((d.val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
    return { x, y, val: d.val, date: d.date };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = points.length ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z` : '';

  // Detect goal/weight conflict
  const hasGoalConflict = useMemo(() => {
    if (!user?.goal || !weight || !user?.target_weight_kg) return null;
    
    const currentWeight = weight;
    const targetWeight = user.target_weight_kg;
    const goal = user.goal?.toLowerCase();
    
    // Check for contradictions
    if (goal === 'gain' && targetWeight < currentWeight) {
      return {
        type: 'gain_conflict',
        message: `Your goal is muscle gain, but target weight (${targetWeight}kg) is less than current weight (${currentWeight.toFixed(1)}kg)`,
        suggestion: `For muscle gain, your target should be higher. Try setting it to ${(currentWeight + 5).toFixed(1)}kg or more.`
      };
    }
    
    if (goal === 'lose' && targetWeight > currentWeight) {
      return {
        type: 'lose_conflict',
        message: `Your goal is weight loss, but target weight (${targetWeight}kg) is more than current weight (${currentWeight.toFixed(1)}kg)`,
        suggestion: `For weight loss, your target should be lower. Try setting it to ${(currentWeight - 5).toFixed(1)}kg or less.`
      };
    }
    
    return null;
  }, [user?.goal, user?.target_weight_kg, weight]);

  return (
    <div className="health-metrics-page" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── 1. Top Header Banner: Your Health Snapshot ───────── */}
      <div className="health-metrics-header" style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Left: Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            <User size={24} strokeWidth={2.4} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Your Health Snapshot
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#6b7280' }}>
              Track your progress, stay consistent and reach your fitness goals.
            </p>
          </div>
        </div>

        {/* Right: Your Goal Card */}
        <div
          onClick={() => showToast('Current goal: Better health & active lifestyle', 'info')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            borderRadius: 14,
            border: '1px solid #e5e7eb',
            background: '#fff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.background = '#f0fdf4';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.background = '#fff';
          }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#ecfdf5',
            border: '1px solid #d1fae5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            flexShrink: 0
          }}>
            <Target size={18} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#111827' }}>
              Your Goal
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 1 }}>
              Better health • Balanced nutrition • Active lifestyle
            </div>
          </div>
          <ChevronRight size={16} color="#9ca3af" />
        </div>
      </div>

      {/* ── Goal/Weight Conflict Warning ───────────────────── */}
      {hasGoalConflict && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 16,
          border: '2px solid #f59e0b',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#78350f', marginBottom: 6 }}>
              Goal & Target Weight Conflict Detected
            </div>
            <div style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: 8, lineHeight: 1.5 }}>
              {hasGoalConflict.message}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#78350f', fontWeight: 600, marginBottom: 10 }}>
              💡 {hasGoalConflict.suggestion}
            </div>
            <button
              onClick={() => showToast('Please update your profile from the dashboard or settings', 'info')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: '#f59e0b',
                color: '#fff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
              onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}
            >
              Update My Goals →
            </button>
          </div>
        </div>
      )}

      {/* ── 2. Top 4 Metric Cards Row ────────────────────────── */}
      <div className="health-metrics-cards" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16
      }}>
        {/* Card 1: Weight */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <Scale size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Weight</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
              {weight ? weight.toFixed(1) : '--'} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>kg</span>
            </div>
            {/* Mini wavy green sparkline */}
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
              <path d="M2 8 C 12 14, 20 6, 30 12 C 40 18, 50 10, 58 14" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {weightMetrics.length >= 2 && (
            <div style={{ fontSize: '0.74rem', color: weightMetrics[weightMetrics.length - 1].value < weightMetrics[weightMetrics.length - 2].value ? '#059669' : '#dc2626', fontWeight: 600, marginTop: 4 }}>
              {weightMetrics[weightMetrics.length - 1].value < weightMetrics[weightMetrics.length - 2].value ? '↓' : '↑'} {Math.abs(weightMetrics[weightMetrics.length - 1].value - weightMetrics[weightMetrics.length - 2].value).toFixed(1)} kg change
            </div>
          )}
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>
            {user?.goal === 'lose' && user?.target_weight_kg ? 
              `Target: ${user.target_weight_kg} kg` : 
              user?.goal === 'gain' && weight ? 
                `Target: ${(weight + 5).toFixed(1)} kg` :
                user?.goal === 'maintain' && weight ?
                  `Target: ${weight.toFixed(1)} kg` :
                  'Goal: ' + (user?.goal === 'lose' ? 'Lose weight' : user?.goal === 'gain' ? 'Gain muscle' : 'Maintain')
            }
          </div>
        </div>

        {/* Card 2: Body Fat */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#faf5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed'
            }}>
              <Activity size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Body Fat</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
              {bodyFat} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>%</span>
            </div>
            {/* Mini wavy purple sparkline */}
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
              <path d="M2 6 C 14 12, 24 8, 34 14 C 44 8, 52 12, 58 15" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
            ↓ -0.7% this week
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>
            Target: 15–18%
          </div>
        </div>

        {/* Card 3: BMI */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <Scale size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>BMI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
                {bmi || '--'}
              </div>
              {bmi && (
                <span style={{
                  display: 'inline-block',
                  marginTop: 3,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: bmi >= 18.5 && bmi <= 24.9 ? '#dcfce7' : '#fef3c7',
                  color: bmi >= 18.5 && bmi <= 24.9 ? '#15803d' : '#92400e',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  {bmi < 18.5 ? 'Underweight' : bmi <= 24.9 ? 'Normal' : bmi <= 29.9 ? 'Overweight' : 'Obese'}
                </span>
              )}
            </div>
            {/* Mini wavy blue sparkline */}
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
              <path d="M2 12 C 12 8, 22 14, 32 8 C 42 12, 50 10, 58 11" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8 }}>
            Healthy range: 18.5 – 24.9
          </div>
        </div>

        {/* Card 4: Hydration */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <Droplet size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Hydration</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
              {hydration} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>L</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 6, background: '#e0f2fe', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, Math.round((hydration / 3.0) * 100))}%`,
                height: '100%',
                borderRadius: 6,
                background: '#38bdf8',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0284c7' }}>
              {Math.min(100, Math.round((hydration / 3.0) * 100))}%
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 6 }}>
            Target: 3.0 L
          </div>
        </div>
      </div>

      {/* ── 2.5. Additional Health Metrics: BMR, TDEE, Daily Target ─ */}
      <div className="health-metrics-cards-extended" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16
      }}>
        {/* Card: BMR */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706'
            }}>
              <Flame size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>BMR</span>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
            {bmr || '--'} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>kcal</span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8 }}>
            Basal Metabolic Rate
          </div>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 2 }}>
            Calories burned at rest
          </div>
        </div>

        {/* Card: TDEE */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#fae8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7'
            }}>
              <Zap size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>TDEE</span>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
            {tdee || '--'} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>kcal</span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8 }}>
            Total Daily Energy Expenditure
          </div>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 2 }}>
            Activity: {user?.activity_level || 'moderate'}
          </div>
        </div>

        {/* Card: Daily Calorie Target */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 16,
          border: '1px solid #fbbf24',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b'
            }}>
              <Target size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#78350f' }}>Daily Target</span>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#78350f' }}>
            {dailyCalorieTarget} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>kcal</span>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 6, background: '#fff', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, caloriePercentage)}%`,
                height: '100%',
                borderRadius: 6,
                background: caloriePercentage > 100 ? '#dc2626' : '#f59e0b',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#78350f' }}>
              {caloriePercentage}%
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: 6 }}>
            {caloriesConsumed} / {dailyCalorieTarget} kcal
          </div>
        </div>
      </div>

      {/* ── 3. Middle Section: Weight Trend & Recent Measurements ─ */}
      <div className="health-metrics-row" style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
        {/* Left: Weight Trend Card */}
        <div style={{
          flex: 1,
          minWidth: 0,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '22px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="#059669" />
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                Weight Trend
              </h2>
            </div>

            {/* Time Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {['7D', '30D', '90D'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setTimeRange(tab)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 14,
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: timeRange === tab ? '#10b981' : 'transparent',
                    color: timeRange === tab ? '#fff' : '#6b7280',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              ))}
              <ChevronRight size={16} color="#9ca3af" style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* Chart Content Area with Right Summary Column */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>
            {/* SVG Interactive Line Chart */}
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="weightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Y-axis horizontal grid lines & labels */}
                {[80, 78, 76, 74, 72, 70].map((val) => {
                  const y = chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
                  return (
                    <g key={val}>
                      <line x1={paddingX} y1={y} x2={chartWidth} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x={paddingX - 10} y={y + 4} fill="#9ca3af" fontSize="10" textAnchor="end" fontFamily="inherit">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                <path d={areaD} fill="url(#weightGrad)" />

                {/* Line */}
                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={3.5}
                    fill="#10b981"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                ))}

                {/* X-axis date labels */}
                {points.map((p, i) => (
                  <text
                    key={i}
                    x={p.x}
                    y={chartHeight - 4}
                    fill="#9ca3af"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="inherit"
                  >
                    {p.date}
                  </text>
                ))}
              </svg>
            </div>

            {/* Right Summary inside Weight Trend Card */}
            <div style={{
              width: 140,
              flexShrink: 0,
              borderLeft: '1px solid #f1f5f9',
              paddingLeft: 18,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                Current Weight
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
                {weight} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>kg</span>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: 12 }}>
                Change (30 days)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', marginTop: 2 }}>
                ↓ -1.8 kg
              </div>

              <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 600, marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                🌱 Great progress!
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Measurements Card */}
        <div style={{
          width: 380,
          flexShrink: 0,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669'
              }}>
                <Clock size={15} strokeWidth={2.4} />
              </div>
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#111827' }}>
                Recent Measurements
              </h3>
            </div>

            <button
              onClick={() => showToast('Showing all measurement logs', 'info')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View All &gt;
            </button>
          </div>

          {/* List of Measurements */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentMeasurements.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 4px',
                    borderBottom: index < recentMeasurements.length - 1 ? '1px solid #f8fafc' : 'none'
                  }}
                >
                  {/* Left: Icon + Type */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: item.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.iconColor,
                      flexShrink: 0
                    }}>
                      <ItemIcon size={16} strokeWidth={2.4} />
                    </div>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111827' }}>
                      {item.type}
                    </span>
                  </div>

                  {/* Right: Value, Date, Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#111827' }}>
                        {item.val}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 1 }}>
                        {item.time}
                      </div>
                    </div>
                    <ChevronRight size={15} color="#cbd5e1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Row: Health Insights & Quick Actions ───── */}
      <div className="health-metrics-row" style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
        {/* Left: Health Insights Card */}
        <div style={{
          flex: 1,
          minWidth: 0,
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
          borderRadius: 16,
          border: '1px solid #e9d5ff',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lightbulb size={18} color="#7c3aed" />
            <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#6b21a8' }}>
              Health Insights
            </h3>
          </div>

          {/* Middle Content */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: '38px', flexShrink: 0 }}>
                🤖
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e1b4b' }}>
                  You're doing great!
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: 3, lineHeight: 1.45, maxWidth: 440 }}>
                  Your weight is trending down and your hydration is on track. Keep up the consistency and you'll reach your goals soon.
                </div>
              </div>
            </div>

            {/* Ask AI Coach Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 10,
                background: '#7c3aed',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(124,58,237,0.3)',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            >
              Ask AI Coach →
            </button>
          </div>
        </div>

        {/* Right: Quick Actions Card */}
        <div style={{
          width: 380,
          flexShrink: 0,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={16} color="#10b981" />
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>
                Quick Actions
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 1 }}>
              Access your health tools quickly.
            </div>
          </div>

          {/* 3 Action Buttons in a row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {/* 1. Log Weight */}
            <button
              onClick={() => setActiveModal('weight')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '8px 6px',
                borderRadius: 10,
                border: '1px solid #d1fae5',
                background: '#f0fdf4',
                color: '#065f46',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
              onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
            >
              <Scale size={14} color="#059669" />
              Log Weight &gt;
            </button>

            {/* 2. Log Hydration */}
            <button
              onClick={() => setActiveModal('hydration')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '8px 6px',
                borderRadius: 10,
                border: '1px solid #dbeafe',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
              onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
            >
              <Droplet size={14} color="#2563eb" />
              Log Hydration &gt;
            </button>

            {/* 3. View Trends */}
            <button
              onClick={() => showToast('Displaying 90-day metabolic trends', 'info')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '8px 6px',
                borderRadius: 10,
                border: '1px solid #d1fae5',
                background: '#f0fdf4',
                color: '#065f46',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
              onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
            >
              <TrendingUp size={14} color="#059669" />
              View Trends &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ── Optional Modal for Quick Logging ─────────────────── */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '24px 28px',
            width: 360,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 800 }}>
              {activeModal === 'weight' ? 'Log Body Weight' : 'Log Water Intake'}
            </h3>

            {activeModal === 'weight' ? (
              <form onSubmit={handleLogWeight}>
                <label style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  Weight in kg
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 74.0"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#10b981',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogHydration}>
                <label style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: 6 }}>
                  Water in Litres (L)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 0.5"
                  value={hydrationInput}
                  onChange={e => setHydrationInput(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#2563eb',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Add Water
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
