import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldAlert, HeartPulse, Sliders, Check, UserCheck } from 'lucide-react';

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Dairy/Milk', 'Gluten', 'Shellfish', 'Soy', 'Eggs', 'Mustard'
];

const COMMON_CONDITIONS = [
  'Type 2 Diabetes Risk', 
  'Mild Hypertension', 
  'Celiac Disease', 
  'Chronic Kidney Disease', 
  'Dyslipidemia / High Cholesterol', 
  'Hyperuricemia (High Uric Acid)'
];

export const ProfileSettingsModal = () => {
  const { user, updateUserProfile, isProfileModalOpen, setIsProfileModalOpen } = useApp();

  const [name, setName] = useState(user.name || '');
  const [targetCalories, setTargetCalories] = useState(user.target_calories || 2150);
  const [targetProtein, setTargetProtein] = useState(user.target_protein || 115);
  const [targetCarbs, setTargetCarbs] = useState(user.target_carbs || 240);
  const [targetFat, setTargetFat] = useState(user.target_fat || 65);
  const [allergies, setAllergies] = useState(user.allergies || []);
  const [conditions, setConditions] = useState(user.conditions || []);

  if (!isProfileModalOpen) return null;

  const toggleAllergy = (item) => {
    if (allergies.includes(item)) {
      setAllergies(allergies.filter(a => a !== item));
    } else {
      setAllergies([...allergies, item]);
    }
  };

  const toggleCondition = (item) => {
    if (conditions.includes(item)) {
      setConditions(conditions.filter(c => c !== item));
    } else {
      setConditions([...conditions, item]);
    }
  };

  const handleSave = () => {
    updateUserProfile({
      name,
      target_calories: Number(targetCalories),
      target_protein: Number(targetProtein),
      target_carbs: Number(targetCarbs),
      target_fat: Number(targetFat),
      allergies,
      conditions
    });
    setIsProfileModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsProfileModalOpen(false)}>
      <div 
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem' }}>Personal & Medical Profile</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Powers the NutriVision guardrail engine to protect your diet
            </span>
          </div>
          <button 
            onClick={() => setIsProfileModalOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Name input */}
        <div className="input-group">
          <label className="input-label">User Full Name</label>
          <input 
            type="text" 
            className="text-input" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>

        {/* Daily Targets */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            DAILY NUTRITION TARGETS (ICMR RDA)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div className="input-group">
              <label className="input-label">Calories</label>
              <input 
                type="number" 
                className="text-input" 
                value={targetCalories} 
                onChange={(e) => setTargetCalories(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Protein (g)</label>
              <input 
                type="number" 
                className="text-input" 
                value={targetProtein} 
                onChange={(e) => setTargetProtein(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Carbs (g)</label>
              <input 
                type="number" 
                className="text-input" 
                value={targetCarbs} 
                onChange={(e) => setTargetCarbs(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Fat (g)</label>
              <input 
                type="number" 
                className="text-input" 
                value={targetFat} 
                onChange={(e) => setTargetFat(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Medical Conditions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <HeartPulse size={16} color="var(--saffron-400)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--saffron-400)' }}>
              MEDICAL CONDITIONS (TRIGGERS HEALTH WARNINGS)
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {COMMON_CONDITIONS.map((cond) => {
              const active = conditions.includes(cond);
              return (
                <button
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '0.82rem',
                    background: active ? 'rgba(245, 158, 11, 0.2)' : undefined,
                    borderColor: active ? 'var(--saffron-500)' : undefined,
                    color: active ? 'var(--saffron-400)' : undefined
                  }}
                >
                  {active && <Check size={13} />}
                  <span>{cond}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Allergens */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <ShieldAlert size={16} color="var(--rose-400)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--rose-400)' }}>
              FOOD ALLERGENS (TRIGGERS STRICT BLOCKS)
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {COMMON_ALLERGIES.map((allg) => {
              const active = allergies.includes(allg);
              return (
                <button
                  key={allg}
                  onClick={() => toggleAllergy(allg)}
                  className={`btn btn-sm ${active ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ fontSize: '0.82rem' }}
                >
                  {active && <Check size={13} />}
                  <span>{allg}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsProfileModalOpen(false)}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
          >
            <UserCheck size={16} />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
