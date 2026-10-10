import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search, Plus, Check, Sparkles, Camera, Mic,
  Flame, Zap, AlertCircle, ChevronRight, Lightbulb,
  Utensils, PlusCircle
} from 'lucide-react';

/* ── Food Catalogue ───────────────────────────────────────── */
const CATALOGUE = [
  // 8 Popular Indian Foods (matched exactly to screenshot)
  {
    id: 'roti',
    name: 'Roti (whole wheat)',
    categories: ['Indian', 'Lunch', 'Dinner', 'Breakfast'],
    serving: '1 piece (30g)',
    kcal: 96, p: 3, c: 18, f: 1,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80',
    isPopular: true
  },
  {
    id: 'rice',
    name: 'Rice (cooked)',
    categories: ['Indian', 'Lunch', 'Dinner'],
    serving: '1 cup (150g)',
    kcal: 206, p: 4, c: 45, f: 0,
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=300&auto=format&fit=crop&q=80',
    isPopular: true
  },
  {
    id: 'dal',
    name: 'Dal (yellow)',
    categories: ['Indian', 'Lunch', 'Dinner'],
    serving: '1 bowl (150g)',
    kcal: 120, p: 9, c: 20, f: 2,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80',
    isPopular: true
  },
  {
    id: 'paneer',
    name: 'Paneer',
    categories: ['Indian', 'Lunch', 'Dinner', 'Snacks'],
    serving: '100g',
    kcal: 265, p: 18, c: 2, f: 21,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80',
    isPopular: true
  },
  {
    id: 'chicken',
    name: 'Chicken Breast',
    categories: ['Lunch', 'Dinner'],
    serving: '100g',
    kcal: 165, p: 31, c: 0, f: 3,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&auto=format&fit=crop&q=80',
    isPopular: true
  },
  {
    id: 'egg',
    name: 'Boiled Egg',
    categories: ['Breakfast', 'Snacks'],
    serving: '1 piece (50g)',
    kcal: 78, p: 6, c: 1, f: 5,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80',
    isPopular: true
  },
  {
    id: 'banana',
    name: 'Banana',
    categories: ['Breakfast', 'Snacks'],
    serving: '1 medium (100g)',
    kcal: 89, p: 1, c: 23, f: 0,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80',
    isPopular: true
  },
  {
    id: 'curd',
    name: 'Curd',
    categories: ['Breakfast', 'Lunch', 'Beverages', 'Dinner'],
    serving: '1 cup (200g)',
    kcal: 122, p: 8, c: 11, f: 4,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80',
    isPopular: true
  },
  // Additional catalogue items for category tabs & View All
  {
    id: 'idli',
    name: 'Idli',
    categories: ['Breakfast', 'Indian'],
    serving: '2 idlis (120g)',
    kcal: 70, p: 2, c: 14, f: 0,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'dosa',
    name: 'Plain Dosa',
    categories: ['Breakfast', 'Indian'],
    serving: '1 dosa (100g)',
    kcal: 133, p: 4, c: 25, f: 3,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'poha',
    name: 'Poha',
    categories: ['Breakfast', 'Indian'],
    serving: '1 plate (200g)',
    kcal: 220, p: 5, c: 46, f: 1,
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'oatmeal',
    name: 'Oatmeal',
    categories: ['Breakfast'],
    serving: '1 bowl (250g)',
    kcal: 170, p: 6, c: 30, f: 4,
    image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'rajma',
    name: 'Rajma Curry',
    categories: ['Lunch', 'Dinner', 'Indian'],
    serving: '1 bowl (200g)',
    kcal: 240, p: 14, c: 38, f: 1,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'chole',
    name: 'Chole Masala',
    categories: ['Lunch', 'Dinner', 'Indian'],
    serving: '1 bowl (200g)',
    kcal: 260, p: 12, c: 36, f: 6,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'palak-paneer',
    name: 'Palak Paneer',
    categories: ['Lunch', 'Dinner', 'Indian'],
    serving: '1 bowl (200g)',
    kcal: 280, p: 16, c: 8, f: 20,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'almonds',
    name: 'Almonds',
    categories: ['Snacks'],
    serving: '1 handful (28g)',
    kcal: 162, p: 6, c: 6, f: 14,
    image: 'https://images.unsplash.com/photo-1508061257972-3a5e808b2533?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'apple',
    name: 'Fresh Apple',
    categories: ['Snacks', 'Breakfast'],
    serving: '1 medium (182g)',
    kcal: 95, p: 0, c: 25, f: 0,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'masala-chai',
    name: 'Masala Chai',
    categories: ['Beverages'],
    serving: '1 cup (150ml)',
    kcal: 65, p: 2, c: 9, f: 2,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'filter-coffee',
    name: 'Filter Coffee',
    categories: ['Beverages'],
    serving: '1 cup (150ml)',
    kcal: 80, p: 3, c: 10, f: 3,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'sweet-lassi',
    name: 'Sweet Lassi',
    categories: ['Beverages'],
    serving: '1 glass (250ml)',
    kcal: 185, p: 6, c: 28, f: 5,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'chaas',
    name: 'Buttermilk (Chaas)',
    categories: ['Beverages'],
    serving: '1 glass (200ml)',
    kcal: 45, p: 2, c: 4, f: 2,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'protein-shake',
    name: 'Whey Protein Shake',
    categories: ['Beverages', 'Snacks'],
    serving: '1 scoop (300ml)',
    kcal: 140, p: 25, c: 3, f: 2,
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=300&auto=format&fit=crop&q=80'
  }
];

