import React from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl border glass-card shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40'
              : toast.type === 'error'
              ? 'border-rose-500/30 text-rose-300 bg-rose-950/40'
              : toast.type === 'warning'
              ? 'border-amber-500/30 text-amber-300 bg-amber-950/40'
              : 'border-indigo-500/30 text-indigo-300 bg-indigo-950/40'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-sm leading-snug">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs text-slate-300 mt-1 leading-relaxed opacity-90 break-words">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
