import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search, Plus, Minus, X, Check,
  Utensils, Sparkles, Coffee, Sun, Moon, Star,
  Camera, Mic, Apple
} from 'lucide-react';

/* ── Food catalogue ───────────────────────────────────────── */
const CATALOGUE = [
  // Indian
  { id: 'roti',         name: 'Roti (whole wheat)', cat: 'Indian',    emoji: '🫓', serving: '1 piece (30g)',     kcal: 96,  p: 3,  c: 18, f: 1  },
  { id: 'rice',         name: 'Rice (cooked)',       cat: 'Indian',    emoji: '🍚', serving: '1 cup (150g)',      kcal: 206, p: 4,  c: 45, f: 0  },
  { id: 'dal',          name: 'Dal (Lentils)',        cat: 'Indian',    emoji: '🫕', serving: '1 bowl (200g)',     kcal: 232, p: 18, c: 40, f: 1  },
  { id: 'paneer',       name: 'Paneer',               cat: 'Dairy',     emoji: '🧀', serving: '100g',             kcal: 265, p: 18, c: 1,  f: 21 },
  { id: 'poha',         name: 'Poha',                 cat: 'Indian',    emoji: '🍽️', serving: '1 plate (200g)',   kcal: 220, p: 5,  c: 46, f: 1  },
  { id: 'idli',         name: 'Idli',                 cat: 'Indian',    emoji: '🫔', serving: '2 idlis (120g)',   kcal: 70,  p: 2,  c: 14, f: 0  },
  { id: 'dosa',         name: 'Plain Dosa',           cat: 'Indian',    emoji: '🥘', serving: '1 dosa (100g)',    kcal: 133, p: 4,  c: 25, f: 3  },
  { id: 'sambar',       name: 'Sambar',               cat: 'Indian',    emoji: '🍲', serving: '1 bowl (200g)',    kcal: 80,  p: 4,  c: 12, f: 2  },
  // Protein
  { id: 'egg',          name: 'Boiled Egg',           cat: 'Protein',   emoji: '🥚', serving: '1 piece (50g)',    kcal: 78,  p: 7,  c: 1,  f: 6  },
  { id: 'chicken',      name: 'Grilled Chicken Breast', cat: 'Protein', emoji: '🍗', serving: '1 piece (150g)',   kcal: 248, p: 47, c: 0,  f: 6  },
  { id: 'tuna',         name: 'Canned Tuna',          cat: 'Protein',   emoji: '🐟', serving: '1 can (85g)',      kcal: 99,  p: 22, c: 0,  f: 1  },
  { id: 'greek-yogurt', name: 'Greek Yogurt',         cat: 'Protein',   emoji: '🫙', serving: '1 cup (170g)',     kcal: 100, p: 17, c: 6,  f: 1  },
  { id: 'whey',         name: 'Whey Protein',         cat: 'Protein',   emoji: '💪', serving: '1 scoop (30g)',    kcal: 111, p: 24, c: 2,  f: 1  },
  // Breakfast
  { id: 'oatmeal',      name: 'Oatmeal',              cat: 'Breakfast', emoji: '🥣', serving: '1 bowl (250g)',    kcal: 170, p: 6,  c: 30, f: 4  },
  { id: 'bread',        name: 'Whole Wheat Bread',    cat: 'Breakfast', emoji: '🍞', serving: '2 slices (60g)',   kcal: 148, p: 5,  c: 25, f: 2  },
  { id: 'banana',       name: 'Banana',               cat: 'Fruits',    emoji: '🍌', serving: '1 medium (100g)', kcal: 89,  p: 1,  c: 23, f: 0  },
  { id: 'milk',         name: 'Full Cream Milk',      cat: 'Breakfast', emoji: '🥛', serving: '1 glass (240ml)', kcal: 146, p: 8,  c: 12, f: 8  },
  { id: 'curd',         name: 'Curd',                 cat: 'Dairy',     emoji: '🍶', serving: '1 cup (200g)',     kcal: 122, p: 8,  c: 11, f: 4  },
  // Fruits
  { id: 'apple',        name: 'Apple',                cat: 'Fruits',    emoji: '🍎', serving: '1 medium (182g)', kcal: 95,  p: 0,  c: 25, f: 0  },
  { id: 'orange',       name: 'Orange',               cat: 'Fruits',    emoji: '🍊', serving: '1 medium (131g)', kcal: 62,  p: 1,  c: 15, f: 0  },
  // Healthy / Keto
  { id: 'almonds',      name: 'Almonds',              cat: 'Healthy',   emoji: '🥜', serving: '1 handful (28g)', kcal: 162, p: 6,  c: 6,  f: 14 },
  { id: 'avocado',      name: 'Avocado',              cat: 'Keto',      emoji: '🥑', serving: '½ fruit (100g)',  kcal: 160, p: 2,  c: 9,  f: 15 },
  { id: 'broccoli',     name: 'Broccoli',             cat: 'Healthy',   emoji: '🥦', serving: '1 cup (91g)',     kcal: 31,  p: 3,  c: 6,  f: 0  },
  { id: 'sweet-potato', name: 'Sweet Potato',         cat: 'Healthy',   emoji: '🍠', serving: '1 medium (130g)', kcal: 112, p: 2,  c: 26, f: 0  },
  { id: 'pb',           name: 'Peanut Butter',        cat: 'Keto',      emoji: '🥜', serving: '2 tbsp (32g)',    kcal: 188, p: 8,  c: 6,  f: 16 },
];

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee,  color: '#f59e0b', activeBg: '#fffbeb', activeBorder: '#f59e0b' },
  { id: 'lunch',     label: 'Lunch',     icon: Sun,     color: '#6b7280', activeBg: '#f9fafb', activeBorder: '#6b7280' },
  { id: 'dinner',    label: 'Dinner',    icon: Moon,    color: '#6b7280', activeBg: '#f9fafb', activeBorder: '#6b7280' },
  { id: 'snacks',    label: 'Snacks',    icon: Star,    color: '#6b7280', activeBg: '#f9fafb', activeBorder: '#6b7280' },
];

