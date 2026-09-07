import React, { useState } from 'react';
import { GuardrailBadge } from '../guardrails/GuardrailBadge';
import { Edit2, Check, Sliders, Trash2 } from 'lucide-react';

export const ItemNutritionCard = ({ 
  item, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [grams, setGrams] = useState(item.est_grams || 100);
  const [label, setLabel] = useState(item.food_label || '');

  const handleGramsChange = (e) => {
    const newGrams = Number(e.target.value);
    setGrams(newGrams);
    // Approximate scaling
    const factor = newGrams / (item.est_grams || 1);
    onUpdate({
      ...item,
      est_grams: newGrams,
      calories: Math.round((item.calories || 0) * factor),
      protein_g: Math.round((item.protein_g || 0) * factor * 10) / 10,
      carbs_g: Math.round((item.carbs_g || 0) * factor * 10) / 10,
      fat_g: Math.round((item.fat_g || 0) * factor * 10) / 10,
    });
  };

  const handleLabelSave = () => {
    setIsEditing(false);
    onUpdate({
      ...item,
      food_label: label
    });
  };

  return (
    <div 
      className={`glass-panel ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{
        padding: '16px 20px',
        border: isSelected ? '1px solid var(--emerald-500)' : '1px solid var(--border-subtle)',
        background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(19, 26, 42, 0.65)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'var(--transition)'
      }}
    >
      {/* Item Title, Confidence & Guardrail Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input 
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="text-input"
                style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                autoFocus
              />
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleLabelSave}
                style={{ padding: '5px 8px' }}
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1.05rem', 
                fontWeight: 700, 
                textTransform: 'capitalize' 
              }}>
                {item.food_label.replace(/_/g, ' ')}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title="Edit item name"
              >
                <Edit2 size={13} />
              </button>
            </div>
          )}

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({Math.round(item.confidence * 100)}% conf)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GuardrailBadge status={item.guardrail_status} reason={item.guardrail_reason} />
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--rose-400)', cursor: 'pointer', padding: '4px' }}
              title="Remove item"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Portion Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Sliders size={15} color="var(--text-muted)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '70px' }}>
          Portion: <strong>{item.est_grams}g</strong>
        </span>
        <input 
          type="range"
          min="10"
          max="450"
          step="5"
          value={item.est_grams || 100}
          onChange={handleGramsChange}
          style={{ 
            flex: 1, 
            accentColor: 'var(--emerald-500)', 
            cursor: 'pointer' 
          }}
        />
      </div>

      {/* Macro Breakdown Pills */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '8px', 
        paddingTop: '6px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 4px', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ENERGY</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.calories} <span style={{ fontSize: '0.65rem' }}>kcal</span></div>
        </div>
        <div style={{ textAlign: 'center', background: 'rgba(56, 189, 248, 0.08)', padding: '6px 4px', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>PROTEIN</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>{item.protein_g}g</div>
        </div>
        <div style={{ textAlign: 'center', background: 'rgba(251, 191, 36, 0.08)', padding: '6px 4px', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.7rem', color: '#fbbf24' }}>CARBS</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>{item.carbs_g}g</div>
        </div>
        <div style={{ textAlign: 'center', background: 'rgba(244, 63, 94, 0.08)', padding: '6px 4px', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.7rem', color: '#f43f5e' }}>FAT</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f43f5e' }}>{item.fat_g}g</div>
        </div>
      </div>
    </div>
  );
};
