import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User, Camera, Target, Leaf, ShieldCheck,
  Scale, HeartPulse, Info, X, Save, Drumstick,
  Sprout, MoreHorizontal, Activity, Check
} from 'lucide-react';

export const ProfileSettingsModal = () => {
  const { user, updateUserProfile, isProfileModalOpen, setIsProfileModalOpen, showToast } = useApp();

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [height, setHeight] = useState(user?.height || '');
  const [weight, setWeight] = useState(user?.weight || '');
  const [activityLevel, setActivityLevel] = useState(user?.activity_level || '');
  const [sex, setSex] = useState(user?.sex || '');
  const [healthGoal, setHealthGoal] = useState(user?.health_goal || 'lose');
  const [dietPreference, setDietPreference] = useState(user?.diet_preference || 'vegetarian');
  const [medicalCondition, setMedicalCondition] = useState(user?.medical_condition || '');
  const [allergy, setAllergy] = useState(user?.allergy || '');

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.age) setAge(user.age);
      if (user.height) setHeight(user.height);
      if (user.weight) setWeight(user.weight);
      if (user.activity_level) setActivityLevel(user.activity_level);
      if (user.sex) setSex(user.sex);
      if (user.health_goal) setHealthGoal(user.health_goal);
      if (user.diet_preference) setDietPreference(user.diet_preference);
      if (user.medical_condition) setMedicalCondition(user.medical_condition);
      if (user.allergy) setAllergy(user.allergy);
    }
  }, [user]);

  if (!isProfileModalOpen) return null;

  // Calculate dynamic profile completion percentage
  const fields = [fullName, age, height, weight, activityLevel, sex, healthGoal, dietPreference];
  const filledCount = fields.filter(f => f && String(f).trim() !== '').length;
  const completionPercentage = Math.round((filledCount / fields.length) * 100);

  const handleSave = (e) => {
    if (e) e.preventDefault();

    const profileData = {
      name: fullName || user?.name || 'User',
      age: Number(age) || null,
      height: Number(height) || null,
      weight: Number(weight) || null,
      activity_level: activityLevel,
      sex: sex,
      health_goal: healthGoal,
      diet_preference: dietPreference,
      medical_condition: medicalCondition,
      allergy: allergy
    };

    if (updateUserProfile) {
      updateUserProfile(profileData);
    }

    if (user?.id) {
      localStorage.setItem('nutrivision_profile_saved_' + user.id, 'true');
    }

    showToast('Profile saved successfully! Your plan is customized.', 'success');
    setIsProfileModalOpen(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 920,
        maxHeight: '94vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* ── Modal Header Topbar ─────────────────────────────── */}
        <div style={{
          padding: '18px 26px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <User size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>
                My Profile
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
                Your personal details, health goals, and nutrition preferences
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={17} strokeWidth={2.4} />
          </button>
        </div>

        {/* ── Modal Body Content ──────────────────────────────── */}
        <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Banner Card: Your personal profile */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            {/* Left: Avatar + Title + Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#065f46'
                }}>
                  <User size={40} strokeWidth={2} />
                </div>
                <button
                  type="button"
                  title="Upload photo"
                  onClick={() => showToast('Avatar upload ready', 'info')}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <Camera size={12} />
                </button>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#111827' }}>
                  Your personal profile
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
                  Complete your details to personalize your plan.
                </p>

                {/* Progress bar */}
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    width: '100%',
                    maxWidth: 380,
                    height: 5,
                    borderRadius: 4,
                    background: '#e5e7eb',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${completionPercentage}%`,
                      height: '100%',
                      background: '#10b981',
                      borderRadius: 4,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    maxWidth: 380,
                    marginTop: 5,
                    fontSize: '0.74rem',
                    color: '#6b7280'
                  }}>
                    <span>Profile completion</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{completionPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Graphic badge with note */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexShrink: 0,
              paddingLeft: 16,
              borderLeft: '1px solid #f1f5f9'
            }}>
              <div style={{ fontSize: '38px', lineHeight: 1 }}>
                🥗🏋️
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#059669',
                  fontStyle: 'italic',
                  lineHeight: 1.3
                }}>
                  Better choices<br />for a healthier<br />you
                </div>
                <div style={{
                  width: '100%',
                  height: 2,
                  background: '#10b981',
                  borderRadius: 2,
                  marginTop: 3
                }} />
              </div>
            </div>
          </div>

          {/* Section 1: Personal Details */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '20px 22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <User size={14} />
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#111827' }}>
                  Personal Details
                </span>
                <span style={{ fontSize: '0.76rem', color: '#6b7280', marginLeft: 8 }}>
                  Tell us about yourself.
                </span>
              </div>
            </div>

            {/* 4 Inputs in a row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Full name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Age (years) *
                </label>
                <input
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Height (cm) *
                </label>
                <input
                  type="number"
                  placeholder="Enter your height"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Current weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter your weight"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Row 2: Activity level + Sex */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginTop: 14
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Activity level *
                </label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.84rem',
                    outline: 'none',
                    background: '#fff',
                    color: activityLevel ? '#111827' : '#9ca3af',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select your activity level</option>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Lightly active (exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately active (exercise 3-5 days/week)</option>
                  <option value="very_active">Very active (hard exercise 6-7 days/week)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Sex (optional)
                </label>
                <select
                  value={sex}
                  onChange={e => setSex(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.84rem',
                    outline: 'none',
                    background: '#fff',
                    color: sex ? '#111827' : '#9ca3af',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select your sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Health Goal */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '20px 22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Target size={14} />
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#111827' }}>
                  Health Goal
                </span>
                <span style={{ fontSize: '0.76rem', color: '#6b7280', marginLeft: 8 }}>
                  What do you want to achieve?
                </span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12
            }}>
              {[
                { id: 'lose', title: 'Lose weight', desc: 'Feel lighter & healthier', icon: Scale, color: '#059669', bg: '#ecfdf5' },
                { id: 'maintain', title: 'Maintain weight', desc: 'Stay healthy & fit', icon: Activity, color: '#2563eb', bg: '#eff6ff' },
                { id: 'gain', title: 'Gain weight', desc: 'Build muscle & strength', icon: Activity, color: '#2563eb', bg: '#eff6ff' },
                { id: 'fitness', title: 'Improve fitness', desc: 'Increase energy & stamina', icon: HeartPulse, color: '#059669', bg: '#ecfdf5' }
              ].map(g => {
                const Icon = g.icon;
                const isSelected = healthGoal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setHealthGoal(g.id)}
                    style={{
                      border: isSelected ? '2px solid #10b981' : '1px solid #e5e7eb',
                      background: isSelected ? '#f0fdf4' : '#fff',
                      borderRadius: 14,
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: g.bg,
                      color: g.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#111827' }}>
                      {g.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                      {g.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Dietary Preferences */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '20px 22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Leaf size={14} />
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#111827' }}>
                  Dietary Preferences
                </span>
                <span style={{ fontSize: '0.76rem', color: '#6b7280', marginLeft: 8 }}>
                  Choose the type of diet you follow.
                </span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12
            }}>
              {[
                { id: 'vegetarian', label: 'Vegetarian', icon: Leaf },
                { id: 'non_vegetarian', label: 'Non-vegetarian', icon: Drumstick },
                { id: 'vegan', label: 'Vegan', icon: Sprout },
                { id: 'other', label: 'Other', icon: MoreHorizontal }
              ].map(d => {
                const Icon = d.icon;
                const isSelected = dietPreference === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setDietPreference(d.id)}
                    style={{
                      border: isSelected ? '2px solid #10b981' : '1px solid #e5e7eb',
                      background: isSelected ? '#f0fdf4' : '#fff',
                      borderRadius: 12,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={16} color="#059669" />
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#111827' }}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Health & Safety */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '20px 22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <ShieldCheck size={14} />
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#111827' }}>
                  Health & Safety
                </span>
                <span style={{ fontSize: '0.76rem', color: '#6b7280', marginLeft: 8 }}>
                  Optional. Helps us suggest safer and more suitable nutrition plans.
                </span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Medical conditions (optional)
                </label>
                <select
                  value={medicalCondition}
                  onChange={e => setMedicalCondition(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.84rem',
                    outline: 'none',
                    background: '#fff',
                    color: medicalCondition ? '#111827' : '#9ca3af',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select or type (e.g. diabetes, hypertension)</option>
                  <option value="none">None</option>
                  <option value="diabetes">Diabetes (Type 2)</option>
                  <option value="hypertension">Hypertension (High BP)</option>
                  <option value="high_cholesterol">High Cholesterol</option>
                  <option value="pcos">PCOS / PCOD</option>
                  <option value="thyroid">Thyroid</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Food allergies (optional)
                </label>
                <select
                  value={allergy}
                  onChange={e => setAllergy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: '0.84rem',
                    outline: 'none',
                    background: '#fff',
                    color: allergy ? '#111827' : '#9ca3af',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select or type (e.g. nuts, dairy, gluten)</option>
                  <option value="none">None</option>
                  <option value="gluten">Gluten / Celiac</option>
                  <option value="dairy">Dairy / Lactose</option>
                  <option value="peanuts">Peanuts / Tree Nuts</option>
                  <option value="soy">Soy</option>
                  <option value="egg">Eggs</option>
                  <option value="shellfish">Shellfish</option>
                </select>
              </div>
            </div>

            {/* Blue Info Notice */}
            <div style={{
              marginTop: 14,
              background: '#f0f9ff',
              border: '1px solid #e0f2fe',
              borderRadius: 8,
              padding: '9px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.76rem',
              color: '#0369a1'
            }}>
              <Info size={15} color="#0284c7" style={{ flexShrink: 0 }} />
              <span>
                Only share what you're comfortable sharing. Used to tailor safer nutrition suggestions.
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer Buttons ──────────────────────────────────── */}
        <div style={{
          padding: '16px 26px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          background: '#fff',
          position: 'sticky',
          bottom: 0,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20
        }}>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            style={{
              padding: '9px 20px',
              borderRadius: 10,
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#374151',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '9px 22px',
              borderRadius: 10,
              border: 'none',
              background: '#10b981',
              color: '#fff',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(16,185,129,0.25)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
          >
            <Save size={15} />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
