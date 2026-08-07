import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  leaving?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toasts: [], addToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
    }, 3500);
  }, []);

  const colorMap = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#06b6d4' };
  const iconMap = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.leaving ? 'animate-toast-out' : 'animate-toast-in'}`}
            style={{ borderColor: `${colorMap[t.type]}40` }}>
            <span style={{ fontSize: 16 }}>{iconMap[t.type]}</span>
            <span style={{ fontSize: 13, color: '#e2e8f0', flex: 1 }}>{t.message}</span>
            <div style={{ width: 3, height: 36, background: colorMap[t.type], borderRadius: 2, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
