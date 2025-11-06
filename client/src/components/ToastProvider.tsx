import React, { createContext, useContext, useMemo, useState } from 'react';

type Toast = { id: number; type: 'success' | 'error' | 'info'; message: string };
type ToastContextType = {
  show: (params: { type?: 'success' | 'error' | 'info'; message: string; durationMs?: number }) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextType>(() => ({
    show: ({ type = 'info', message, durationMs = 3500 }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, durationMs);
    }
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[1000] space-y-3">
        {toasts.map((t) => (
          <div key={t.id} className={[
            'min-w-[260px] max-w-sm px-4 py-3 rounded-lg shadow-lg border',
            'backdrop-blur bg-slate-900/90',
            t.type === 'success' && 'border-green-500/40',
            t.type === 'error' && 'border-red-500/40',
            t.type === 'info' && 'border-blue-500/40'
          ].filter(Boolean).join(' ')}>
            <div className="flex items-start gap-3">
              <div className={[
                'w-2 h-2 mt-2 rounded-full',
                t.type === 'success' && 'bg-green-400',
                t.type === 'error' && 'bg-red-400',
                t.type === 'info' && 'bg-blue-400'
              ].filter(Boolean).join(' ')}></div>
              <div className="text-sm text-slate-100">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}


