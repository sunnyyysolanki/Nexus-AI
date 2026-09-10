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
          className={`flex items-start gap-3 p-4 rounded-md border shadow-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'border-emerald-500/20 text-emerald-400 bg-zinc-950'
              : toast.type === 'error'
              ? 'border-rose-500/20 text-rose-400 bg-zinc-950'
              : toast.type === 'warning'
              ? 'border-amber-500/20 text-amber-400 bg-zinc-950'
              : 'border-zinc-800 text-zinc-100 bg-zinc-950'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-500" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-zinc-500" />}
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-xs leading-snug">{toast.title}</h4>
            {toast.message && (
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed break-words">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
