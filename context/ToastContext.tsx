'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, X, ShoppingCart, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'cart';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle size={18} className="text-green-400 flex-shrink-0" />,
    error:   <AlertCircle size={18} className="text-red-400 flex-shrink-0" />,
    cart:    <ShoppingCart size={18} className="text-brand-orange flex-shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-navy text-white px-5 py-3 rounded-xl shadow-2xl pointer-events-auto animate-slide-up min-w-[260px] max-w-sm"
          >
            {icons[toast.type]}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
