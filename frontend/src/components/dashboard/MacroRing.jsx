import React from 'react';

export const MacroRing = ({ 
  label, 
  current, 
  target, 
  unit = 'g', 
  radius = 38, 
  strokeWidth = 7 
}) => {
  // Calculate percentage
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  
  // Determine color based on percentage
  let color = '#10b981'; // Default green (on target)
  if (percentage >= 90 && percentage < 100) {
    color = '#f59e0b'; // Yellow (close to target)
  } else if (percentage >= 100) {
    color = '#ef4444'; // Red (over target)
  }
  
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */} 
          <circle
            stroke="rgba(0, 0, 0, 0.08)"
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
        {/* Center percentage or value */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {percentage < 100 ? (
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '0.95rem', 
              fontWeight: 800, 
              color: 'var(--text-primary)' 
            }}>
              {percentage}%
            </span>
          ) : (
            <>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '0.75rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)' 
              }}>
                {Math.round(current)}
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 600, 
                color: 'var(--text-secondary)' 
              }}>
                {unit}
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </div>
        <div style={{ 
          fontSize: '0.78rem', 
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'center',
          gap: '4px',
          marginTop: '4px'
        }}>
          <span style={{ 
            fontWeight: 600,
            color: color
          }}>
            {current}
          </span>
          <span>/</span>
          <span style={{ 
            fontWeight: 500
          }}>
            {target}{unit}
          </span>
        </div>
        {/* Remaining indicator */}
        {target > 0 && (
          <div style={{ 
            fontSize: '0.72rem', 
            marginTop: '4px',
            display: 'flex',
            justifyContent: 'center',
            gap: '2px'
          }}>
            {percentage < 100 ? (
              <>
                <span style={{ 
                  color: '#10b981',
                  fontWeight: 600
                }}>
                  {Math.max(0, target - current)}{unit}
                </span>
                <span> remaining</span>
              </>
            ) : (
              <>
                <span style={{ 
                  color: '#ef4444',
                  fontWeight: 600
                }}>
                  {Math.max(0, current - target)}{unit}
                </span>
                <span> over</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};