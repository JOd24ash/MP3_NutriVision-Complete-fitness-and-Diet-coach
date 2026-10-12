import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import {
  Search, Plus, Check, Sparkles, Camera, Mic,
  Flame, Zap, AlertCircle, ChevronRight, Lightbulb,
  Utensils, PlusCircle, Trash2, X, CheckCircle2, Scale,
  Minus
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

// Helper to extract serving metadata and determine if food is piece-based (e.g. roti, chapati, egg)
const getFoodServingMeta = (food) => {
  if (!food) return { isPiece: false, baseGrams: 100, perPieceGrams: 40, unitLabel: 'g' };
  const str = (food.name + ' ' + (food.serving || '')).toLowerCase();
  const isPiece = (
    str.includes('piece') ||
    str.includes('roti') ||
    str.includes('chapati') ||
    str.includes('puri') ||
    str.includes('egg') ||
    str.includes('banana') ||
    str.includes('idli') ||
    str.includes('dosa') ||
    str.includes('apple')
  );

  const match = (food.serving || '').match(/(\d+)\s*(g|ml)/i);
  let baseGrams = match ? parseInt(match[1], 10) : 100;
  let pieceCount = 1;
  const countMatch = (food.serving || '').match(/^(\d+)\s+(piece|idli|dosa|roti)/i);
  if (countMatch) {
    pieceCount = parseInt(countMatch[1], 10);
  }
  const perPieceGrams = Math.round(baseGrams / (pieceCount || 1)) || 40;

  return {
    isPiece,
    baseGrams,
    perPieceGrams,
    unitLabel: isPiece ? 'piece' : (str.includes('ml') ? 'ml' : 'g')
  };
};

export const ManualFoodEntry = () => {
  const { showToast, setActiveTab, setIsChatOpen, activeMeal, setActiveMeal, updateActiveMealItems } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  // Modal and Plate State
  const [modalFood, setModalFood] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalGrams, setModalGrams] = useState(100);
  const [currentPlate, setCurrentPlate] = useState([]);
  const [plateMealType, setPlateMealType] = useState('lunch');
  const [isSavingPlate, setIsSavingPlate] = useState(false);

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

  const handleOpenServingModal = (food) => {
    const meta = getFoodServingMeta(food);
    setModalFood(food);
    if (meta.isPiece) {
      const isRotiOrChapati = food.name.toLowerCase().includes('roti') || food.name.toLowerCase().includes('chapati');
      const defaultCount = isRotiOrChapati ? 2 : 1;
      setModalQuantity(defaultCount);
      setModalGrams(defaultCount * meta.perPieceGrams);
    } else {
      setModalQuantity(1);
      setModalGrams(meta.baseGrams || 150);
    }
  };

  const handleSetPieceQuantity = (count) => {
    const safeCount = Math.max(1, count);
    const meta = getFoodServingMeta(modalFood);
    setModalQuantity(safeCount);
    setModalGrams(safeCount * meta.perPieceGrams);
  };

  const handleSetGrams = (grams) => {
    const safeGrams = Math.max(5, Number(grams) || 5);
    setModalGrams(safeGrams);
  };

  const calculateModalNutrition = () => {
    if (!modalFood) return { kcal: 0, p: 0, c: 0, f: 0 };
    const meta = getFoodServingMeta(modalFood);
    const scale = modalGrams / (meta.baseGrams || 100);
    return {
      kcal: Math.round(modalFood.kcal * scale),
      p: Math.round(modalFood.p * scale * 10) / 10,
      c: Math.round(modalFood.c * scale * 10) / 10,
      f: Math.round(modalFood.f * scale * 10) / 10,
    };
  };

  const handleConfirmAddToPlate = () => {
    if (!modalFood) return;
    const meta = getFoodServingMeta(modalFood);
    const nutrition = calculateModalNutrition();
    const plateItem = {
      id: modalFood.id + '-' + Date.now(),
      food_id: modalFood.id,
      name: modalFood.name,
      servingLabel: meta.isPiece
        ? `${modalQuantity} ${modalQuantity === 1 ? 'piece' : 'pieces'} (${modalGrams}g)`
        : `${modalGrams}g`,
      quantity: modalQuantity,
      isPiece: meta.isPiece,
      perPieceGrams: meta.perPieceGrams,
      grams: modalGrams,
      calories: nutrition.kcal,
      protein: nutrition.p,
      carbs: nutrition.c,
      fat: nutrition.f,
      image: modalFood.image,
    };

    setCurrentPlate(prev => [...prev, plateItem]);
    setAddedIds(prev => new Set(prev).add(modalFood.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(modalFood.id);
        return next;
      });
    }, 1800);

    setModalFood(null);
    showToast?.(`${modalFood.name} (${plateItem.servingLabel}) added to your plate!`, 'success');
  };

  const handleRemovePlateItem = (index) => {
    setCurrentPlate(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAdjustPlateItemQuantity = (index, delta) => {
    setCurrentPlate(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const baseFood = CATALOGUE.find(c => c.id === item.food_id) || {
        kcal: item.calories / (item.grams / 100),
        p: item.protein / (item.grams / 100),
        c: item.carbs / (item.grams / 100),
        f: item.fat / (item.grams / 100),
      };
      const meta = getFoodServingMeta(baseFood);
      if (item.isPiece) {
        const newCount = Math.max(1, item.quantity + delta);
        const newGrams = newCount * item.perPieceGrams;
        const scale = newGrams / (meta.baseGrams || 100);
        return {
          ...item,
          quantity: newCount,
          grams: newGrams,
          servingLabel: `${newCount} ${newCount === 1 ? 'piece' : 'pieces'} (${newGrams}g)`,
          calories: Math.round(baseFood.kcal * scale),
          protein: Math.round(baseFood.p * scale * 10) / 10,
          carbs: Math.round(baseFood.c * scale * 10) / 10,
          fat: Math.round(baseFood.f * scale * 10) / 10,
        };
      } else {
        const newGrams = Math.max(25, item.grams + (delta * 50));
        const scale = newGrams / (meta.baseGrams || 100);
        return {
          ...item,
          grams: newGrams,
          servingLabel: `${newGrams}g`,
          calories: Math.round(baseFood.kcal * scale),
          protein: Math.round(baseFood.p * scale * 10) / 10,
          carbs: Math.round(baseFood.c * scale * 10) / 10,
          fat: Math.round(baseFood.f * scale * 10) / 10,
        };
      }
    }));
  };

  const handleSavePlateMeal = async () => {
    if (currentPlate.length === 0) return;
    setIsSavingPlate(true);
    try {
      const itemsPayload = currentPlate.map(item => ({
        food_label: item.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, ''),
        est_grams: Number(item.grams)
      }));

      let savedMeal = null;
      try {
        savedMeal = await api.meals.createManual({
          items: itemsPayload,
          meal_type: plateMealType.toLowerCase()
        });
      } catch (err) {
        console.warn('Backend manual meal API fallback:', err);
      }

      const formattedItems = currentPlate.map(it => ({
        id: it.id,
        food_name: it.name,
        portion: it.servingLabel,
        calories: it.calories,
        protein_g: it.protein,
        carbs_g: it.carbs,
        fat_g: it.fat,
        image_url: it.image
      }));

      if (savedMeal && setActiveMeal) {
        setActiveMeal(savedMeal);
      } else if (updateActiveMealItems) {
        updateActiveMealItems(formattedItems);
      }

      const totalKcal = currentPlate.reduce((acc, it) => acc + (it.calories || 0), 0);
      showToast?.(`Meal saved! ${totalKcal} kcal logged for ${plateMealType}.`, 'success');
      setCurrentPlate([]);
    } catch (err) {
      showToast?.(err.message || 'Failed to save meal log', 'danger');
    } finally {
      setIsSavingPlate(false);
    }
  };

  return (
    <div className="manual-food-page" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Top Header Banner ─────────────────────────────────── */}
      <div className="manual-food-header" style={{
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
        <div className="manual-food-search" style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
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
      <div className="manual-food-content" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
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
                  onClick={() => handleOpenServingModal(food)}
                  style={{
                    background: '#fff',
                    border: '1px solid #eef2f6',
                    borderRadius: 14,
                    padding: '10px 10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    cursor: 'pointer'
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenServingModal(food);
                      }}
                      title="Choose portion & add to plate"
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
        <div className="manual-food-sidebar" style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 0. Live Current Plate Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: currentPlate.length > 0 ? '1.5px solid #86efac' : '1px solid #e5e7eb',
            padding: '16px',
            boxShadow: currentPlate.length > 0 ? '0 4px 16px rgba(16, 185, 129, 0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            transition: 'all 0.2s ease',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>🍽️</span>
                <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#111827' }}>
                  Current Plate
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: currentPlate.length > 0 ? '#16a34a' : '#f3f4f6',
                  color: currentPlate.length > 0 ? '#ffffff' : '#6b7280',
                  padding: '2px 8px',
                  borderRadius: 12,
                }}>
                  {currentPlate.length} {currentPlate.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              {currentPlate.length > 0 && (
                <button
                  onClick={() => setCurrentPlate([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 4px',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {currentPlate.length === 0 ? (
              <div style={{
                padding: '20px 10px',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.82rem',
                lineHeight: 1.45,
                background: '#f9fafb',
                borderRadius: 10,
                border: '1px dashed #e5e7eb',
              }}>
                <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🥗</div>
                <div style={{ fontWeight: 600, color: '#4b5563' }}>Your plate is empty</div>
                <div style={{ fontSize: '0.75rem', marginTop: 2 }}>Click any food card on the left to choose portion and add here.</div>
              </div>
            ) : (
              <>
                {/* Meal Type Selector */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', marginBottom: 5 }}>
                    Meal Type
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPlateMealType(type)}
                        style={{
                          padding: '5px 0',
                          borderRadius: 6,
                          border: plateMealType === type ? '1.5px solid #16a34a' : '1px solid #e5e7eb',
                          background: plateMealType === type ? '#f0fdf4' : '#ffffff',
                          color: plateMealType === type ? '#15803d' : '#6b7280',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {currentPlate.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: '#f9fafb',
                        borderRadius: 10,
                        border: '1px solid #f1f5f9',
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 1 }}>
                          {item.servingLabel} · <strong style={{ color: '#16a34a' }}>{item.calories} kcal</strong>
                        </div>
                      </div>

                      {/* Stepper + Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleAdjustPlateItemQuantity(idx, -1)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            border: '1px solid #d1d5db',
                            background: '#ffffff',
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustPlateItemQuantity(idx, 1)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            border: '1px solid #d1d5db',
                            background: '#ffffff',
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePlateItem(idx)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            border: 'none',
                            background: '#fee2e2',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            marginLeft: 2,
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Nutrition Summary */}
                <div style={{
                  padding: '10px 12px',
                  background: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  borderRadius: 12,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d' }}>
                      Total Meal Nutrition
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>
                      {currentPlate.reduce((acc, it) => acc + (it.calories || 0), 0)} kcal
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                    <div style={{ background: '#fff1f2', borderRadius: 6, padding: '4px', textAlign: 'center', fontSize: '0.72rem', color: '#e11d48', fontWeight: 700 }}>
                      {Math.round(currentPlate.reduce((acc, it) => acc + (it.protein || 0), 0) * 10) / 10}g P
                    </div>
                    <div style={{ background: '#fffbeb', borderRadius: 6, padding: '4px', textAlign: 'center', fontSize: '0.72rem', color: '#d97706', fontWeight: 700 }}>
                      {Math.round(currentPlate.reduce((acc, it) => acc + (it.carbs || 0), 0) * 10) / 10}g C
                    </div>
                    <div style={{ background: '#ecfdf5', borderRadius: 6, padding: '4px', textAlign: 'center', fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                      {Math.round(currentPlate.reduce((acc, it) => acc + (it.fat || 0), 0) * 10) / 10}g F
                    </div>
                  </div>
                </div>

                {/* Save Meal Button */}
                <button
                  type="button"
                  onClick={handleSavePlateMeal}
                  disabled={isSavingPlate}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: isSavingPlate ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
                    opacity: isSavingPlate ? 0.75 : 1,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{isSavingPlate ? 'Saving Meal...' : 'Save Meal to Daily Log'}</span>
                </button>
              </>
            )}
          </div>

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
                  border: '1.5px solid #10b981',
                  borderRadius: 10,
                  padding: '10px 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
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

      {/* ── Serving & Frequency Modal ───────────────────────── */}
      {modalFood && (() => {
        const meta = getFoodServingMeta(modalFood);
        const nutrition = calculateModalNutrition();
        return (
          <div
            onClick={() => setModalFood(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 440,
                maxWidth: '94vw',
                background: '#ffffff',
                borderRadius: 18,
                padding: '22px 24px',
                boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img
                    src={modalFood.image}
                    alt={modalFood.name}
                    style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#111827' }}>
                      {modalFood.name}
                    </h3>
                    <div style={{ fontSize: '0.76rem', color: '#6b7280', marginTop: 2 }}>
                      Standard serving: {modalFood.serving}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setModalFood(null)}
                  style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Frequency / Pieces Selector */}
              {meta.isPiece ? (
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                      How many pieces? (Quantity: 1, 2, 3...)
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>
                      ~{meta.perPieceGrams}g per piece
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetPieceQuantity(num)}
                        style={{
                          flex: 1,
                          padding: '8px 0',
                          borderRadius: 8,
                          border: modalQuantity === num ? '2px solid #16a34a' : '1px solid #bbf7d0',
                          background: modalQuantity === num ? '#16a34a' : '#ffffff',
                          color: modalQuantity === num ? '#ffffff' : '#15803d',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                          boxShadow: modalQuantity === num ? '0 2px 8px rgba(22, 163, 74, 0.25)' : 'none',
                        }}
                      >
                        {num} {num === 1 ? 'pc' : 'pcs'}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#15803d', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Selected: <strong>{modalQuantity} {modalQuantity === 1 ? 'piece' : 'pieces'}</strong></span>
                    <span>Total Portion: <strong>{modalGrams}g</strong></span>
                  </div>
                </div>
              ) : (
                /* Grams / Portion Selector */
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                      Portion Size in Grams
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        min="10"
                        max="1500"
                        value={modalGrams}
                        onChange={(e) => handleSetGrams(e.target.value)}
                        style={{
                          width: 70,
                          padding: '5px 8px',
                          borderRadius: 6,
                          border: '1.5px solid #cbd5e1',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>g</span>
                    </div>
                  </div>

                  {/* Preset chips */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[50, 100, 150, 200, 250].map(chipG => (
                      <button
                        key={chipG}
                        type="button"
                        onClick={() => handleSetGrams(chipG)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          borderRadius: 6,
                          border: modalGrams === chipG ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                          background: modalGrams === chipG ? '#16a34a' : '#ffffff',
                          color: modalGrams === chipG ? '#ffffff' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        {chipG}g
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Live Nutrition Preview */}
              <div style={{
                padding: '12px 14px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d' }}>
                    Calculated Nutrition
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>
                    {nutrition.kcal} kcal
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  <div style={{ background: '#fff1f2', borderRadius: 8, padding: '6px', textAlign: 'center', fontSize: '0.76rem', color: '#e11d48', fontWeight: 700 }}>
                    {nutrition.p}g Protein
                  </div>
                  <div style={{ background: '#fffbeb', borderRadius: 8, padding: '6px', textAlign: 'center', fontSize: '0.76rem', color: '#d97706', fontWeight: 700 }}>
                    {nutrition.c}g Carbs
                  </div>
                  <div style={{ background: '#ecfdf5', borderRadius: 8, padding: '6px', textAlign: 'center', fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                    {nutrition.f}g Fat
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalFood(null)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#4b5563',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToPlate}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  <Plus size={16} />
                  <span>Add to Plate</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
