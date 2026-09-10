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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 rounded-md border border-zinc-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <BellPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100">Simulate Alert Ingestion</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Triggers POST /api/v1/alerts and creates real-time incident</p>
            </div>
          </div>
          <button
            onClick={() => setAlertModalOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-widest">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('order-service', 'HikariPoolConnectionLeak', 'CRITICAL', 'Connection pool exhausted: 100/100 active connections waiting.')}
              className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
            >
              DB Connection Leak
            </button>
            <button
              type="button"
              onClick={() => applyPreset('payment-service', 'GatewayTimeout504', 'HIGH', 'Stripe payment gateway response timeout exceeding 15000ms.')}
              className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
            >
              Payment Timeout
            </button>
            <button
              type="button"
              onClick={() => applyPreset('auth-service', 'JwtSecretKeyMismatch', 'MEDIUM', 'Signature verification failed for incoming bearer token.')}
              className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
            >
              Auth Jwt Error
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            {/* Service Name */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Service Name *</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono text-xs"
              />
            </div>

            {/* Alert Name */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Alert Name *</label>
              <input
                type="text"
                required
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-zinc-400 font-medium mb-2 text-xs">Severity *</label>
            <div className="grid grid-cols-4 gap-2">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityLevel[]).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`py-1.5 px-2 rounded-md font-mono text-[11px] font-bold border text-center transition-colors ${
                    severity === sev
                      ? sev === 'CRITICAL'
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                        : sev === 'HIGH'
                        ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                        : sev === 'MEDIUM'
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'bg-zinc-800 border-zinc-500 text-zinc-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Message */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Alert Message</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-xs"
            />
          </div>

          {/* Metadata JSON */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Metadata (JSON format)</label>
            <textarea
              rows={2}
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              className="w-full bg-[#09090b] border border-zinc-800 rounded-md px-3 py-2 text-zinc-300 font-mono text-[11px] focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setAlertModalOpen(false)}
              className="px-4 py-2 rounded-md bg-transparent border border-transparent text-zinc-400 font-medium hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold shadow-sm transition-colors disabled:opacity-50 text-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isPending ? 'Ingesting...' : 'Fire Alert Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