const TAGS = ['All', 'Indian', 'Protein', 'Breakfast', 'Healthy', 'Keto', 'Fruits', 'Dairy'];

export const ManualFoodEntry = () => {
  const { showToast, setActiveTab, setIsChatOpen } = useApp();
  const [query, setQuery]           = useState('');
  const [activeTag, setActiveTag]   = useState('All');
  const [mealType, setMealType]     = useState('breakfast');
  const [quantities, setQuantities] = useState({});
  const [loggedItems, setLoggedItems] = useState([]);

  /* filter */
  const filtered = CATALOGUE.filter(f => {
    const q = query.toLowerCase();
    const matchQ = !q || f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q);
    const matchT = activeTag === 'All' || f.cat === activeTag;
    return matchQ && matchT;
  });

  const sectionTitle = activeTag === 'All' ? 'All Foods' : `${activeTag} foods`;

  /* qty helpers */
  const getQty = id => quantities[id] ?? 1;
  const setQty = (id, v) => {
    const n = Math.max(0.5, Math.min(10, parseFloat(v) || 1));
    setQuantities(p => ({ ...p, [id]: n }));
  };
  const incQty = id => setQty(id, getQty(id) + 0.5);
  const decQty = id => setQty(id, getQty(id) - 0.5);

  /* add to log */
  const addFood = (food) => {
    const qty  = getQty(food.id);
    const item = {
      ...food,
      qty,
      mealType,
      mealLabel: MEAL_TYPES.find(m => m.id === mealType)?.label ?? 'Breakfast',
      logKcal: Math.round(food.kcal * qty),
      logP:    +(food.p * qty).toFixed(1),
      logC:    +(food.c * qty).toFixed(1),
      logF:    +(food.f * qty).toFixed(1),
      uid: `${food.id}-${Date.now()}`,
    };
    setLoggedItems(prev => [item, ...prev]);
    if (showToast) showToast(`${food.name} added to ${item.mealLabel}!`, 'success');
  };

  const removeItem = uid => setLoggedItems(prev => prev.filter(i => i.uid !== uid));

  /* totals */
  const total = loggedItems.reduce((a, i) => ({
    kcal: a.kcal + i.logKcal, p: a.p + i.logP, c: a.c + i.logC, f: a.f + i.logF
  }), { kcal: 0, p: 0, c: 0, f: 0 });

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

      {/* ══════════════════════ LEFT COLUMN ══════════════════════ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Log to meal */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 16, padding: '16px 18px'
        }}>
          <p style={{ margin: '0 0 12px', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
            Log to meal
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {MEAL_TYPES.map(m => {
              const Icon = m.icon;
              const active = mealType === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMealType(m.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 8, padding: '14px 8px', borderRadius: 12, border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                    background: active ? m.activeBg : '#f9fafb',
                    outline: active ? `2px solid ${m.activeBorder}` : '2px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: active ? m.color : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', transition: 'all 0.15s ease'
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 600,
                    color: active ? m.color : '#6b7280'
                  }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none'
          }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search roti, rice, chicken, oats..."
            style={{
              width: '100%', padding: '12px 38px 12px 40px',
              borderRadius: 12, border: '1px solid #e5e7eb',
              background: '#f9fafb', fontSize: '0.9rem',
              fontFamily: 'inherit', color: '#18181b',
              outline: 'none', transition: 'all 0.15s ease'
            }}
            onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#10b981'; }}
            onBlur={e => { e.target.style.background = '#f9fafb'; e.target.style.borderColor = '#e5e7eb'; }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: '#e5e7eb', border: 'none', borderRadius: '50%',
                width: 22, height: 22, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#6b7280'
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TAGS.map(tag => {
            const active = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  padding: '5px 14px', borderRadius: 20, border: 'none',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                  fontFamily: 'inherit',
                  background: active ? '#10b981' : 'transparent',
                  color: active ? '#fff' : '#374151',
                  outline: active ? 'none' : '1.5px solid #e5e7eb',
                  transition: 'all 0.15s ease'
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Food list */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 16, overflow: 'hidden'
        }}>
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px 10px',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
              {sectionTitle}
            </span>
            <span style={{
              fontSize: '0.75rem', fontWeight: 600, color: '#6b7280',
              background: '#f3f4f6', padding: '2px 8px', borderRadius: 6
            }}>
              {filtered.length} items
            </span>
          </div>

          {/* Food rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 18px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>No foods found. Try a different search.</p>
            </div>
          ) : (
            <div>
              {filtered.map((food, idx) => {
                const qty = getQty(food.id);
                const dispKcal = Math.round(food.kcal * qty);
                const dispP    = +(food.p * qty).toFixed(1);
                const dispC    = +(food.c * qty).toFixed(1);
                const dispF    = +(food.f * qty).toFixed(1);
                const isLast   = idx === filtered.length - 1;

                return (
                  <div
                    key={food.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 18px',
                      borderBottom: isLast ? 'none' : '1px solid #f3f4f6'
                    }}
                  >
                    {/* Emoji icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      {food.emoji}
                    </div>

                    {/* Name + serving + macros */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
                          {food.name}
                        </span>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 600, padding: '1px 7px',
                          borderRadius: 6, background: '#f3f4f6', color: '#6b7280'
                        }}>
                          {food.cat}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: 2 }}>
                        {food.serving}
                      </div>
                      <div style={{ fontSize: '0.78rem', marginTop: 2 }}>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>{dispKcal} kcal</span>
                        <span style={{ color: '#9ca3af' }}>
                          {' '}· P {dispP}g · C {dispC}g · F {dispF}g
                        </span>
                      </div>
                    </div>

                    {/* Qty stepper */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 0,
                      border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <button
                        onClick={() => decQty(food.id)}
                        style={{
                          width: 30, height: 32, border: 'none', background: '#f9fafb',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#374151', fontSize: '16px',
                          fontWeight: 700
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <div style={{
                        width: 32, height: 32, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.84rem', fontWeight: 700,
                        color: '#111827', background: '#fff', borderLeft: '1px solid #e5e7eb',
                        borderRight: '1px solid #e5e7eb'
                      }}>
                        {qty % 1 === 0 ? qty : qty.toFixed(1)}
                      </div>
                      <button
                        onClick={() => incQty(food.id)}
                        style={{
                          width: 30, height: 32, border: 'none', background: '#f9fafb',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#374151', fontSize: '16px',
                          fontWeight: 700
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Add button */}
                    <button
                      onClick={() => addFood(food)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 16px', borderRadius: 8, border: 'none',
                        background: '#10b981', color: '#fff',
                        fontWeight: 700, fontSize: '0.82rem',
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s ease', flexShrink: 0,
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                      onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                    >
                      <Plus size={13} />
                      <span>Add</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom tip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 10,
          background: '#fffbeb', border: '1px solid #fde68a',
          fontSize: '0.78rem', color: '#92400e'
        }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <span>
            <strong>Tip:</strong> Use the{' '}
            <button
              onClick={() => setActiveTab('scan')}
              style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              Plate Scanner
            </button>{' '}for instant detection or the{' '}
            <button
              onClick={() => setActiveTab('voice')}
              style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              Voice Logger
            </button>{' '}to log hands-free.
          </span>
        </div>
      </div>

      {/* ══════════════════════ RIGHT SIDEBAR ══════════════════════ */}
      <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Food Log */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 16, overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Utensils size={16} style={{ color: '#374151' }} />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>Food Log</span>
            </div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: '#10b981',
              background: '#f0fdf4', padding: '2px 8px', borderRadius: 6
            }}>
              {loggedItems.length} items
            </span>
          </div>

          {/* Body */}
          {loggedItems.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: 10 }}>🥗</div>
              <p style={{ margin: '0 0 4px', fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>
                No food logged yet
              </p>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#9ca3af', lineHeight: 1.4 }}>
                Search and add foods from the left to start your food log.
              </p>
            </div>
          ) : (
            <>
              {/* Totals bar */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 0, borderBottom: '1px solid #f3f4f6'
              }}>
                {[
                  { label: 'kcal', value: total.kcal, color: '#f59e0b' },
                  { label: 'P',    value: `${total.p.toFixed(0)}g`, color: '#10b981' },
                  { label: 'C',    value: `${total.c.toFixed(0)}g`, color: '#f59e0b' },
                  { label: 'F',    value: `${total.f.toFixed(0)}g`, color: '#8b5cf6' },
                ].map((m, i) => (
                  <div
                    key={m.label}
                    style={{
                      padding: '8px 6px', textAlign: 'center',
                      borderRight: i < 3 ? '1px solid #f3f4f6' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: '0.66rem', color: '#9ca3af' }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {loggedItems.map(item => {
                  const mealInfo = MEAL_TYPES.find(m => m.id === item.mealType);
                  return (
                    <div
                      key={item.uid}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 14px', borderBottom: '1px solid #f9fafb'
                      }}
                    >
                      <span style={{ fontSize: '18px', flexShrink: 0, marginTop: 2 }}>{item.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 1 }}>
                          ×{item.qty} · {item.mealLabel} · <span style={{ color: '#f59e0b', fontWeight: 700 }}>{item.logKcal} kcal</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.uid)}
                        style={{
                          width: 22, height: 22, borderRadius: '50%', border: 'none',
                          background: '#fee2e2', color: '#ef4444', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 2
                        }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Save button */}
              <div style={{ padding: '12px 14px' }}>
                <button
                  onClick={() => {
                    if (showToast) showToast('Food log saved to your diary!', 'success');
                    setActiveTab('dashboard');
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 7, width: '100%', padding: '10px',
                    borderRadius: 10, border: 'none',
                    background: '#10b981', color: '#fff',
                    fontWeight: 700, fontSize: '0.86rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 4px 10px rgba(16,185,129,0.2)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                  onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                >
                  <Check size={15} />
                  Save to Diary
                </button>
              </div>
            </>
          )}
        </div>

        {/* Nutrition Tip */}
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
          border: '1px solid #ddd6fe', borderRadius: 16, padding: '14px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <Sparkles size={15} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#4c1d95' }}>Nutrition Tip</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#5b21b6', lineHeight: 1.55 }}>
            💡 Aim for at least 25–30g of protein per meal to support muscle synthesis and keep you full longer. Try adding paneer, dal, or eggs!
          </p>
        </div>

        {/* Ask AI Coach */}
        <div style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)',
          borderRadius: 16, padding: '16px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Sparkles size={15} style={{ color: '#c4b5fd' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>Ask AI Coach</span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '0.76rem', color: '#c4b5fd', lineHeight: 1.5 }}>
              Get personalised diet advice, meal suggestions, and answers to your nutrition questions.
            </p>
            <button
              onClick={() => setIsChatOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 10, border: 'none',
                background: '#7c3aed', color: '#fff',
                fontWeight: 700, fontSize: '0.82rem',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            >
              Open AI Coach →
            </button>
          </div>
          {/* Decorative blob */}
          <div style={{
            position: 'absolute', right: -20, bottom: -20,
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)'
          }} />
        </div>
      </div>
    </div>
  );
};
