'use client';

import { useEffect, useState, useCallback } from 'react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

let addToastExternal: ((message: string, type: 'error' | 'warning' | 'info') => void) | null = null;

export function showToast(message: string, type: 'error' | 'warning' | 'info' = 'error') {
  addToastExternal?.(message, type);
}

export default function ErrorToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  useEffect(() => {
    addToastExternal = addToast;
    return () => {
      addToastExternal = null;
    };
  }, [addToast]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  const typeStyles = {
    error: { borderLeft: '3px solid #dc2626', background: 'rgba(220, 38, 38, 0.08)' },
    warning: { borderLeft: '3px solid #f59e0b', background: 'rgba(245, 158, 11, 0.08)' },
    info: { borderLeft: '3px solid #3b82f6', background: 'rgba(59, 130, 246, 0.08)' },
  };

  const labels = { error: 'ERROR', warning: 'WARNING', info: 'INFO' };

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '380px',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: '12px 16px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono), monospace',
            color: 'var(--ink)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            ...typeStyles[toast.type],
          }}
          role="alert"
        >
          <span style={{
            fontWeight: '600',
            fontSize: '10px',
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
            color: toast.type === 'error' ? '#dc2626' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
          }}>
            [{labels[toast.type]}]
          </span>
          <span style={{ flex: 1, lineHeight: '1.4' }}>{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink-muted)',
              fontSize: '14px',
              padding: '0 0 0 4px',
              lineHeight: '1',
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
