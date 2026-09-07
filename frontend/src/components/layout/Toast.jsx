import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        let Icon = Info;
        let borderColor = 'rgba(255, 255, 255, 0.15)';
        let iconColor = 'var(--text-primary)';

        if (t.type === 'success') {
          Icon = CheckCircle2;
          borderColor = 'rgba(16, 185, 129, 0.4)';
          iconColor = 'var(--emerald-400)';
        } else if (t.type === 'danger' || t.type === 'error') {
          Icon = AlertCircle;
          borderColor = 'rgba(244, 63, 94, 0.4)';
          iconColor = 'var(--rose-400)';
        } else if (t.type === 'warning') {
          Icon = AlertCircle;
          borderColor = 'rgba(245, 158, 11, 0.4)';
          iconColor = 'var(--saffron-400)';
        }

        return (
          <div 
            key={t.id} 
            className="toast"
            style={{ borderLeft: `4px solid ${borderColor}` }}
          >
            <Icon size={18} color={iconColor} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button 
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
