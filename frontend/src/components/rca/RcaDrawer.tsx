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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedIncident.status} />
                <SeverityBadge severity={selectedIncident.severity} />
                <span className="text-[11px] font-mono text-zinc-500">ID: {selectedIncident.id}</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{selectedIncident.title}</h2>
              <p className="text-xs font-mono text-zinc-400">Target Microservice: {selectedIncident.serviceName}</p>
            </div>

            <button
              onClick={() => setRcaDrawerOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI RCA Status Bar Banner */}
          <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                <Sparkles className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-zinc-200 flex items-center gap-1.5">
                  Root Cause Diagnostics
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {hasConfidence
                    ? `AI Match Confidence: ${selectedIncident.confidenceScore}%`
                    : 'Analysis not generated yet.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Run Diagnostics'}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-950 text-xs px-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-5 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'summary'
                  ? 'border-zinc-300 text-zinc-100'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              RCA Findings
            </button>
            <button
              onClick={() => setActiveTab('remediation')}
              className={`px-5 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'remediation'
                  ? 'border-zinc-300 text-zinc-100'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              Resolution
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-5 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'json'
                  ? 'border-zinc-300 text-zinc-100'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              Raw Telemetry
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm">
            {/* TAB 1: DIAGNOSIS & EVIDENCE */}
            {activeTab === 'summary' && (
              <div className="space-y-8">
                {/* Confidence Bar */}
                {hasConfidence && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-300 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-zinc-500" />
                        Match Confidence
                      </span>
                      <span className="font-mono font-bold text-zinc-300">
                        {selectedIncident.confidenceScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-zinc-400 transition-all duration-500"
                        style={{ width: `${selectedIncident.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Root Cause Summary Card */}
                <div className="space-y-3">
                  <h4 className="font-bold text-zinc-200 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-zinc-500" />
                    Identified Root Cause
                  </h4>
                  <div className="bg-zinc-900 p-4 rounded-md border border-zinc-800">
                    <p className="text-zinc-300 leading-relaxed font-mono text-xs">
                      {rootCauseText || 'No root cause analyzed yet. Trigger diagnostics using the button above.'}
                    </p>
                  </div>
                </div>

                {/* Evidence Summary List Card */}
                {evidenceList.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-zinc-200 flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-zinc-500" />
                      Gathered Evidence ({evidenceList.length})
                    </h4>
                    <div className="space-y-2">
                      {evidenceList.map((item: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono leading-relaxed"
                        >
                          <span className="shrink-0 font-bold text-zinc-500 mt-0.5">{(idx + 1).toString().padStart(2, '0')}</span>
                          <span className="break-words">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Impact Analysis Card */}
                {impactText && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-zinc-200 text-sm">System Impact & Cascade Analysis</h4>
                    <div className="bg-zinc-900 p-4 rounded-md border border-zinc-800">
                      <p className="text-zinc-300 leading-relaxed text-sm">
                        {impactText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Original Alert Message */}
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <h4 className="font-bold text-zinc-500 text-xs uppercase tracking-widest">Ingested Alert</h4>
                  <div className="p-3 rounded-md bg-[#09090b] font-mono text-xs text-zinc-400 border border-zinc-800">
                    {selectedIncident.alertMessage || 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACTION & EXECUTION */}
            {activeTab === 'remediation' && (
              <div className="space-y-8">
                {/* AI Recommended Actions Checklist */}
                {recommendedList.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-zinc-200 flex items-center gap-2 text-sm">
                      <Wrench className="w-4 h-4 text-zinc-500" />
                      Recommended Action Plan
                    </h4>
                    <div className="space-y-3">
                      {recommendedList.map((action: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm leading-relaxed"
                        >
                          <div className="shrink-0 mt-0.5">
                            <ListChecks className="w-4 h-4 text-zinc-500" />
                          </div>
                          <span className="font-medium">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <h4 className="font-bold text-zinc-200 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                    Resolution Log
                  </h4>

                  {selectedIncident.resolutionNotes ? (
                    <div className="p-4 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs leading-relaxed">
                      {selectedIncident.resolutionNotes}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm italic">No resolution notes logged yet.</p>
                  )}
                </div>

                {/* Quick Resolve Form */}
                <form onSubmit={handleSaveResolution} className="space-y-3 pt-4">
                  <h4 className="font-bold text-zinc-200 text-sm">Mark Incident as RESOLVED</h4>
                  <textarea
                    rows={4}
                    placeholder="Enter final resolution notes, bug fixes, or infrastructure adjustments..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 placeholder-zinc-600"
                  />
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRcaDrawerOpen(false);
                        openEditModal(selectedIncident);
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Open full edit modal &rarr;
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isUpdating ? 'Saving...' : 'Resolve Incident'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: RAW TELEMETRY JSON */}
            {activeTab === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5" />
                    Payload
                  </span>
                  {selectedIncident.rcaFullJson && (
                    <button
                      onClick={handleCopyJson}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  )}
                </div>

                <pre className="p-4 rounded-md bg-[#09090b] border border-zinc-800 text-zinc-400 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[600px] shadow-sm">
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
