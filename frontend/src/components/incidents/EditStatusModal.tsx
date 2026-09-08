import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useUpdateIncident } from '../../hooks/useIncidents';
import { IncidentStatus } from '../../types/api';
import { X, Save, AlertCircle } from 'lucide-react';

export const EditStatusModal: React.FC = () => {
  const { isEditModalOpen, editingIncident, closeEditModal } = useUIStore();
  const { mutate: updateIncident, isPending } = useUpdateIncident();

  const [status, setStatus] = useState<IncidentStatus>('OPEN');
  const [rootCauseSummary, setRootCauseSummary] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (editingIncident) {
      setStatus(editingIncident.status);
      setRootCauseSummary(editingIncident.rootCauseSummary || '');
      setResolutionNotes(editingIncident.resolutionNotes || '');
    }
  }, [editingIncident]);

  if (!isEditModalOpen || !editingIncident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateIncident({
      id: editingIncident.id,
      request: {
        status,
        rootCauseSummary: rootCauseSummary || undefined,
        resolutionNotes: resolutionNotes || undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-card rounded-2xl border border-dark-border p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border pb-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base text-white">Update Incident Status</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {editingIncident.id.slice(0, 12)}...</p>
            </div>
          </div>
          <button
            onClick={closeEditModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Service Title */}
          <div>
            <label className="block text-slate-400 mb-1">Incident Title & Service</label>
            <div className="p-3 rounded-lg bg-dark-bg border border-dark-border text-slate-200 font-medium">
              <div>{editingIncident.title}</div>
              <div className="text-[11px] font-mono text-indigo-400 mt-0.5">{editingIncident.serviceName}</div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Lifecycle Status *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['OPEN', 'INVESTIGATING', 'RESOLVED'] as IncidentStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 rounded-xl font-semibold border text-center transition-all ${
                    status === st
                      ? st === 'OPEN'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-glow-rose'
                        : st === 'INVESTIGATING'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-glow-amber'
                        : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-glow-emerald'
                      : 'bg-dark-bg border-dark-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Root Cause Summary */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Root Cause Summary</label>
            <input
              type="text"
              placeholder="e.g., HikariCP database connection leak in Order Service"
              value={rootCauseSummary}
              onChange={(e) => setRootCauseSummary(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Resolution & Remediation Notes</label>
            <textarea
              rows={3}
              placeholder="e.g., Scaled replica set, cleared stuck connection pool, increased max pool size to 50."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-4 py-2 rounded-xl bg-dark-bg border border-dark-border text-slate-300 font-medium hover:bg-dark-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-glow-indigo transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? 'Saving Changes...' : 'Save Incident Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
