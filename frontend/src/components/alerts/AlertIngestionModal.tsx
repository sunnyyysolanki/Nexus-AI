import React, { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useSendAlert } from '../../hooks/useAlerts';
import { SeverityLevel } from '../../types/api';
import { X, BellPlus, Zap } from 'lucide-react';

export const AlertIngestionModal: React.FC = () => {
  const { isAlertModalOpen, setAlertModalOpen } = useUIStore();
  const { mutate: sendAlert, isPending } = useSendAlert();

  const [serviceName, setServiceName] = useState('order-service');
  const [alertName, setAlertName] = useState('HikariPoolConnectionLeak');
  const [severity, setSeverity] = useState<SeverityLevel>('CRITICAL');
  const [message, setMessage] = useState('Connection pool exhausted: 100/100 active connections waiting on database lock.');
  const [metadata, setMetadata] = useState('{"cluster": "us-east-1", "environment": "production", "threshold": "95%"}');

  if (!isAlertModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendAlert({
      serviceName,
      alertName,
      severity,
      message,
      metadata,
    });
  };

  // Quick Preset Selector
  const applyPreset = (presetService: string, presetName: string, presetSev: SeverityLevel, presetMsg: string) => {
    setServiceName(presetService);
    setAlertName(presetName);
    setSeverity(presetSev);
    setMessage(presetMsg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-card rounded-2xl border border-dark-border p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <BellPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Simulate Alert Ingestion</h3>
              <p className="text-xs text-slate-400">Triggers POST /api/v1/alerts and creates real-time incident</p>
            </div>
          </div>
          <button
            onClick={() => setAlertModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Quick Alert Presets</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('order-service', 'HikariPoolConnectionLeak', 'CRITICAL', 'Connection pool exhausted: 100/100 active connections waiting.')}
              className="px-2.5 py-1 rounded-lg bg-dark-bg border border-dark-border text-[11px] text-slate-300 hover:border-rose-500/50 hover:text-rose-300 transition-all"
            >
              🔥 DB Connection Leak
            </button>
            <button
              type="button"
              onClick={() => applyPreset('payment-service', 'GatewayTimeout504', 'HIGH', 'Stripe payment gateway response timeout exceeding 15000ms.')}
              className="px-2.5 py-1 rounded-lg bg-dark-bg border border-dark-border text-[11px] text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-all"
            >
              ⚠️ Payment Gateway Timeout
            </button>
            <button
              type="button"
              onClick={() => applyPreset('auth-service', 'JwtSecretKeyMismatch', 'MEDIUM', 'Signature verification failed for incoming bearer token.')}
              className="px-2.5 py-1 rounded-lg bg-dark-bg border border-dark-border text-[11px] text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
            >
              🔒 Auth Jwt Error
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {/* Service Name */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Service Name *</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Alert Name */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Alert Name *</label>
              <input
                type="text"
                required
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Severity *</label>
            <div className="grid grid-cols-4 gap-2">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityLevel[]).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`py-1.5 px-2 rounded-lg font-mono text-[11px] font-bold border text-center transition-all ${
                    severity === sev
                      ? sev === 'CRITICAL'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : sev === 'HIGH'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : sev === 'MEDIUM'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-dark-bg border-dark-border text-slate-400'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Message */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Alert Message</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Metadata JSON */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Metadata (JSON format)</label>
            <textarea
              rows={2}
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border">
            <button
              type="button"
              onClick={() => setAlertModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-dark-bg border border-dark-border text-slate-300 font-medium hover:bg-dark-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium shadow-glow-rose transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isPending ? 'Ingesting Alert...' : 'Fire Alert Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
