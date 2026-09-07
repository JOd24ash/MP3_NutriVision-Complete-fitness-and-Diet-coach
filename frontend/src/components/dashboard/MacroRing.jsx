import React from 'react';

export const MacroRing = ({ 
  label, 
  current, 
  target, 
  unit = 'g', 
  color = '#10b981', 
  radius = 38, 
  strokeWidth = 7 
}) => {
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percentage = Math.min(100, Math.round((current / (target || 1)) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ 
              strokeDashoffset, 
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              strokeLinecap: 'round'
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        {/* Center percentage */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '0.95rem', 
            fontWeight: 800, 
            color: 'var(--text-primary)' 
          }}>
            {percentage}%
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: color }}>{current}</strong> / {target}{unit}
        </div>
      </div>
    </div>
  );
};
