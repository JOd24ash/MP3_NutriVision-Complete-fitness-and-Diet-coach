import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, HelpCircle } from 'lucide-react';

export const GuardrailBadge = ({ status = 'ok', reason = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  let badgeClass = 'badge-success';
  let Icon = CheckCircle2;
  let label = 'Guardrail Pass';

  if (status === 'warn') {
    badgeClass = 'badge-warning';
    Icon = AlertTriangle;
    label = 'Health Warning';
  } else if (status === 'block') {
    badgeClass = 'badge-danger';
    Icon = ShieldAlert;
    label = 'Allergen Block';
  } else if (status === 'unknown') {
    badgeClass = 'badge-neutral';
    Icon = HelpCircle;
    label = 'Needs Review';
  }

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`badge ${badgeClass}`} style={{ cursor: reason ? 'help' : 'default' }}>
        <Icon size={12} />
        <span>{label}</span>
      </span>

      {showTooltip && reason && (
        <div style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          color: '#f8fafc',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.78rem',
          whiteSpace: 'nowrap',
          maxWidth: '280px',
          zIndex: 50,
          pointerEvents: 'none',
          lineHeight: '1.4'
        }}>
          {reason}
        </div>
      )}
    </div>
  );
};
