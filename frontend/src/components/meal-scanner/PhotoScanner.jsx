import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import {
  Camera,
  Upload,
  Info,
  Sparkles,
  ChevronRight,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  X,
  Check,
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const PhotoScanner = () => {
  const { setActiveTab, showToast, user, setActiveMeal } = useApp();
  const fileInputRef = useRef(null);

  // Plate image state
  const defaultPlateImage = 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1000&auto=format&fit=crop&q=80';
  const [plateImage, setPlateImage] = useState(defaultPlateImage);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  // Detected food items — populated from the real API response after upload.
  const [detectedItems, setDetectedItems] = useState([]);
  // Raw meal response from the backend (used for confirm/patch flows)
  const [activeMealLog, setActiveMealLog] = useState(null);

  // Editing state for review flow
  const [editingItemId, setEditingItemId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editGrams, setEditGrams] = useState(100);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Helper to format meal items for the UI
  const formatMealItems = (meal) => {
    return meal.items.map(item => ({
      id: item.id,
      food_label: item.food_label,
      name: item.food_label.replace(/_/g, ' '),
      confidence: item.confidence,
      category: item.guardrail_status === 'unknown'
        ? '(review required)'
        : `(${Math.round((item.confidence || 0) * 100)}% confidence)`,
      portion: `${item.confirmed_grams ? `${item.confirmed_grams} g (Confirmed)` : `${item.est_grams ?? '?'} g (Estimated)`}`,
      est_grams: item.est_grams,
      confirmed_grams: item.confirmed_grams,
      calories: item.calories ?? 0,
      protein:  item.protein_g ?? 0,
      carbs:    item.carbs_g   ?? 0,
      fat:      item.fat_g     ?? 0,
      guardrail_status: item.guardrail_status,
      guardrail_reason: item.guardrail_reason,
      image: '',
      emoji: '🍽️',
      _raw: item,
    }));
  };

  // Computed totals — always derived from real API values
  const totalCalories = detectedItems.reduce((acc, item) => acc + (item.calories || 0), 0);
  const totalProtein  = detectedItems.reduce((acc, item) => acc + (item.protein  || 0), 0);
  const totalCarbs    = detectedItems.reduce((acc, item) => acc + (item.carbs    || 0), 0);
  const totalFat      = detectedItems.reduce((acc, item) => acc + (item.fat      || 0), 0);

  // Recent scans dataset
  const recentScans = [
    {
      id: 'scan-1',
      title: 'Oats Bowl',
      date: '10 Oct 2026, 09:15 AM',
      calories: 320,
      protein: 12,
      carbs: 54,
      fat: 7,
      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=150&auto=format&fit=crop&q=80',
      emoji: '🥣'
    },
    {
      id: 'scan-2',
      title: 'Sandwich',
      date: '9 Oct 2026, 07:42 PM',
      calories: 290,
      protein: 10,
      carbs: 42,
      fat: 8,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=150&auto=format&fit=crop&q=80',
      emoji: '🥪'
    },
    {
      id: 'scan-3',
      title: 'Lunch Bowl',
      date: '9 Oct 2026, 01:20 PM',
      calories: 510,
      protein: 28,
      carbs: 68,
      fat: 16,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80',
      emoji: '🥗'
    },
    {
      id: 'scan-4',
      title: 'Fruit Bowl',
      date: '8 Oct 2026, 11:05 AM',
      calories: 180,
      protein: 4,
      carbs: 42,
      fat: 1,
      image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=150&auto=format&fit=crop&q=80',
      emoji: '🍓'
    }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      showToast?.('Sign in before analyzing a meal.', 'danger');
      return;
    }

    // Optional reference object measurement with safe fallback
    const refPxInput = window.prompt('Optional: Reference object width in pixels (or leave blank to use standard portion sizes):');
    let referencePixels = null;
    let referenceCm = null;
    if (refPxInput && Number(refPxInput) > 0) {
      const refCmInput = window.prompt('Actual width of reference object in cm (e.g. 8.5 for card, 2.5 for coin):');
      if (refCmInput && Number(refCmInput) > 0) {
        referencePixels = Number(refPxInput);
        referenceCm = Number(refCmInput);
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPlateImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear previous results while the new image is being analysed.
    setDetectedItems([]);
    setActiveMealLog(null);
    setEditingItemId(null);
    setIsAnalyzing(true);
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('user_id', user.id);
      if (referencePixels && referenceCm) {
        form.append('reference_object_px', referencePixels);
        form.append('reference_object_real_cm', referenceCm);
      }
      const meal = await api.meals.logPhoto(form);
      const items = formatMealItems(meal);
      setDetectedItems(items);
      setActiveMealLog(meal);
      showToast?.(
        meal.needs_manual_review
          ? 'Some items need review — please verify food labels before confirming.'
          : `Found ${items.length} item${items.length !== 1 ? 's' : ''}. Review and confirm to save.`,
        'success'
      );
    } catch (error) {
      showToast?.(error.message || 'Photo recognition failed.', 'danger');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditLabel(item.food_label);
    setEditGrams(item.confirmed_grams || item.est_grams || 100);
  };

  const handleSaveEdit = async (itemId) => {
    if (!activeMealLog?.meal_log_id) return;
    setIsUpdating(true);
    try {
      await api.meals.patchItem(activeMealLog.meal_log_id, itemId, {
        food_label: editLabel.trim(),
        confirmed_grams: Number(editGrams),
        est_grams: Number(editGrams),
      });
      const updated = await api.meals.get(activeMealLog.meal_log_id);
      setActiveMealLog(updated);
      setDetectedItems(formatMealItems(updated));
      setEditingItemId(null);
      showToast?.('Item updated and nutrition recalculated.', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update item', 'danger');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!activeMealLog?.meal_log_id) return;
    setIsUpdating(true);
    try {
      await api.meals.deleteItem(activeMealLog.meal_log_id, itemId);
      const updated = await api.meals.get(activeMealLog.meal_log_id);
      setActiveMealLog(updated);
      setDetectedItems(formatMealItems(updated));
      showToast?.('False detection removed from meal.', 'info');
    } catch (err) {
      showToast?.(err.message || 'Failed to remove item', 'danger');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmMeal = async () => {
    if (!activeMealLog?.meal_log_id) return;
    setIsConfirming(true);
    try {
      const confirmed = await api.meals.confirm(activeMealLog.meal_log_id);
      setActiveMealLog(confirmed);
      setDetectedItems(formatMealItems(confirmed));
      setActiveMeal?.(confirmed);
      showToast?.('Meal confirmed and saved to your nutrition log!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to confirm meal', 'danger');
    } finally {
      setIsConfirming(false);
    }
  };

  // Simulated scan trigger
  const runSimulatedScan = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      if (showToast) showToast('AI detected 4 food items with portion estimates!', 'success');
    }, 1200);
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* ── TOP SECTION: Viewfinder + Detected Items ── */}
      <div className="scanner-main-grid">
        
        {/* Left Column: Plate Viewfinder */}
        <div className="scanner-viewfinder-card">
          
          {/* Main Photo Frame */}
          <div className="scanner-img-frame">
            <img
              src={plateImage}
              alt="Plate detection frame"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultPlateImage;
              }}
            />

            {/* Viewfinder corner brackets reticle */}
            <div className="scanner-reticle">
              <div className="scanner-reticle-tl" />
              <div className="scanner-reticle-tr" />
              <div className="scanner-reticle-bl" />
              <div className="scanner-reticle-br" />
            </div>

            {/* Status Pill in bottom right */}
            <div className="scanner-status-pill">
              <div style={{
                display: 'inline-flex',
                animation: isAnalyzing ? 'spin 1s linear infinite' : 'none'
              }}>
                <RefreshCw size={14} />
              </div>
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyzing...'}</span>
            </div>
          </div>

          {/* Tip Banner */}
          <div className="scanner-tip-bar">
            <Sparkles size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
            <span>Make sure the whole plate is visible and well-lit for better results.</span>
          </div>

          {/* Action Buttons Row */}
          <div className="scanner-btn-row">
            {/* Capture Photo */}
            <button
              onClick={runSimulatedScan}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                border: 'none',
                background: '#16a34a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
              }}
            >
              <Camera size={16} />
              <span>Capture Photo</span>
            </button>

            {/* Upload Image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 16px',
                borderRadius: 12,
                border: '1.5px solid #e5e7eb',
                background: '#ffffff',
                color: '#374151',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Upload size={16} />
              <span>Upload Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {/* View Guidelines */}
            <button
              onClick={() => setShowGuidelines(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 16px',
                borderRadius: 12,
                border: '1.5px solid #e5e7eb',
                background: '#ffffff',
                color: '#374151',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Info size={16} />
              <span>View Guidelines</span>
            </button>
          </div>
        </div>

        {/* Right Column: Detected Food Items */}
        <div className="dash-panel" style={{ padding: '22px 24px', justifyContent: 'space-between' }}>
          
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.15rem', fontWeight: 700, color: '#18181b' }}>
                  <span style={{ color: '#16a34a' }}>✨</span>
                  <span>Detected Food Items</span>
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: '#71717a' }}>
                  We found {detectedItems.length} items in your plate
                </p>
              </div>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#f5f3ff',
                color: '#7c3aed',
                border: '1px solid #ddd6fe',
                padding: '4px 12px',
                borderRadius: 20
              }}>
                AI Analysis
              </span>
            </div>

            {/* Food items grid — 2-column card layout */}
            {detectedItems.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 16px',
                color: '#9ca3af',
                gap: 10,
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '2.5rem' }}>🍽️</span>
                <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600 }}>
                  {isAnalyzing ? 'Analysing your meal…' : 'Upload a meal photo to detect food items'}
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem' }}>
                  {isAnalyzing ? 'This may take a few seconds.' : 'Results will appear here after recognition.'}
                </p>
              </div>
            ) : (
            <div className="scanner-items-grid">
              {detectedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`scanner-item-card${selectedItemIndex === idx ? ' selected' : ''}`}
                  onClick={() => setSelectedItemIndex(selectedItemIndex === idx ? null : idx)}
                  style={{ position: 'relative' }}
                >
                  {/* Item Content */}
                  <div className="scanner-item-card__body" style={{ width: '100%' }}>
                    {editingItemId === item.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 4 }} onClick={(e) => e.stopPropagation()}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
                          Food Label:
                        </label>
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="e.g. chapati, dal, rice"
                          style={{
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1.5px solid #10b981',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
                          Portion Grams:
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="1000"
                          value={editGrams}
                          onChange={(e) => setEditGrams(e.target.value)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1.5px solid #10b981',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={isUpdating}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                              background: '#16a34a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <Check size={14} />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                              background: '#f3f4f6',
                              color: '#374151',
                              border: '1px solid #d1d5db',
                              borderRadius: 6,
                              padding: '6px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <X size={14} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div className="scanner-item-card__name" style={{ textTransform: 'capitalize' }}>
                            {item.name}
                          </div>
                          {activeMealLog && !activeMealLog.confirmed && (
                            <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleStartEdit(item)}
                                title="Edit label or portion"
                                style={{
                                  background: '#f3f4f6',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: 4,
                                  cursor: 'pointer',
                                  color: '#4b5563',
                                }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                title="Reject false detection"
                                style={{
                                  background: '#fee2e2',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: 4,
                                  cursor: 'pointer',
                                  color: '#dc2626',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>

                        {item.guardrail_status === 'unknown' ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 3,
                            padding: '2px 8px',
                            background: '#fef3c7',
                            border: '1px solid #fde68a',
                            borderRadius: 6,
                            color: '#b45309',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}>
                            <AlertTriangle size={12} />
                            <span>Unknown food — click edit to correct label</span>
                          </div>
                        ) : (
                          <div className="scanner-item-card__category">{item.category}</div>
                        )}

                        <div className="scanner-item-card__portion">
                          {item.confirmed_grams ? `${item.confirmed_grams}g (Confirmed)` : `${item.est_grams ?? '?'}g (Estimated)`}
                        </div>

                        <div className="scanner-item-card__footer">
                          <div className="scanner-item-card__calories">{item.calories} kcal</div>
                          <div className="scanner-item-card__macros">
                            {item.protein}g P · {item.carbs}g C · {item.fat}g F
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}

          </div>

          {/* Bottom Box: Total Nutrition (Estimated) */}
          <div style={{
            marginTop: 14,
            padding: '16px 18px',
            borderRadius: 14,
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0'
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d', fontWeight: 700, fontSize: '0.92rem' }}>
                <CheckCircle2 size={18} />
                <span>Total Nutrition {activeMealLog?.confirmed ? '(Confirmed)' : '(Estimated Draft)'}</span>
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#16a34a' }}>
                {totalCalories} kcal
              </div>
            </div>

            {/* Macro pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {/* Protein */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '7px 10px',
                borderRadius: 20,
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#e11d48',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e11d48' }} />
                <span>{Math.round(totalProtein)}g Protein</span>
              </div>

              {/* Carbs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '7px 10px',
                borderRadius: 20,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#d97706',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
                <span>{Math.round(totalCarbs)}g Carbs</span>
              </div>

              {/* Fat */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '7px 10px',
                borderRadius: 20,
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                color: '#7c3aed',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }} />
                <span>{Math.round(totalFat)}g Fat</span>
              </div>
            </div>

            {/* Review & Confirm Action */}
            {activeMealLog && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={handleConfirmMeal}
                  disabled={isConfirming || activeMealLog.confirmed}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 12,
                    border: 'none',
                    background: activeMealLog.confirmed ? '#059669' : '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: activeMealLog.confirmed ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                    transition: 'all 0.15s ease',
                    opacity: isConfirming ? 0.7 : 1,
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>
                    {activeMealLog.confirmed
                      ? '✓ Meal Confirmed & Saved to Log'
                      : (isConfirming ? 'Saving Meal...' : 'Confirm & Save Meal')}
                  </span>
                </button>
                {!activeMealLog.confirmed && (
                  <span style={{ fontSize: '0.74rem', color: '#4b5563', textAlign: 'center' }}>
                    Verify labels & portions above. Meal will only be saved to your history after confirmation.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ── BOTTOM SECTION: Recent Scans ── */}
      <div className="dash-panel" style={{ padding: '20px 24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.15rem', fontWeight: 700, color: '#18181b' }}>
            <Clock size={18} style={{ color: '#16a34a' }} />
            <span>Recent Scans</span>
          </h3>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 4 Recent Scans in a row */}
        <div className="scanner-recent-grid">
          {recentScans.map((scan) => (
            <div
              key={scan.id}
              className="scanner-recent-card"
              onClick={() => setActiveTab('history')}
              title={`View ${scan.title}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  <img
                    src={scan.image}
                    alt={scan.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span style="font-size: 22px">${scan.emoji}</span>`;
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginBottom: 2 }}>
                    {scan.date}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#18181b' }}>
                    {scan.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', marginTop: 2 }}>
                    {scan.calories} kcal
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>
                    {scan.protein}g P | {scan.carbs}g C | {scan.fat}g F
                  </div>
                </div>
              </div>

              <ChevronRight size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Guidelines Modal ── */}
      {showGuidelines && (
        <div
          className="modal-overlay"
          onClick={() => setShowGuidelines(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
        >
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 520, padding: '28px', borderRadius: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Plate Scanning Guidelines</h3>
              </div>
              <button
                onClick={() => setShowGuidelines(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.5 }}>
              <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>1. Proper Lighting:</strong>
                <p style={{ margin: '4px 0 0' }}>Capture under clear daylight or bright room lighting. Avoid casting phone shadows over the food items.</p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>2. Full Plate Angle:</strong>
                <p style={{ margin: '4px 0 0' }}>Hold your phone at a 45° angle or top-down so all items on the plate remain fully visible inside the reticle.</p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>3. Food Separation:</strong>
                <p style={{ margin: '4px 0 0' }}>Distinct boundaries between curries, rice, rotis, and sides allow the segmentation model to estimate individual volumes accurately.</p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>4. Reference Object:</strong>
                <p style={{ margin: '4px 0 0' }}>Placing a standard card or coin beside the plate provides real-world pixel scaling for gram estimation.</p>
              </div>
            </div>

            <button
              onClick={() => setShowGuidelines(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 20, padding: 12 }}
            >
              Got it, let's scan!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
