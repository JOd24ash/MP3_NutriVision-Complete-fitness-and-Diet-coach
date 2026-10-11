import React, { useState } from 'react';
import { Layers, Maximize2, ShieldAlert } from 'lucide-react';

export const PlateCanvas = ({ 
  imageSrc, 
  items = [], 
  selectedItemId, 
  onSelectItem, 
  referenceObject = 'credit_card',
  referenceScaleCm = 8.56
}) => {
  const [showOverlays, setShowOverlays] = useState(true);

  return (
    <div className="glass-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--emerald-400)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            YOLOv8-Seg Detection Canvas
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowOverlays(!showOverlays)}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            {showOverlays ? 'Hide Segments' : 'Show Segments'}
          </button>
        </div>
      </div>

      {/* Image & Bounding Box Overlays Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 11',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: '#04070d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={imageSrc} 
          alt="Plate scanning preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Reference Object Indicator in bottom-right corner */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: '#38bdf8',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ width: '12px', height: '8px', border: '1px solid #38bdf8', borderRadius: '2px' }} />
          <span>Ref Scale: <strong>{referenceScaleCm} cm</strong> ({referenceObject})</span>
        </div>

        {/* Segmentation Overlays */}
        {showOverlays && items.map((item) => {
          const isSelected = selectedItemId === item.id;
          const box = item.box || { x: 30, y: 30, w: 25, h: 25 };
          const borderColor = item.guardrail_status === 'block' 
            ? '#f43f5e' 
            : item.guardrail_status === 'warn' 
            ? '#f59e0b' 
            : '#10b981';

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem && onSelectItem(item.id)}
              style={{
                position: 'absolute',
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
                border: `2px ${isSelected ? 'solid' : 'dashed'} ${borderColor}`,
                background: isSelected ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.08)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 0 16px ${borderColor}` : 'none',
                zIndex: isSelected ? 10 : 2
              }}
            >
              {/* Floating label pill */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '4px',
                background: borderColor,
                color: '#080c14',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                textTransform: 'capitalize'
              }}>
                {item.food_label.replace(/_/g, ' ')} ({Math.round(item.confidence * 100)}%)
              </div>

              {/* Grams & Calorie preview */}
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                background: 'rgba(0,0,0,0.75)',
                color: '#f8fafc',
                padding: '1px 6px',
                borderRadius: '3px',
                fontSize: '0.65rem',
                fontWeight: 600
              }}>
                {item.est_grams}g • {item.calories} kcal
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
