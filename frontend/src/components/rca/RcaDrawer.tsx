import React, { useState, useMemo } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useAnalyzeIncident, useUpdateIncident } from '../../hooks/useIncidents';
import { StatusBadge } from '../common/StatusBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import {
  X,
  Sparkles,
  AlertTriangle,
  FileCode,
  CheckCircle2,
  Copy,
  Save,
  RefreshCw,
  Cpu,
  Wrench,
  FileText,
  ListChecks,
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

interface ParsedRca {
  incidentId?: string;
  rootCause?: string;
  confidenceScore?: number;
  impactAnalysis?: string;
  evidenceSummary?: string[];
  recommendedActions?: string[];
  [key: string]: any;
}

export const RcaDrawer: React.FC = () => {
  const { isRcaDrawerOpen, setRcaDrawerOpen, selectedIncident, openEditModal } = useUIStore();
  const { mutate: analyzeIncident, isPending: isAnalyzing } = useAnalyzeIncident();
  const { mutate: updateIncident, isPending: isUpdating } = useUpdateIncident();
  const addToast = useNotificationStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<'summary' | 'json' | 'remediation'>('summary');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Safely parse rcaFullJson if present
  const parsedRca = useMemo<ParsedRca | null>(() => {
    if (!selectedIncident?.rcaFullJson) return null;
    try {
      return JSON.parse(selectedIncident.rcaFullJson);
    } catch {
      return null;
    }
  }, [selectedIncident?.rcaFullJson]);

  if (!isRcaDrawerOpen || !selectedIncident) return null;

  const hasConfidence = selectedIncident.confidenceScore !== null && selectedIncident.confidenceScore !== undefined;

  const handleRunAiAnalysis = () => {
    analyzeIncident(selectedIncident.id);
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    const notesToSave = resolutionNotes.trim() || selectedIncident.resolutionNotes;
    if (!notesToSave) return;

    updateIncident(
      {
        id: selectedIncident.id,
        request: {
          status: 'RESOLVED',
          resolutionNotes: notesToSave,
        },
      },
      {
        onSuccess: () => {
          setResolutionNotes('');
        },
      }
    );
  };

  const handleCopyJson = () => {
    if (selectedIncident.rcaFullJson) {
      navigator.clipboard.writeText(selectedIncident.rcaFullJson);
      addToast({ title: 'Copied to Clipboard', message: 'RCA Raw JSON copied!', type: 'info' });
    }
  };

  const rootCauseText = parsedRca?.rootCause || selectedIncident.rootCauseSummary;
  const impactText = parsedRca?.impactAnalysis || selectedIncident.impactAnalysis;
  const evidenceList = parsedRca?.evidenceSummary || [];
  const recommendedList = parsedRca?.recommendedActions || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-dark-bg border-l border-dark-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 bg-dark-surface border-b border-dark-border flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedIncident.status} />
                <SeverityBadge severity={selectedIncident.severity} />
                <span className="text-xs font-mono text-slate-400">ID: {selectedIncident.id}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{selectedIncident.title}</h2>
              <p className="text-xs font-mono text-indigo-400">Target Microservice: {selectedIncident.serviceName}</p>
            </div>

            <button
              onClick={() => setRcaDrawerOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI RCA Status Bar Banner */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-purple-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-5 h-5 animate-pulse text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  AI Root Cause Diagnostics Engine
                </h4>
                <p className="text-[11px] text-purple-300/80">
                  {hasConfidence
                    ? `AI Confidence Score: ${selectedIncident.confidenceScore}%`
                    : 'Analysis not generated yet. Click analyze to trigger.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-glow-indigo transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Logs & Metrics...' : 'Trigger AI RCA'}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-dark-border bg-dark-surface/50 text-xs">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-5 py-2.5 font-medium border-b-2 transition-all ${
                activeTab === 'summary'
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              RCA Findings & AI Insights
            </button>
            <button
              onClick={() => setActiveTab('remediation')}
              className={`px-5 py-2.5 font-medium border-b-2 transition-all ${
                activeTab === 'remediation'
                  ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolution & Remediation
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-5 py-2.5 font-medium border-b-2 transition-all ${
                activeTab === 'json'
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Telemetry JSON
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* TAB 1: DIAGNOSIS & EVIDENCE */}
            {activeTab === 'summary' && (
              <div className="space-y-5">
                {/* Confidence Bar */}
                {hasConfidence && (
                  <div className="p-4 rounded-xl glass-card border border-purple-900/40 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        AI Diagnosis Confidence Level
                      </span>
                      <span className="font-mono font-bold text-purple-300 text-sm">
                        {selectedIncident.confidenceScore}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-dark-bg border border-dark-border overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${selectedIncident.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Root Cause Summary Card */}
                <div className="p-4 rounded-xl glass-card border border-dark-border space-y-2">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Identified Root Cause
                  </h4>
                  <p className="text-slate-300 leading-relaxed bg-dark-bg/80 p-3.5 rounded-lg border border-dark-border font-mono text-[11px]">
                    {rootCauseText || 'No root cause analyzed yet. Trigger AI RCA analysis using the button above.'}
                  </p>
                </div>

                {/* Evidence Summary List Card */}
                {evidenceList.length > 0 && (
                  <div className="p-4 rounded-xl glass-card border border-dark-border space-y-3">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      Gathered Evidence Summary ({evidenceList.length})
                    </h4>
                    <div className="space-y-2">
                      {evidenceList.map((item: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-lg bg-dark-bg/90 border border-dark-border text-slate-300 text-xs font-mono leading-relaxed"
                        >
                          <span className="shrink-0 font-bold text-cyan-400 mt-0.5">#{idx + 1}</span>
                          <span className="break-words">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Impact Analysis Card */}
                {impactText && (
                  <div className="p-4 rounded-xl glass-card border border-dark-border space-y-2">
                    <h4 className="font-bold text-slate-200">System Impact & Cascade Analysis</h4>
                    <p className="text-slate-300 leading-relaxed bg-dark-bg/80 p-3.5 rounded-lg border border-dark-border text-xs">
                      {impactText}
                    </p>
                  </div>
                )}

                {/* Original Alert Message */}
                <div className="p-4 rounded-xl glass-card border border-dark-border space-y-2">
                  <h4 className="font-bold text-slate-200">Ingested Alert Message</h4>
                  <div className="p-3 rounded-lg bg-dark-bg font-mono text-[11px] text-slate-300 border border-dark-border">
                    {selectedIncident.alertMessage || 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACTION & EXECUTION */}
            {activeTab === 'remediation' && (
              <div className="space-y-5">
                {/* AI Recommended Actions Checklist */}
                {recommendedList.length > 0 && (
                  <div className="p-4 rounded-xl glass-card border border-indigo-900/50 space-y-3 bg-gradient-to-b from-indigo-950/20 to-transparent">
                    <h4 className="font-bold text-indigo-200 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-indigo-400" />
                      AI Recommended Action Plan ({recommendedList.length})
                    </h4>
                    <div className="space-y-2">
                      {recommendedList.map((action: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs leading-relaxed"
                        >
                          <div className="shrink-0 p-1 rounded-lg bg-indigo-500/20 text-indigo-300 mt-0.5">
                            <ListChecks className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl glass-card border border-dark-border space-y-3">
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Remediation & Resolution Log
                  </h4>

                  {selectedIncident.resolutionNotes ? (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 font-mono text-xs">
                      {selectedIncident.resolutionNotes}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs">No resolution notes logged yet.</p>
                  )}
                </div>

                {/* Quick Resolve Form */}
                <form onSubmit={handleSaveResolution} className="p-4 rounded-xl glass-card border border-dark-border space-y-3">
                  <h4 className="font-bold text-slate-200">Mark Incident as RESOLVED</h4>
                  <textarea
                    rows={3}
                    placeholder="Enter final resolution notes, bug fixes, or infrastructure adjustments..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-glow-emerald transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isUpdating ? 'Saving...' : 'Resolve Incident'}</span>
                    </button>
                  </div>
                </form>

                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      setRcaDrawerOpen(false);
                      openEditModal(selectedIncident);
                    }}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    Edit all fields in status modal &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: RAW TELEMETRY JSON */}
            {activeTab === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    RCA Full Telemetry JSON Payload
                  </span>
                  {selectedIncident.rcaFullJson && (
                    <button
                      onClick={handleCopyJson}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-dark-surface border border-dark-border text-[11px] text-slate-300 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy JSON</span>
                    </button>
                  )}
                </div>

                <pre className="p-4 rounded-xl bg-[#080b11] border border-dark-border text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[500px]">
                  {selectedIncident.rcaFullJson
                    ? (() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedIncident.rcaFullJson), null, 2);
                        } catch {
                          return selectedIncident.rcaFullJson;
                        }
                      })()
                    : JSON.stringify(selectedIncident, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
