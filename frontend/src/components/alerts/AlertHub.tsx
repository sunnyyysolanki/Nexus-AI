import React, { useState } from 'react';
import { useSendAlert } from '../../hooks/useAlerts';
import { SeverityLevel, AlertPayload } from '../../types/api';
import { Bell, Send, Activity, FileJson, CheckCircle2 } from 'lucide-react';

export const AlertHub: React.FC = () => {
  const { mutate: sendAlert, isPending } = useSendAlert();

  const [serviceName, setServiceName] = useState('order-service');
  const [alertName, setAlertName] = useState('HikariPoolConnectionLeak');
  const [severity, setSeverity] = useState<SeverityLevel>('CRITICAL');
  const [message, setMessage] = useState('Connection pool exhausted: 100/100 active connections waiting on database lock.');
  const [metadata, setMetadata] = useState('{\n  "cluster": "us-east-1",\n  "environment": "production",\n  "threshold": "95%"\n}');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AlertPayload = {
      serviceName,
      alertName,
      severity,
      message,
      metadata,
      timestamp: new Date().toISOString(),
    };

    sendAlert(payload, {
      onSuccess: () => {
        // Show inline success message
        setSuccessMsg(`🚨 Alert ingested successfully! Service: ${serviceName}, Incident created in DB.`);
        
        // Reset all input fields
        setServiceName('');
        setAlertName('');
        setMessage('');
        setMetadata('');

        // Auto-dismiss banner after 5s
        setTimeout(() => {
          setSuccessMsg(null);
        }, 5000);
      },
    });
  };

  const applyPreset = (presetService: string, presetName: string, presetSev: SeverityLevel, presetMsg: string) => {
    setServiceName(presetService);
    setAlertName(presetName);
    setSeverity(presetSev);
    setMessage(presetMsg);
    setSuccessMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Alert Ingestion Hub</h2>
          <p className="text-xs text-slate-400">Simulate, ingest, and route real-time telemetry alerts via POST /api/v1/alerts</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-dark-surface px-3 py-1.5 rounded-lg border border-dark-border">
          <Activity className="w-4 h-4 text-rose-400" />
          <span>Ingestion Endpoint: /api/v1/alerts</span>
        </div>
      </div>

      {/* Inline Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-glow-emerald animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-xs font-mono text-emerald-400 hover:text-white underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Preset Selector */}
      <div className="p-4 rounded-xl glass-card border border-dark-border space-y-3">
        <label className="block text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
          Quick Telemetry Alert Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() =>
              applyPreset(
                'order-service',
                'HikariPoolConnectionLeak',
                'CRITICAL',
                'Connection pool exhausted: 100/100 active connections waiting on DB lock.'
              )
            }
            className="p-3 rounded-xl bg-dark-bg border border-dark-border hover:border-rose-500/50 hover:bg-rose-950/20 text-left transition-all group"
          >
            <div className="font-semibold text-rose-400 group-hover:text-rose-300 flex items-center justify-between">
              <span>🔥 DB Connection Leak</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">order-service</div>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset(
                'payment-service',
                'GatewayTimeout504',
                'HIGH',
                'Stripe payment gateway response timeout exceeding 15000ms SLA.'
              )
            }
            className="p-3 rounded-xl bg-dark-bg border border-dark-border hover:border-amber-500/50 hover:bg-amber-950/20 text-left transition-all group"
          >
            <div className="font-semibold text-amber-400 group-hover:text-amber-300 flex items-center justify-between">
              <span>⚠️ Payment Timeout</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">payment-service</div>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset(
                'auth-service',
                'JwtSecretKeyMismatch',
                'MEDIUM',
                'Signature verification failed for incoming bearer token across cluster.'
              )
            }
            className="p-3 rounded-xl bg-dark-bg border border-dark-border hover:border-indigo-500/50 hover:bg-indigo-950/20 text-left transition-all group"
          >
            <div className="font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center justify-between">
              <span>🔒 Auth JWT Error</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">auth-service</div>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset(
                'linkforge',
                'RuntimeException',
                'CRITICAL',
                'HikariPool-1 connection timeout: Database exhausted during URL shortening'
              )
            }
            className="p-3 rounded-xl bg-dark-bg border border-dark-border hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition-all group"
          >
            <div className="font-semibold text-purple-400 group-hover:text-purple-300 flex items-center justify-between">
              <span>💥 Linkforge Error</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">linkforge</div>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 rounded-xl glass-card border border-dark-border space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-dark-border pb-3">
          <Bell className="w-4 h-4 text-rose-400" />
          <h3 className="font-bold text-sm text-slate-200">Alert Payload Configurator</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Service *</label>
            <input
              type="text"
              required
              placeholder="e.g. order-service"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Alert Identifier *</label>
            <input
              type="text"
              required
              placeholder="e.g. DatabaseConnectionLeak"
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1.5">Severity Level *</label>
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

        <div>
          <label className="block text-slate-300 font-medium mb-1">Alert Description / Message</label>
          <textarea
            rows={3}
            placeholder="Enter failure message details..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
            <FileJson className="w-3.5 h-3.5 text-indigo-400" />
            Metadata (JSON String)
          </label>
          <textarea
            rows={3}
            placeholder='{"cluster": "production"}'
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs shadow-glow-rose transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isPending ? 'Ingesting via Gateway...' : 'Send Alert Event (POST)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
