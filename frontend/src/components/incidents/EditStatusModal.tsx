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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 rounded-md border border-zinc-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-zinc-400" />
            <div>
              <h3 className="font-bold text-base text-zinc-100">Update Incident</h3>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">ID: {editingIncident.id.slice(0, 12)}...</p>
            </div>
          </div>
          <button
            onClick={closeEditModal}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Service Title */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Incident Details</label>
            <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200">
              <div className="font-medium">{editingIncident.title}</div>
              <div className="text-[11px] font-mono text-zinc-500 mt-1">{editingIncident.serviceName}</div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-zinc-400 font-medium mb-2 text-xs">Lifecycle Status *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['OPEN', 'INVESTIGATING', 'RESOLVED'] as IncidentStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 rounded-md font-semibold border text-[11px] text-center transition-colors ${
                    status === st
                      ? st === 'OPEN'
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                        : st === 'INVESTIGATING'
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Root Cause Summary */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Root Cause Summary</label>
            <input
              type="text"
              placeholder="e.g., HikariCP database connection leak in Order Service"
              value={rootCauseSummary}
              onChange={(e) => setRootCauseSummary(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm"
            />
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="block text-zinc-400 font-medium mb-1.5 text-xs">Resolution & Remediation Notes</label>
            <textarea
              rows={3}
              placeholder="e.g., Scaled replica set, cleared stuck connection pool, increased max pool size to 50."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-4 py-2 rounded-md bg-transparent border border-transparent text-zinc-400 font-medium hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold shadow-sm transition-colors disabled:opacity-50 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isPending ? 'Saving...' : 'Save Incident Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
