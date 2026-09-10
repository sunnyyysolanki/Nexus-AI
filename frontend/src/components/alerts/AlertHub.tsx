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
        setSuccessMsg(`Alert ingested successfully! Service: ${serviceName}, Incident created in DB.`);
        
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-dark-border">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Alert Ingestion</h2>
          <p className="text-xs text-zinc-500 mt-1">Simulate, ingest, and route real-time telemetry alerts</p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-zinc-500" />
          <span>POST /api/v1/alerts</span>
        </div>
      </div>

      {/* Inline Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-md bg-zinc-900 border border-emerald-500/30 text-zinc-300 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Preset Selector */}
      <div className="p-4 rounded-md bg-dark-surface border border-dark-border space-y-3 shadow-sm">
        <label className="block text-[11px] font-mono text-zinc-500 font-semibold uppercase tracking-widest">
          Quick Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
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
            className="p-3 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-left transition-colors group"
          >
            <div className="font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
              <span>DB Connection Leak</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1.5">order-service</div>
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
            className="p-3 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-left transition-colors group"
          >
            <div className="font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
              <span>Payment Timeout</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1.5">payment-service</div>
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
            className="p-3 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-left transition-colors group"
          >
            <div className="font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
              <span>Auth JWT Error</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1.5">auth-service</div>
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
            className="p-3 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-left transition-colors group"
          >
            <div className="font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
              <span>Linkforge Error</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-1.5">linkforge</div>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 rounded-md bg-dark-surface border border-dark-border space-y-5 text-sm shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Bell className="w-4 h-4 text-zinc-400" />
          <h3 className="font-bold text-zinc-200">Alert Payload Configurator</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Target Service *</label>
            <input
              type="text"
              required
              placeholder="e.g. order-service"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Alert Identifier *</label>
            <input
              type="text"
              required
              placeholder="e.g. DatabaseConnectionLeak"
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 font-medium mb-2 text-xs">Severity Level *</label>
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

        <div>
          <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Alert Description / Message</label>
          <textarea
            rows={3}
            placeholder="Enter failure message details..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-xs"
          />
        </div>

        <div>
          <label className="block text-zinc-400 font-medium mb-1.5 text-xs flex items-center gap-1.5">
            <FileJson className="w-3.5 h-3.5 text-zinc-500" />
            Metadata (JSON String)
          </label>
          <textarea
            rows={4}
            placeholder='{"cluster": "production"}'
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            className="w-full bg-[#09090b] border border-zinc-800 rounded-md px-3 py-2 text-zinc-300 font-mono text-[11px] focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors disabled:opacity-50 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPending ? 'Ingesting...' : 'Send Alert Event'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