const CATEGORY_TABS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];

export const ManualFoodEntry = () => {
  const { showToast, setActiveTab, setIsChatOpen, activeMeal, setActiveMeal, updateActiveMealItems } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  // Filter foods based on query, tab, and showAll
  const filteredFoods = CATALOGUE.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesCat = item.categories.some(c => c.toLowerCase().includes(q));
      return matchesName || matchesCat;
    }
    if (activeCategory !== 'All') {
      return item.categories.includes(activeCategory);
    }
    if (!showAll) {
      return item.isPopular;
    }
    return true;
  });

  const handleAddFood = (food) => {
    setAddedIds(prev => new Set(prev).add(food.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(food.id);
        return next;
      });
    }, 1800);

    const newItem = {
      id: food.id + '-' + Date.now(),
      food_name: food.name,
      portion: food.serving,
      calories: food.kcal,
      protein_g: food.p,
      carbs_g: food.c,
      fat_g: food.f,
      image_url: food.image
    };

    if (updateActiveMealItems && activeMeal) {
      updateActiveMealItems([...(activeMeal.items || []), newItem]);
    } else if (setActiveMeal) {
      setActiveMeal(prev => ({
        ...prev,
        items: [...(prev?.items || []), newItem]
      }));
    }

    showToast(`${food.name} added to your log!`, 'success');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top Header Banner ─────────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            <Utensils size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Add food manually
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
              Search the local Indian food catalogue, choose a serving, then review and confirm the server-calculated meal.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search roti, chawal, dal, paneer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 16px 11px 42px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#fff',
                color: '#1e293b',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            onClick={() => {}}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 24px',
              borderRadius: 10,
              background: '#10b981',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(16,185,129,0.2)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
          >
            <Search size={16} strokeWidth={2.4} />
            Search
          </button>
        </div>
      </div>

      {/* ── Main Two-Column Layout ───────────────────────────── */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Left Column: Food Grid Card */}
        <div style={{
          flex: 1,
          minWidth: 0,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '22px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={20} color="#10b981" />
              <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#111827' }}>
                Popular Indian Foods
              </h2>
            </div>
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
              {showAll ? 'Show Popular ←' : 'View All →'}
            </button>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '18px 0 22px' }}>
            {CATEGORY_TABS.map(tab => {
              const isActive = activeCategory === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveCategory(tab);
                    if (tab !== 'All') setShowAll(true);
                  }}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isActive ? '1px solid #10b981' : '1px solid #e2e8f0',
                    background: isActive ? '#10b981' : '#fff',
                    color: isActive ? '#fff' : '#4b5563',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* 4-Column Food Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14
          }}>
            {filteredFoods.map(food => {
              const isAdded = addedIds.has(food.id);
              return (
                <div
                  key={food.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #eef2f6',
                    borderRadius: 14,
                    padding: '10px 10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#eef2f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
                  }}
                >
                  {/* Image container with floating + button */}
                  <div style={{
                    width: '100%',
                    height: 105,
                    borderRadius: 10,
                    background: '#f8fafc',
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={food.image}
                      alt={food.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />

                    {/* Green + / Check action button */}
                    <button
                      onClick={() => handleAddFood(food)}
                      title="Add to log"
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: isAdded ? '#059669' : '#10b981',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
                        transition: 'transform 0.15s ease, background 0.15s ease'
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {isAdded ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <Plus size={16} strokeWidth={2.5} />
                      )}
                    </button>
                  </div>

                  {/* Food details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {food.name}
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#6b7280', marginTop: 2 }}>
                      {food.serving}
                    </div>

                    <div style={{
                      fontSize: '0.71rem',
                      color: '#9ca3af',
                      marginTop: 6,
                      fontWeight: 500,
                      letterSpacing: '-0.01em'
                    }}>
                      {food.kcal} kcal | P {food.p}g | C {food.c}g | F {food.f}g
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFoods.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: '0.9rem' }}>
              No foods match your search. Try another keyword or scan using the camera!
            </div>
          )}

          {/* Yellow Tip Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.79rem',
            color: '#64748b'
          }}>
            <Lightbulb size={16} color="#eab308" style={{ flexShrink: 0 }} />
            <span>
              Tip: Use the{' '}
              <strong
                onClick={() => setActiveTab('scan')}
                style={{ color: '#0f172a', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Plate Scanner
              </strong>{' '}
              for instant detection or the{' '}
              <strong
                onClick={() => setActiveTab('voice')}
                style={{ color: '#0f172a', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Voice Logger
              </strong>{' '}
              to log hands-free.
            </span>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div style={{ width: 275, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 1. Quick Add Card */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#ecfdf5',
              border: '1px solid #d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              flexShrink: 0
            }}>
              🥗
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>
                Quick Add
              </div>
              <div style={{ fontSize: '0.76rem', color: '#6b7280', margin: '2px 0 8px' }}>
                Can't find your food?
              </div>
              <button
                onClick={() => setActiveTab('scan')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: '1px solid #d1fae5',
                  background: '#f0fdf4',
                  color: '#065f46',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
              >
                <Camera size={13} strokeWidth={2.4} />
                Scan with Camera
              </button>
            </div>
          </div>

          {/* 2. Quick Actions Card */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={16} color="#10b981" />
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
                Quick Actions
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              marginTop: 12
            }}>
              {/* Plate Scanner */}
              <div
                onClick={() => setActiveTab('scan')}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #d1fae5',
                  borderRadius: 10,
                  padding: '10px 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
              >
                <Camera size={18} color="#059669" />
                <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#065f46', marginTop: 4 }}>
                  Plate Scanner
                </div>
                <div style={{ fontSize: '0.62rem', color: '#6b7280', marginTop: 1 }}>
                  Scan your meal
                </div>
              </div>

              {/* Add Food */}
              <div
                onClick={() => setActiveTab('manual')}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #a7f3d0',
                  borderRadius: 10,
                  padding: '10px 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
              >
                <PlusCircle size={18} color="#059669" />
                <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#065f46', marginTop: 4 }}>
                  Add Food
                </div>
                <div style={{ fontSize: '0.62rem', color: '#6b7280', marginTop: 1 }}>
                  Search & log
                </div>
              </div>

              {/* Voice Logger */}
              <div
                onClick={() => setActiveTab('voice')}
                style={{
                  background: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  borderRadius: 10,
                  padding: '10px 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f3e8ff'}
                onMouseLeave={e => e.currentTarget.style.background = '#faf5ff'}
              >
                <Mic size={18} color="#7c3aed" />
                <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#6b21a8', marginTop: 4 }}>
                  Voice Logger
                </div>
                <div style={{ fontSize: '0.62rem', color: '#6b7280', marginTop: 1 }}>
                  Log by speaking
                </div>
              </div>
            </div>
          </div>

          {/* 3. Nutrition Tip Card */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 16,
            padding: '15px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={16} color="#10b981" />
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#047857' }}>
                  Nutrition Tip
                </div>
              </div>
              <ChevronRight size={16} color="#10b981" />
            </div>
            <p style={{
              margin: '8px 0 0',
              fontSize: '0.75rem',
              color: '#374151',
              lineHeight: 1.45
            }}>
              Try to include more protein in your meals. It helps with muscle recovery and keeps you full for longer.
            </p>
          </div>

          {/* 4. Ask AI Coach Card */}
          <div style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            border: '1px solid #e9d5ff',
            borderRadius: 16,
            padding: '18px 16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#7c3aed" />
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#6b21a8' }}>
                Ask AI Coach
              </div>
            </div>
            <p style={{
              margin: '6px 0 12px',
              fontSize: '0.74rem',
              color: '#6b7280',
              lineHeight: 1.4,
              maxWidth: 165
            }}>
              Get personalized diet advice, meal suggestions, and answers to your nutrition questions.
            </p>
            <button
              onClick={() => setIsChatOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 14px',
                borderRadius: 8,
                background: '#7c3aed',
                color: '#fff',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(124,58,237,0.3)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            >
              Open AI Coach →
            </button>

            {/* Cute AI Bot graphic in bottom right */}
            <div style={{
              position: 'absolute',
              right: 12,
              bottom: 8,
              fontSize: '44px',
              opacity: 0.88,
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
