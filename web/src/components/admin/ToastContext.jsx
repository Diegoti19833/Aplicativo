import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

const ICONS = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const STYLES = {
  success: { bg: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-600', title: 'text-emerald-900', bar: 'bg-emerald-500' },
  error:   { bg: 'bg-red-50 border-red-200',         icon: 'text-red-600',     title: 'text-red-900',     bar: 'bg-red-500' },
  warning: { bg: 'bg-amber-50 border-amber-200',     icon: 'text-amber-600',   title: 'text-amber-900',   bar: 'bg-amber-500' },
  info:    { bg: 'bg-blue-50 border-blue-200',        icon: 'text-blue-600',    title: 'text-blue-900',    bar: 'bg-blue-500' },
};

function ToastItem({ toast, onRemove }) {
  const s = STYLES[toast.type] || STYLES.info;
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg w-80 max-w-full animate-toast-in ${s.bg}`}
      style={{ animation: 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
    >
      <span className={`mt-0.5 flex-shrink-0 ${s.icon}`}>{ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0">
        {toast.title && <p className={`text-sm font-semibold ${s.title}`}>{toast.title}</p>}
        {toast.message && <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>}
        {/* Progress bar */}
        <div className="mt-2 h-0.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${s.bar} rounded-full`}
            style={{ animation: `toastProgress ${toast.duration}ms linear forwards` }}
          />
        </div>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((type, titleOrMsg, message, duration = 4000) => {
    const id = ++toastId;
    const isObj = typeof titleOrMsg === 'object' && titleOrMsg !== null;
    const title = isObj ? titleOrMsg.title : (message ? titleOrMsg : undefined);
    const msg = isObj ? titleOrMsg.message : (message || titleOrMsg);

    const toast = { id, type, title, message: msg, duration };
    setToasts(prev => [...prev.slice(-3), toast]); // max 4 toasts
    setTimeout(() => remove(id), duration + 300);
    return id;
  }, [remove]);

  const toast = {
    success: (t, m, d) => add('success', t, m, d),
    error:   (t, m, d) => add('error', t, m, d),
    warning: (t, m, d) => add('warning', t, m, d),
    info:    (t, m, d) => add('info', t, m, d),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
