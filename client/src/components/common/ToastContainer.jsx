import React from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        maxWidth: '420px',
        width: '100%'
      }}
    >
      {toasts.map((toast) => {
        let bgColor = '#1e293b';
        let IconComponent = Info;
        let borderColor = '#334155';

        if (toast.type === 'success') {
          bgColor = '#065f46';
          IconComponent = CheckCircle2;
          borderColor = '#059669';
        } else if (toast.type === 'error') {
          bgColor = '#991b1b';
          IconComponent = AlertCircle;
          borderColor = '#dc2626';
        } else if (toast.type === 'warning') {
          bgColor = '#92400e';
          IconComponent = AlertTriangle;
          borderColor = '#d97706';
        }

        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              color: '#ffffff',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              animation: 'modal-enter 0.2s ease-out',
              fontSize: '0.9rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconComponent size={20} style={{ flexShrink: 0 }} />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                opacity: 0.8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
