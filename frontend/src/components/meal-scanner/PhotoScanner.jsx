import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
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
  Plus,
  Flame,
  Check
} from 'lucide-react';

export const PhotoScanner = () => {
  const { setActiveTab, showToast } = useApp();
  const fileInputRef = useRef(null);

  // Plate image state
  const defaultPlateImage = 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1000&auto=format&fit=crop&q=80';
  const [plateImage, setPlateImage] = useState(defaultPlateImage);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  // Detected food items matching reference screenshot
  const detectedItems = [
    {
      id: 'chicken',
      name: 'Grilled Chicken Breast',
      category: '(Chicken)',
      portion: '1 piece (100 g)',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 4,
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=150&auto=format&fit=crop&q=80',
      emoji: '🍗'
    },
    {
      id: 'rice',
      name: 'Brown Rice',
      category: '(Cooked)',
      portion: '1 cup (150 g)',
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 2,
      image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=150&auto=format&fit=crop&q=80',
      emoji: '🍚'
    },
    {
      id: 'broccoli',
      name: 'Broccoli',
      category: '(Cooked)',
      portion: '1 cup (100 g)',
      calories: 55,
      protein: 4,
      carbs: 11,
      fat: 0,
      image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=150&auto=format&fit=crop&q=80',
      emoji: '🥦'
    },
    {
      id: 'carrots',
      name: 'Carrots',
      category: '(Cooked)',
      portion: '1/2 cup (75 g)',
      calories: 31,
      protein: 1,
      carbs: 7,
      fat: 0,
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150&auto=format&fit=crop&q=80',
      emoji: '🥕'
    }
  ];

  // Estimated totals
  const totalCalories = detectedItems.reduce((acc, item) => acc + item.calories, 0); // 467 kcal
  const totalProtein = detectedItems.reduce((acc, item) => acc + item.protein, 0);   // 41 -> 42g
  const totalCarbs = detectedItems.reduce((acc, item) => acc + item.carbs, 0);       // 63g
  const totalFat = detectedItems.reduce((acc, item) => acc + item.fat, 0);           // 6g

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

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPlateImage(reader.result);
      runSimulatedScan();
    };
    reader.readAsDataURL(file);
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
            <div className="scanner-items-grid">
              {detectedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`scanner-item-card${selectedItemIndex === idx ? ' selected' : ''}`}
                  onClick={() => setSelectedItemIndex(selectedItemIndex === idx ? null : idx)}
                >
                  {/* Image banner */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="scanner-item-card__img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const ph = document.createElement('div');
                      ph.className = 'scanner-item-card__img-placeholder';
                      ph.textContent = item.emoji;
                      e.target.parentElement.insertBefore(ph, e.target.nextSibling);
                    }}
                  />

                  {/* Card body */}
                  <div className="scanner-item-card__body">
                    <div className="scanner-item-card__name">{item.name}</div>
                    <div className="scanner-item-card__category">{item.category}</div>
                    <div className="scanner-item-card__portion">{item.portion}</div>
                    <div className="scanner-item-card__footer">
                      <div className="scanner-item-card__calories">{item.calories} kcal</div>
                      <div className="scanner-item-card__macros">
                        {item.protein}g P · {item.carbs}g C · {item.fat}g F
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                <span>Total Nutrition (Estimated)</span>
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
                <span>42g Protein</span>
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
                <span>63g Carbs</span>
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
                <span>6g Fat</span>
              </div>
            </div>
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
