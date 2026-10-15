/**
 * HealthMetrics Component - Example Integration
 * 
 * This is a simplified example showing how to integrate the custom hooks
 * into the existing HealthMetrics component. Use this as a reference
 * to update the full component in HealthMetrics.jsx
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useHealthMetrics } from '../../hooks/useHealthMetrics';
import { useDailyNutrition } from '../../hooks/useDailyNutrition';
import {
  User, Scale, Activity, Droplet, AlertCircle, Loader, Plus, Target, Flame, Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, LineChart, Line 
} from 'recharts';

export const HealthMetricsExample = () => {
  const { user, setIsProfileModalOpen, showToast, setIsChatOpen } = useApp();
  
  // State
  const [timeRange, setTimeRange] = useState('30D');
  const [activeModal, setActiveModal] = useState(null);
  const [weightInput, setWeightInput] = useState('');

  // Custom Hooks - Data Layer
  const { profile, loading: profileLoading } = useUserProfile();
  const { 
    latestWeight, 
    todayHydration, 
    latestBodyFat, 
    weightChartData,
    recentMeasurements,
    loading: metricsLoading,
    addMetric 
  } = useHealthMetrics(timeRange);
  const { summary, remaining, percentages, loading: nutritionLoading } = useDailyNutrition();

  // Fetch fitness goals for BMR/TDEE data
  const [fitnessData, setFitnessData] = useState(null);
  useEffect(() => {
    if (user?.id) {
      api.fitness.goals(user.id)
        .then(data => setFitnessData(data))
        .catch(() => setFitnessData(null));
    }
  }, [user?.id]);

  // Extract BMR and TDEE from summary or fitness data
  const bmr = summary?.target?.bmr || fitnessData?.bmr || null;
  const tdee = summary?.target?.tdee || fitnessData?.tdee || null;
  const dailyCalorieTarget = summary?.target?.calories || fitnessData?.calories || 2000;
  const activeGoal = fitnessData?.goal || profile?.health_goal || user?.health_goal || 'fitness';
  const targetWeight = useMemo(() => {
    if (!latestWeight) return null;
    const savedTarget = Number(profile?.target_weight_kg || user?.target_weight_kg);
    if (activeGoal === 'gain') return Math.max(savedTarget || 0, Number(latestWeight) + 5);
    if (activeGoal === 'lose') return Math.min(savedTarget || Number.POSITIVE_INFINITY, Number(latestWeight) - 5);
    return savedTarget || Number(latestWeight);
  }, [activeGoal, latestWeight, profile?.target_weight_kg, user?.target_weight_kg]);

  // Computed Values
  const bmi = useMemo(() => {
    const weight = latestWeight || profile?.weight_kg || profile?.weight;
    const height = profile?.height_cm || profile?.height;
    if (weight && height) {
      return (weight / ((height / 100) ** 2)).toFixed(1);
    }
    return null;
  }, [latestWeight, profile]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return { label: 'Unknown', color: '#9ca3af', bg: '#f3f4f6' };
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: '#f59e0b', bg: '#fef3c7' };
    if (val < 25) return { label: 'Normal', color: '#10b981', bg: '#dcfce7' };
    if (val < 30) return { label: 'Overweight', color: '#f97316', bg: '#ffedd5' };
    return { label: 'Obese', color: '#ef4444', bg: '#fee2e2' };
  }, [bmi]);

  const hydrationPercent = Math.min(100, Math.round((todayHydration / 3000) * 100));
  const isProfileIncomplete = !profile?.height_cm && !profile?.height;
  const isLoading = profileLoading || metricsLoading || nutritionLoading;

  // Event Handlers
  const handleLogWeight = async (e) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0) {
      try {
        await addMetric('weight', val, 'kg');
        setWeightInput('');
        setActiveModal(null);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Loader size={48} className="spinner" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ color: '#64748b' }}>Loading your health metrics...</h3>
      </div>
    );
  }

  // Incomplete Profile State
  if (isProfileIncomplete) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '2px solid #fbbf24',
        borderRadius: '16px',
        padding: '24px',
        margin: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <AlertCircle size={40} color="#d97706" />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700, color: '#78350f' }}>
            Complete Your Profile to Unlock Health Trends
          </h3>
          <p style={{ margin: 0, color: '#92400e' }}>
            Add your height, weight, and health goals to get personalized insights and track your progress.
          </p>
        </div>
        <button
          onClick={() => setIsProfileModalOpen(true)}
          style={{
            padding: '12px 24px',
            background: '#d97706',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Complete Profile
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {/* Header */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <User size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
              {profile?.name?.split(' ')[0] || 'Your'}'s Health Dashboard
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Track your progress and reach your fitness goals
            </p>
          </div>
        </div>

        {/* Goal Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          borderRadius: '12px',
          background: '#ecfdf5',
          border: '1px solid #d1fae5'
        }}>
          <Target size={20} color="#059669" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
              Goal: {activeGoal === 'lose' ? 'Weight Loss' :
                     activeGoal === 'gain' ? 'Muscle Gain' : 'Maintenance'}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        
        {/* Weight Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '20px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => setActiveModal('weight')}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Scale size={20} color="#059669" />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>Weight</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
            {latestWeight ? `${latestWeight} kg` : '--'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '8px' }}>
            Target: {targetWeight ? targetWeight.toFixed(1) : '--'} kg
          </div>
        </div>

        {/* Body Fat Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#faf5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={20} color="#7c3aed" />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>Body Fat</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
            {latestBodyFat ? `${latestBodyFat}%` : '--'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '8px' }}>
            Target: 15-18%
          </div>
        </div>

        {/* BMI Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={20} color="#2563eb" />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>BMI</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
            {bmi || '--'}
          </div>
          {bmi && (
            <span style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 12px',
              borderRadius: '12px',
              background: bmiCategory.bg,
              color: bmiCategory.color,
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {bmiCategory.label}
            </span>
          )}
        </div>

        {/* Hydration Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Droplet size={20} color="#2563eb" />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>Hydration</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
            {(todayHydration / 1000).toFixed(1)} L
          </div>
          <div style={{
            marginTop: '12px',
            height: '8px',
            borderRadius: '4px',
            background: '#e0f2fe',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${hydrationPercent}%`,
              height: '100%',
              background: '#38bdf8',
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px' }}>
            {hydrationPercent}% of 3.0L goal
          </div>
        </div>

        {/* BMR Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flame size={20} color="#d97706" />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>BMR</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
            {bmr ? `${bmr}` : '--'} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#6b7280' }}>kcal</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '8px' }}>
            Basal Metabolic Rate
          </div>
        </div>

        {/* TDEE Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} color="#ef4444" />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>TDEE</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
            {tdee ? `${tdee}` : '--'} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#6b7280' }}>kcal</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '8px' }}>
            Total Daily Energy
          </div>
        </div>

      </div>

      {/* Weight Trend Chart */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '24px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Weight Trend</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['7D', '30D', '90D'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: timeRange === range ? '#10b981' : '#f3f4f6',
                  color: timeRange === range ? '#fff' : '#6b7280',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {weightChartData.length === 0 ? (
          // Empty State
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '2px dashed #cbd5e1'
          }}>
            <Scale size={48} color="#9ca3af" strokeWidth={1.5} />
            <h4 style={{ margin: '16px 0 8px', color: '#64748b' }}>No Weight Data Yet</h4>
            <p style={{ margin: '0 0 20px', color: '#9ca3af', fontSize: '0.875rem' }}>
              Start tracking your weight journey today!
            </p>
            <button
              onClick={() => setActiveModal('weight')}
              style={{
                padding: '10px 20px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={18} />
              Log Today's Weight
            </button>
          </div>
        ) : (
          // Chart
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weightChartData}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#9ca3af"
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#10b981" 
                strokeWidth={2.5}
                fill="url(#weightGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weight Logging Modal */}
      {activeModal === 'weight' && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setActiveModal(null)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: '1.25rem', fontWeight: 700 }}>
              Log Your Weight
            </h3>
            <form onSubmit={handleLogWeight}>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                placeholder="Enter weight (kg)"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  marginBottom: '16px'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{
                    padding: '10px 20px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!weightInput}
                  style={{
                    padding: '10px 20px',
                    background: weightInput ? '#10b981' : '#d1d5db',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: weightInput ? 'pointer' : 'not-allowed'
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
