import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar, Search, ChevronDown, ChevronRight,
  Flame, Utensils, Sparkles, Clock, Lightbulb,
  ArrowLeft
} from 'lucide-react';

export const MealHistory = () => {
  const { showToast, setIsChatOpen } = useApp();

  const [activeCategory, setActiveCategory] = useState('All Meals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealId, setSelectedMealId] = useState('meal-2'); // Chicken Rice Bowl by default (matches screenshot)

  // Meal history items matching screenshot exactly
  const mealsData = [
    {
      id: 'meal-1',
      name: 'Oats Bowl',
      category: 'Breakfast',
      categoryColor: '#d97706',
      categoryBg: '#fffbeb',
      time: '08:15 AM',
      dateTime: '10 Oct 2026 • 08:15 AM',
      description: 'Oats (1 cup) + Banana (1) + Almonds (10g)',
      kcal: 320,
      p: 12, c: 52, f: 9,
      image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=300&auto=format&fit=crop&q=80',
      foodItems: [
        { name: 'Rolled Oats (cooked)', quantity: '1 cup (150 g)', kcal: 150, p: 5, c: 27, f: 3, image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=100&auto=format&fit=crop&q=80' },
        { name: 'Fresh Banana', quantity: '1 medium (100 g)', kcal: 89, p: 1, c: 23, f: 0, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&auto=format&fit=crop&q=80' },
        { name: 'Raw Almonds', quantity: '10 g', kcal: 58, p: 2, c: 2, f: 5, image: 'https://images.unsplash.com/photo-1508061257972-3a5e808b2533?w=100&auto=format&fit=crop&q=80' },
        { name: 'Honey / Cinnamon', quantity: '1 tsp (5 g)', kcal: 23, p: 0, c: 6, f: 0, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=100&auto=format&fit=crop&q=80' }
      ],
      aiInsight: "Excellent high-fiber breakfast! Complex carbohydrates and potassium give you stable morning energy without a sugar crash."
    },
    {
      id: 'meal-2',
      name: 'Chicken Rice Bowl',
      category: 'Lunch',
      categoryColor: '#059669',
      categoryBg: '#ecfdf5',
      time: '01:30 PM',
      dateTime: '10 Oct 2026 • 01:30 PM',
      description: 'Chicken (100g) + Brown Rice (1 cup) + Broccoli',
      kcal: 520,
      p: 38, c: 62, f: 12,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
      foodItems: [
        { name: 'Chicken Breast (grilled)', quantity: '100 g', kcal: 165, p: 31, c: 0, f: 4, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100&auto=format&fit=crop&q=80' },
        { name: 'Brown Rice (cooked)', quantity: '1 cup (150 g)', kcal: 216, p: 5, c: 45, f: 2, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=100&auto=format&fit=crop&q=80' },
        { name: 'Broccoli (cooked)', quantity: '1 cup (100 g)', kcal: 55, p: 4, c: 11, f: 0, image: 'https://images.unsplash.com/photo-1584270357118-d784a0c8b2d1?w=100&auto=format&fit=crop&q=80' },
        { name: 'Olive Oil', quantity: '1 tsp (5 g)', kcal: 44, p: 0, c: 0, f: 5, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80' }
      ],
      aiInsight: "Great choice! This meal is high in protein and fiber. You're doing well for your fitness goal. Consider adding more healthy fats like nuts or seeds for better energy and satiety."
    },
    {
      id: 'meal-3',
      name: 'Banana + Peanut Butter',
      category: 'Snacks',
      categoryColor: '#7c3aed',
      categoryBg: '#faf5ff',
      time: '05:12 PM',
      dateTime: '10 Oct 2026 • 05:12 PM',
      description: 'Banana (1 medium) + Peanut Butter (2 tbsp)',
      kcal: 285,
      p: 8, c: 32, f: 14,
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80',
      foodItems: [
        { name: 'Fresh Banana', quantity: '1 medium (118 g)', kcal: 105, p: 1, c: 27, f: 0, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100&auto=format&fit=crop&q=80' },
        { name: 'Creamy Peanut Butter', quantity: '2 tbsp (32 g)', kcal: 180, p: 7, c: 5, f: 14, image: 'https://images.unsplash.com/photo-1508061257972-3a5e808b2533?w=100&auto=format&fit=crop&q=80' }
      ],
      aiInsight: "Smart pre-workout snack! Fast carbohydrates combined with healthy monounsaturated fats provide both immediate and sustained stamina."
    },
    {
      id: 'meal-4',
      name: 'Roti with Dal & Veg',
      category: 'Dinner',
      categoryColor: '#2563eb',
      categoryBg: '#eff6ff',
      time: '08:45 PM',
      dateTime: '10 Oct 2026 • 08:45 PM',
      description: 'Roti (2) + Dal (1 bowl) + Mixed Veg (1 cup)',
      kcal: 295,
      p: 16, c: 45, f: 8,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80',
      foodItems: [
        { name: 'Whole Wheat Roti', quantity: '2 pieces (60 g)', kcal: 150, p: 5, c: 30, f: 1, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=100&auto=format&fit=crop&q=80' },
        { name: 'Yellow Dal Tadka', quantity: '1 bowl (150 g)', kcal: 120, p: 9, c: 20, f: 2, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&auto=format&fit=crop&q=80' },
        { name: 'Mixed Vegetable Sabzi', quantity: '1 cup (100 g)', kcal: 75, p: 2, c: 9, f: 3, image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=100&auto=format&fit=crop&q=80' }
      ],
      aiInsight: "Well-balanced light Indian dinner. Digestible plant protein and moderate carbs promote restful recovery sleep."
    }
  ];

  // Filter meals based on active tab and search query
  const filteredMeals = mealsData.filter(m => {
    if (activeCategory !== 'All Meals') {
      if (m.category !== activeCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchCat = m.category.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat;
    }
    return true;
  });

  const selectedMeal = mealsData.find(m => m.id === selectedMealId) || mealsData[1];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ── Top Bar: Filter Tabs, Date & Search Bar ────────────── */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Left: Category Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All Meals', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #10b981' : '1px solid #e5e7eb',
                  background: isActive ? '#10b981' : '#fff',
                  color: isActive ? '#fff' : '#4b5563',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right: Date Picker & Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Date Selector */}
          <div
            onClick={() => showToast('Selected 10 Oct 2026', 'info')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#fff',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Calendar size={14} color="#64748b" />
            <span>10 Oct 2026</span>
            <ChevronDown size={14} color="#94a3b8" />
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px 6px 30px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                outline: 'none',
                background: '#fff',
                color: '#1e293b',
                width: 170
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ───────────────────────────── */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Left Column: Today's Meals Timeline */}
        <div style={{
          flex: '1 1 55%',
          minWidth: 0,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Card Header: Today date + Total Calories */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="#059669" />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>Today</span>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>10 October 2026</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>
                1,420 kcal
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                Total calories
              </div>
            </div>
          </div>

          {/* Meals List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {filteredMeals.map(meal => {
              const isSelected = selectedMeal.id === meal.id;
              return (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMealId(meal.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: isSelected ? '1.5px solid #a7f3d0' : '1px solid #f1f5f9',
                    background: isSelected ? '#f0fdf4' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(16,185,129,0.08)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = '#fff';
                  }}
                >
                  {/* Left: Photo + Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 62,
                      height: 62,
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#f8fafc',
                      flexShrink: 0
                    }}>
                      <img
                        src={meal.image}
                        alt={meal.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: meal.categoryBg,
                        color: meal.categoryColor
                      }}>
                        {meal.category}
                      </span>

                      <div style={{
                        fontSize: '0.94rem',
                        fontWeight: 800,
                        color: '#111827',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {meal.name}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.72rem',
                        color: '#6b7280',
                        marginTop: 1
                      }}>
                        <Clock size={12} color="#9ca3af" />
                        <span>{meal.time}</span>
                      </div>

                      <div style={{
                        fontSize: '0.72rem',
                        color: '#6b7280',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {meal.description}
                      </div>
                    </div>
                  </div>

                  {/* Right: Calories, Macros, Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>
                        {meal.kcal} kcal
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2, letterSpacing: '-0.01em' }}>
                        P {meal.p}g | C {meal.c}g | F {meal.f}g
                      </div>
                    </div>
                    <ChevronRight size={16} color={isSelected ? '#10b981' : '#cbd5e1'} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Tip Bar */}
          <div style={{
            marginTop: 20,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.77rem',
            color: '#065f46'
          }}>
            <Lightbulb size={16} color="#059669" style={{ flexShrink: 0 }} />
            <span>
              Tip: Keep a consistent meal time for better digestion and energy levels.
            </span>
          </div>
        </div>

        {/* Right Column: Meal Detail Inspection Panel */}
        <div style={{
          flex: '1 1 45%',
          minWidth: 0,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          padding: '22px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Top Row: Back link, Category Badge, Timestamp */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button
              onClick={() => showToast('Returned to timeline', 'info')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#111827'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
              <ArrowLeft size={14} />
              Back to History
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: '0.72rem',
                fontWeight: 700,
                background: selectedMeal.categoryBg,
                color: selectedMeal.categoryColor
              }}>
                {selectedMeal.category}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {selectedMeal.dateTime}
              </span>
            </div>
          </div>

          {/* Meal Headline: Picture + Title + Description */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <div style={{
              width: 76,
              height: 76,
              borderRadius: 14,
              overflow: 'hidden',
              background: '#f8fafc',
              flexShrink: 0
            }}>
              <img
                src={selectedMeal.image}
                alt={selectedMeal.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>
                {selectedMeal.name}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
                {selectedMeal.description}
              </p>
            </div>
          </div>

          {/* 4 Macro Stat Boxes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            marginBottom: 20
          }}>
            {/* Calories */}
            <div style={{
              background: '#fff',
              border: '1px solid #f1f5f9',
              borderRadius: 10,
              padding: '10px 6px',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#ea580c' }}>
                <Flame size={14} />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>
                  {selectedMeal.kcal} kcal
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#9ca3af', marginTop: 2 }}>
                Total Calories
              </div>
            </div>

            {/* Protein */}
            <div style={{
              background: '#fff',
              border: '1px solid #f1f5f9',
              borderRadius: 10,
              padding: '10px 6px',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#10b981' }}>
                <span style={{ fontSize: '11px' }}>🌱</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>
                  {selectedMeal.p} g
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#9ca3af', marginTop: 2 }}>
                Protein
              </div>
            </div>

            {/* Carbs */}
            <div style={{
              background: '#fff',
              border: '1px solid #f1f5f9',
              borderRadius: 10,
              padding: '10px 6px',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#f59e0b' }}>
                <span style={{ fontSize: '11px' }}>⚡</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>
                  {selectedMeal.c} g
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#9ca3af', marginTop: 2 }}>
                Carbs
              </div>
            </div>

            {/* Fat */}
            <div style={{
              background: '#fff',
              border: '1px solid #f1f5f9',
              borderRadius: 10,
              padding: '10px 6px',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#8b5cf6' }}>
                <span style={{ fontSize: '11px' }}>💧</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>
                  {selectedMeal.f} g
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#9ca3af', marginTop: 2 }}>
                Fat
              </div>
            </div>
          </div>

          {/* Food Items Section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Utensils size={15} color="#059669" />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#111827' }}>
                Food Items
              </h3>
            </div>

            {/* Food items table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              padding: '4px 6px 6px',
              fontSize: '0.72rem',
              color: '#9ca3af',
              fontWeight: 600,
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div>Food Item</div>
              <div>Quantity</div>
              <div>Calories</div>
              <div style={{ textAlign: 'right' }}>P | C | F</div>
            </div>

            {/* Food items rows */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {selectedMeal.foodItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    alignItems: 'center',
                    padding: '9px 6px',
                    borderBottom: idx < selectedMeal.foodItems.length - 1 ? '1px solid #f8fafc' : 'none',
                    fontSize: '0.76rem'
                  }}
                >
                  {/* Name + Thumbnail */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      overflow: 'hidden',
                      background: '#f8fafc',
                      flexShrink: 0
                    }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{item.name}</span>
                  </div>

                  {/* Quantity */}
                  <div style={{ color: '#6b7280' }}>
                    {item.quantity}
                  </div>

                  {/* Calories */}
                  <div style={{ fontWeight: 600, color: '#111827' }}>
                    {item.kcal} kcal
                  </div>

                  {/* Macros */}
                  <div style={{ color: '#9ca3af', textAlign: 'right' }}>
                    {item.p}g | {item.c}g | {item.f}g
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight Box at Bottom */}
          <div style={{
            marginTop: 18,
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            border: '1px solid #e9d5ff',
            borderRadius: 12,
            padding: '12px 16px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={15} color="#7c3aed" />
                <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#6b21a8' }}>
                  AI Insight
                </span>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#7c3aed',
                background: '#ede9fe',
                padding: '2px 7px',
                borderRadius: 10
              }}>
                Beta
              </span>
            </div>

            <p style={{
              margin: '6px 0 0',
              fontSize: '0.74rem',
              color: '#4b5563',
              lineHeight: 1.45
            }}>
              {selectedMeal.aiInsight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
