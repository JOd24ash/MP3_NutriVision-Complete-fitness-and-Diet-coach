import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import {
  User,
  Target,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Utensils,
  TrendingUp,
  Calendar,
  Camera,
  PlusCircle,
  Mic,
  Sparkles,
  Lightbulb,
  Scale,
  Ruler,
  Activity,
  Sprout,
  Leaf,
  ChevronRight,
  Plus,
  ArrowRight
} from 'lucide-react';

// Circular Donut Gauge Component
const DonutGauge = ({ percent, color, track = '#f3f4f6', size = 52, stroke = 5 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(100, Math.max(0, percent));
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: '0.76rem', fontWeight: 700, color: '#18181b' }}>
        {safePercent}%
      </span>
    </div>
  );
};

export const TodaySummary = () => {
  const { user, setActiveTab, setIsChatOpen, setIsProfileModalOpen, showToast } = useApp();
  const [summary, setSummary] = useState(null);
  const [metricTab, setMetricTab] = useState('calories');
  const [waterMl, setWaterMl] = useState(1200);

  // Fetch fitness summary if available, otherwise use defaults
  useEffect(() => {
    if (user?.id) {
      api.fitness.summary(user.id)
        .then(data => { if (data) setSummary(data); })
        .catch(() => {});
    }
  }, [user?.id]);

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Yash';

  // Macro stats (prefer user/api data if present, fall back to default goals)
  const caloriesConsumed = summary?.consumed?.calories ?? 820;
  const caloriesTarget = summary?.target?.calories ?? 2500;
  const caloriesRemaining = Math.max(0, caloriesTarget - caloriesConsumed);
  const caloriesPercent = Math.round((caloriesConsumed / caloriesTarget) * 100);

  const proteinConsumed = summary?.consumed?.protein_g ?? 42;
  const proteinTarget = summary?.target?.protein_g ?? 150;
  const proteinRemaining = Math.max(0, proteinTarget - proteinConsumed);
  const proteinPercent = Math.round((proteinConsumed / proteinTarget) * 100);

  const carbsConsumed = summary?.consumed?.carbs_g ?? 110;
  const carbsTarget = summary?.target?.carbs_g ?? 350;
  const carbsRemaining = Math.max(0, carbsTarget - carbsConsumed);
  const carbsPercent = Math.round((carbsConsumed / carbsTarget) * 100);

  const fatConsumed = summary?.consumed?.fat_g ?? 28;
  const fatTarget = summary?.target?.fat_g ?? 70;
  const fatRemaining = Math.max(0, fatTarget - fatConsumed);
  const fatPercent = Math.round((fatConsumed / fatTarget) * 100);

  // 7-day trend dataset
  const weeklyTrends = {
    calories: {
      max: 3000,
      target: 2500,
      unit: 'kcal',
      days: [
        { day: 'Sat', date: 'Oct 4', consumed: 1650 },
        { day: 'Sun', date: 'Oct 5', consumed: 1820 },
        { day: 'Mon', date: 'Oct 6', consumed: 1720 },
        { day: 'Tue', date: 'Oct 7', consumed: 1950 },
        { day: 'Wed', date: 'Oct 8', consumed: 1540 },
        { day: 'Thu', date: 'Oct 9', consumed: 2100 },
        { day: 'Fri', date: 'Oct 10', consumed: 2280 },
      ]
    },
    protein: {
      max: 180,
      target: 150,
      unit: 'g',
      days: [
        { day: 'Sat', date: 'Oct 4', consumed: 110 },
        { day: 'Sun', date: 'Oct 5', consumed: 125 },
        { day: 'Mon', date: 'Oct 6', consumed: 95 },
        { day: 'Tue', date: 'Oct 7', consumed: 130 },
        { day: 'Wed', date: 'Oct 8', consumed: 105 },
        { day: 'Thu', date: 'Oct 9', consumed: 140 },
        { day: 'Fri', date: 'Oct 10', consumed: 145 },
      ]
    },
    carbs: {
      max: 400,
      target: 350,
      unit: 'g',
      days: [
        { day: 'Sat', date: 'Oct 4', consumed: 230 },
        { day: 'Sun', date: 'Oct 5', consumed: 280 },
        { day: 'Mon', date: 'Oct 6', consumed: 250 },
        { day: 'Tue', date: 'Oct 7', consumed: 310 },
        { day: 'Wed', date: 'Oct 8', consumed: 220 },
        { day: 'Thu', date: 'Oct 9', consumed: 320 },
        { day: 'Fri', date: 'Oct 10', consumed: 335 },
      ]
    },
    fat: {
      max: 90,
      target: 70,
      unit: 'g',
      days: [
        { day: 'Sat', date: 'Oct 4', consumed: 52 },
        { day: 'Sun', date: 'Oct 5', consumed: 60 },
        { day: 'Mon', date: 'Oct 6', consumed: 48 },
        { day: 'Tue', date: 'Oct 7', consumed: 62 },
        { day: 'Wed', date: 'Oct 8', consumed: 45 },
        { day: 'Thu', date: 'Oct 9', consumed: 65 },
        { day: 'Fri', date: 'Oct 10', consumed: 68 },
      ]
    }
  };

  const activeTrend = weeklyTrends[metricTab];

  const addWater = (amount) => {
    setWaterMl(prev => {
      const next = Math.min(4000, prev + amount);
      if (showToast) showToast(`Added +${amount} ml water!`, 'success');
      return next;
    });
  };

  const waterPercent = Math.min(100, Math.round((waterMl / 3000) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* ── ROW 1: Greeting Banner & Daily Goal ── */}
      <div className="dash-greeting-row">
        {/* Greeting Banner */}
        <div className="dash-banner">
          <div className="dash-banner-left">
            <div className="dash-banner-icon">
              <User size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>
                {greeting}, {firstName}!
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#047857', fontWeight: 500 }}>
                Stay consistent, your health goals are within reach.
              </p>
            </div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
        </div>

        {/* Daily Goal Card */}
        <div 
          className="dash-daily-goal-card"
          onClick={() => setIsProfileModalOpen(true)}
          title="Click to view or update goals"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 14, 
              background: '#ecfdf5', 
              color: '#10b981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid #a7f3d0'
            }}>
              <Target size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b' }}>Daily Goal</div>
              <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: 2 }}>
                Balanced Nutrition • Fitness • Better You
              </div>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: '#9ca3af' }} />
        </div>
      </div>

      {/* ── ROW 2: Today's Nutrition ── */}
      <div>
        <div className="dash-section-header">
          <h3 className="dash-section-title">
            <span style={{ 
              width: 26, 
              height: 26, 
              borderRadius: 8, 
              background: '#ecfdf5', 
              color: '#10b981', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Sprout size={16} />
            </span>
            <span>Today's Nutrition</span>
          </h3>
          <span className="dash-section-sub">Targets from your profile</span>
        </div>

        <div className="dash-macro-grid">
          {/* 1. Calories */}
          <div className="dash-macro-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: '#fff1f2', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={15} />
                  </div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#374151' }}>Calories</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#18181b', lineHeight: 1.2 }}>
                  <span style={{ color: '#ef4444' }}>{caloriesConsumed}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#6b7280' }}> / {caloriesTarget} kcal</span>
                </div>
              </div>
              <DonutGauge percent={caloriesPercent} color="#ef4444" track="#fee2e2" />
            </div>
            <div style={{ marginTop: 16, paddingTop: 10, borderTop: '1px solid #f3f4f6', fontSize: '0.78rem', color: '#9ca3af' }}>
              <span style={{ color: '#f43f5e', fontWeight: 600 }}>{caloriesRemaining.toLocaleString()} kcal</span> remaining
            </div>
          </div>

          {/* 2. Protein */}
          <div className="dash-macro-card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Dumbbell size={15} />
                  </div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#374151' }}>Protein</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#18181b', lineHeight: 1.2 }}>
                  <span>{proteinConsumed}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#6b7280' }}> / {proteinTarget} g</span>
                </div>
              </div>
              <DonutGauge percent={proteinPercent} color="#10b981" track="#d1fae5" />
            </div>
            <div style={{ marginTop: 16, paddingTop: 10, borderTop: '1px solid #f3f4f6', fontSize: '0.78rem', color: '#9ca3af' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{proteinRemaining} g</span> remaining
            </div>
          </div>

          {/* 3. Carbs */}
          <div className="dash-macro-card" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wheat size={15} />
                  </div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#374151' }}>Carbs</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#18181b', lineHeight: 1.2 }}>
                  <span>{carbsConsumed}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#6b7280' }}> / {carbsTarget} g</span>
                </div>
              </div>
              <DonutGauge percent={carbsPercent} color="#f59e0b" track="#fef3c7" />
            </div>
            <div style={{ marginTop: 16, paddingTop: 10, borderTop: '1px solid #f3f4f6', fontSize: '0.78rem', color: '#9ca3af' }}>
              <span style={{ color: '#d97706', fontWeight: 600 }}>{carbsRemaining} g</span> remaining
            </div>
          </div>

          {/* 4. Fat */}
          <div className="dash-macro-card" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Droplet size={15} />
                  </div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#374151' }}>Fat</span>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#18181b', lineHeight: 1.2 }}>
                  <span>{fatConsumed}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#6b7280' }}> / {fatTarget} g</span>
                </div>
              </div>
              <DonutGauge percent={fatPercent} color="#8b5cf6" track="#ede9fe" />
            </div>
            <div style={{ marginTop: 16, paddingTop: 10, borderTop: '1px solid #f3f4f6', fontSize: '0.78rem', color: '#9ca3af' }}>
              <span style={{ color: '#7c3aed', fontWeight: 600 }}>{fatRemaining} g</span> remaining
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Middle Grid (Meals, Weekly Trend, Quick Actions) ── */}
      <div className="dash-middle-grid">
        
        {/* 1. Today's Meals */}
        <div className="dash-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem', fontWeight: 700 }}>
              <Utensils size={18} style={{ color: '#16a34a' }} />
              <span>Today's Meals</span>
            </h4>
            <button
              onClick={() => setActiveTab('history')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Breakfast */}
            <div className="dash-meal-row" onClick={() => setActiveTab('history')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: '0.72rem', color: '#d97706', minWidth: 62 }}>
                  <div style={{ fontWeight: 700 }}>Breakfast</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.68rem' }}>08:15 AM</div>
                </div>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  🥣
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18181b' }}>Poha (1 plate)</div>
                  <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>+ 1 cup tea</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18181b' }}>320 kcal</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>P 8g | C 58g | F 6g</div>
                </div>
                <ChevronRight size={14} style={{ color: '#9ca3af' }} />
              </div>
            </div>

            {/* Lunch */}
            <div className="dash-meal-row" onClick={() => setActiveTab('history')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: '0.72rem', color: '#ea580c', minWidth: 62 }}>
                  <div style={{ fontWeight: 700 }}>Lunch</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.68rem' }}>01:30 PM</div>
                </div>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#ffedd5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  🍱
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18181b' }}>2 Chapati + Mixed Veg</div>
                  <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>+ Rice + Dal</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18181b' }}>520 kcal</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>P 18g | C 72g | F 14g</div>
                </div>
                <ChevronRight size={14} style={{ color: '#9ca3af' }} />
              </div>
            </div>

            {/* Snacks */}
            <div className="dash-meal-row" onClick={() => setActiveTab('history')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: '0.72rem', color: '#ca8a04', minWidth: 62 }}>
                  <div style={{ fontWeight: 700 }}>Snacks</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.68rem' }}>05:12 PM</div>
                </div>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#fef9c3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  🍌
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18181b' }}>Banana (1 medium)</div>
                  <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>Fresh fruit</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18181b' }}>105 kcal</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>P 1g | C 27g | F 0g</div>
                </div>
                <ChevronRight size={14} style={{ color: '#9ca3af' }} />
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <button
              onClick={() => setActiveTab('manual')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 14px',
                borderRadius: 12,
                border: 'none',
                background: '#ecfdf5',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={15} />
              <span>Add Food</span>
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 14px',
                borderRadius: 12,
                border: '1.5px solid #e5e7eb',
                background: '#ffffff',
                color: '#374151',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Camera size={15} />
              <span>Scan Meal</span>
            </button>
          </div>
        </div>

        {/* 2. Weekly Nutrition Trend */}
        <div className="dash-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem', fontWeight: 700 }}>
              <TrendingUp size={18} style={{ color: '#16a34a' }} />
              <span>Weekly Nutrition Trend</span>
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#6b7280' }}>
              <Calendar size={13} />
              <span>4 Oct – 10 Oct 2026</span>
            </div>
          </div>

          {/* Metric Selector Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            {[
              { id: 'calories', label: 'Calories' },
              { id: 'protein', label: 'Protein' },
              { id: 'carbs', label: 'Carbs' },
              { id: 'fat', label: 'Fat' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMetricTab(tab.id)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: metricTab === tab.id ? '#10b981' : '#f4f4f5',
                  color: metricTab === tab.id ? '#ffffff' : '#52525b',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bar Chart Area */}
          <div style={{ display: 'flex', flex: 1, minHeight: 180, position: 'relative' }}>
            {/* Y-axis markers */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 10, fontSize: '0.68rem', color: '#9ca3af', textAlign: 'right', minWidth: 24, paddingBottom: 28 }}>
              <span>{metricTab === 'calories' ? '3k' : metricTab === 'carbs' ? '400' : metricTab === 'protein' ? '180' : '90'}</span>
              <span>{metricTab === 'calories' ? '2k' : metricTab === 'carbs' ? '250' : metricTab === 'protein' ? '120' : '60'}</span>
              <span>{metricTab === 'calories' ? '1k' : metricTab === 'carbs' ? '120' : metricTab === 'protein' ? '60' : '30'}</span>
              <span>0</span>
            </div>

            {/* Bars container */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, alignItems: 'flex-end', paddingBottom: 28 }}>
              {activeTrend.days.map((item, idx) => {
                const consumedHeight = Math.min(100, Math.round((item.consumed / activeTrend.max) * 100));
                const targetHeight = Math.min(100, Math.round((activeTrend.target / activeTrend.max) * 100));

                return (
                  <div key={idx} style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
                    {/* Bar track and fill */}
                    <div
                      title={`${item.day} ${item.date}: ${item.consumed} / ${activeTrend.target} ${activeTrend.unit}`}
                      style={{
                        position: 'relative',
                        width: '16px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                        borderRadius: 8,
                        background: '#f0fdf4',
                        cursor: 'pointer'
                      }}
                    >
                      {/* Target marker backdrop */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${targetHeight}%`,
                        background: '#dcfce7',
                        borderRadius: 8
                      }} />
                      {/* Consumed fill bar */}
                      <div style={{
                        position: 'relative',
                        zIndex: 2,
                        width: '100%',
                        height: `${consumedHeight}%`,
                        background: '#10b981',
                        borderRadius: 8,
                        transition: 'height 0.5s ease'
                      }} />
                    </div>

                    {/* Day / Date labels */}
                    <div style={{ position: 'absolute', bottom: -28, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#374151' }}>{item.day}</div>
                      <div style={{ fontSize: '0.62rem', color: '#9ca3af' }}>{item.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 16, fontSize: '0.74rem', color: '#6b7280' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              <span>Consumed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dcfce7' }} />
              <span>Target</span>
            </div>
          </div>
        </div>

        {/* 3. Right Column: Quick Actions + Water + AI Coach */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Quick Actions Card */}
          <div className="dash-panel" style={{ padding: '16px 18px' }}>
            <h4 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.96rem', fontWeight: 700 }}>
              <span style={{ color: '#16a34a' }}>⚡</span>
              <span>Quick Actions</span>
            </h4>

            {/* Green: Plate Scanner */}
            <button
              className="dash-quick-btn"
              onClick={() => setActiveTab('scan')}
              style={{ background: '#059669' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Plate Scanner</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>Scan your meal</div>
              </div>
            </button>

            {/* Blue: Add Food */}
            <button
              className="dash-quick-btn"
              onClick={() => setActiveTab('manual')}
              style={{ background: '#0284c7' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Add Food</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>Search & log food</div>
              </div>
            </button>

            {/* Purple: Voice Logger */}
            <button
              className="dash-quick-btn"
              onClick={() => setActiveTab('voice')}
              style={{ background: '#7c3aed', marginBottom: 0 }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Voice Logger</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>Speak your meal</div>
              </div>
            </button>
          </div>

          {/* Water Intake Card */}
          <div className="dash-panel" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Droplet size={16} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18181b' }}>Water Intake</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>
                {(waterMl / 1000).toFixed(1)} L / 3.0 L
                <span style={{ marginLeft: 6, fontSize: '0.74rem', color: '#6b7280', fontWeight: 500 }}>
                  {waterPercent}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ height: 8, background: '#e0f2fe', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{
                height: '100%',
                width: `${waterPercent}%`,
                background: 'linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)',
                borderRadius: 999,
                transition: 'width 0.4s ease'
              }} />
            </div>

            {/* Quick Add Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[250, 500, 750].map(amt => (
                <button
                  key={amt}
                  onClick={() => addWater(amt)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  +{amt} ml
                </button>
              ))}
            </div>
          </div>

          {/* AI Nutrition Coach Card */}
          <div className="dash-panel" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} style={{ color: '#8b5cf6' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18181b' }}>AI Nutrition Coach</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 6 }}>
                Beta
              </span>
            </div>

            {/* Tip bubble */}
            <div style={{
              display: 'flex',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 12,
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              marginBottom: 12
            }}>
              <Lightbulb size={18} style={{ color: '#8b5cf6', flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#4c1d95', lineHeight: 1.45 }}>
                You're doing great with your protein intake today! Consider adding more healthy fats (like nuts or seeds) to meet your daily goal.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => setIsChatOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                padding: '10px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
              }}
            >
              <span>Ask AI Coach</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 4: Your Health at a Glance ── */}
      <div>
        <div className="dash-section-header">
          <h3 className="dash-section-title">
            <span style={{ 
              width: 26, 
              height: 26, 
              borderRadius: 8, 
              background: '#ecfdf5', 
              color: '#10b981', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Activity size={16} />
            </span>
            <span>Your Health at a Glance</span>
          </h3>
        </div>

        <div className="dash-health-bottom">
          {/* 4 Health Stats */}
          <div className="dash-panel" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {/* Weight */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Scale size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Weight</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#18181b' }}>55 kg</div>
                <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>(from profile)</div>
              </div>
            </div>

            {/* Height */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ruler size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Height</div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#18181b' }}>5'6" (168 cm)</div>
                <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>(from profile)</div>
              </div>
            </div>

            {/* Activity Level */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Activity Level</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#18181b' }}>Moderate</div>
                <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>(from profile)</div>
              </div>
            </div>

            {/* Goal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Goal</div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#18181b' }}>Maintain Weight</div>
                <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>(from profile)</div>
              </div>
            </div>
          </div>

          {/* Motivation Callout Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1.5px solid #a7f3d0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative', zIndex: 2 }}>
              <div style={{ color: '#059669', marginTop: 2 }}>
                <Sprout size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#065f46' }}>
                  Small steps. Big results.
                </div>
                <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: 4, lineHeight: 1.45, maxWidth: 300 }}>
                  Track your meals, stay consistent, and let NutriVision help you build a healthier you!
                </div>
              </div>
            </div>
            <div style={{
              position: 'relative',
              zIndex: 1,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <Leaf size={24} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
