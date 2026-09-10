import React, { useState, useMemo } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useAnalyzeIncident, useUpdateIncident } from '../../hooks/useIncidents';
import { StatusBadge } from '../common/StatusBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import {
  X,
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
  Network,
  Activity,
  Terminal,
  Clock
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

  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-6xl bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
          
          {/* TOP INCIDENT HEADER */}
          <div className="flex-none p-5 border-b border-zinc-800 bg-[#09090b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={selectedIncident.severity} />
                <span className="font-mono text-zinc-300 font-semibold text-[13px]">
                  {selectedIncident.title}
                </span>
                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {selectedIncident.serviceName}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500">
                <span>ID: {selectedIncident.id}</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {new Date(selectedIncident.createdAt).toLocaleString()}
                </span>
                <StatusBadge status={selectedIncident.status} size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Run Diagnostics'}</span>
              </button>
              <div className="h-6 w-px bg-zinc-800"></div>
              <button
                onClick={() => setRcaDrawerOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN INVESTIGATION LAYOUT */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT COLUMN: PRIMARY INVESTIGATION */}
            <div className="flex-1 overflow-y-auto border-r border-zinc-800 p-8 space-y-10">
              
              {/* ROOT CAUSE SUMMARY */}
              <section className="space-y-4">
                <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  Primary Root Cause
                </h3>
                {rootCauseText ? (
                  <p className="text-zinc-200 text-lg leading-relaxed font-medium">
                    {rootCauseText}
                  </p>
                ) : (
                  <p className="text-zinc-600 text-sm italic font-mono">
                    No root cause diagnostic available. Run diagnostics to generate.
                  </p>
                )}
              </section>

              {/* EVIDENCE */}
              {evidenceList.length > 0 && (
                <section className="space-y-4 pt-6 border-t border-zinc-800/50">
                  <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Gathered Evidence
                  </h3>
                  <div className="space-y-2">
                    {evidenceList.map((item: string, idx: number) => {
                      // Attempt to parse out a timestamp if the AI generated one at the start of the string
                      const match = item.match(/^(\[.*?\]|\d{2}:\d{2}:\d{2})\s*(.*)/);
                      let timeStr = '';
                      let contentStr = item;
                      if (match) {
                        timeStr = match[1];
                        contentStr = match[2];
                      }

                      return (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 rounded-md bg-zinc-900 border border-zinc-800 font-mono text-xs">
                          {timeStr ? (
                            <span className="text-zinc-500 shrink-0 mt-0.5 w-20">{timeStr.replace(/[\[\]]/g, '')}</span>
                          ) : (
                            <span className="text-zinc-600 shrink-0 mt-0.5">{(idx + 1).toString().padStart(2, '0')}</span>
                          )}
                          <span className="text-zinc-300 leading-relaxed break-words">{contentStr}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* TIMELINE */}
              <section className="space-y-4 pt-6 border-t border-zinc-800/50">
                <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Incident Timeline
                </h3>
                <div className="relative border-l border-zinc-800 ml-3 space-y-6 pb-2">
                  <div className="relative pl-6">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-zinc-800 border-2 border-zinc-950"></div>
                    <div className="text-xs font-mono text-zinc-500 mb-0.5">T-0 (Detection)</div>
                    <div className="text-sm text-zinc-300">Incident declared by monitoring system</div>
                    <div className="mt-2 p-2 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-400">
                      {selectedIncident.alertMessage || 'Unknown alert trigger'}
                    </div>
                  </div>
                  {impactText && (
                    <div className="relative pl-6">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-rose-500/20 border-2 border-zinc-950"></div>
                      <div className="text-xs font-mono text-rose-500/50 mb-0.5">T+X (System Impact)</div>
                      <div className="text-sm text-zinc-300 leading-relaxed">{impactText}</div>
                    </div>
                  )}
                </div>
              </section>

              {/* RECOMMENDED ACTIONS */}
              {recommendedList.length > 0 && (
                <section className="space-y-4 pt-6 border-t border-zinc-800/50">
                  <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5" />
                    Recommended Actions
                  </h3>
                  <div className="space-y-3">
                    {recommendedList.map((action: string, idx: number) => {
                      // Simple heuristic to split immediate vs short-term
                      const isImmediate = idx === 0; 
                      return (
                        <div key={idx} className="p-4 rounded-md border border-zinc-800 bg-[#09090b] flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isImmediate ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                              {isImmediate ? 'IMMEDIATE' : 'SHORT-TERM'}
                            </span>
                          </div>
                          <p className="text-zinc-300 text-sm font-medium">{action}</p>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: CONTEXTUAL PANEL */}
            <div className="w-[380px] shrink-0 bg-zinc-950 overflow-y-auto flex flex-col border-l border-zinc-800">
              
              {/* AI CONFIDENCE */}
              <div className="p-6 border-b border-zinc-800">
                <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Cpu className="w-3.5 h-3.5" />
                  Diagnostic Confidence
                </h3>
                {hasConfidence ? (
                  <div className="space-y-2">
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-medium text-zinc-100 leading-none">{selectedIncident.confidenceScore}%</span>
                      <span className="text-xs text-zinc-500 mb-0.5">Confidence</span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4, 5].map((segment) => {
                        const threshold = segment * 20;
                        const filled = (selectedIncident.confidenceScore || 0) >= (threshold - 10);
                        return (
                          <div 
                            key={segment} 
                            className={`flex-1 rounded-sm ${filled ? 'bg-zinc-300' : 'bg-zinc-800'}`} 
                          />
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-zinc-500 pt-1 leading-relaxed">
                      Analysis supported by {evidenceList.length} evidence markers and historical correlation.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600 font-mono">Not analyzed</p>
                )}
              </div>

              {/* RESOLUTION LOG */}
              <div className="p-6 border-b border-zinc-800 flex-1">
                <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolution Log
                </h3>
                {selectedIncident.resolutionNotes ? (
                  <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs leading-relaxed mb-4">
                    {selectedIncident.resolutionNotes}
                  </div>
                ) : (
                  <p className="text-zinc-600 text-[11px] mb-4">No resolution notes recorded.</p>
                )}
                
                <form onSubmit={handleSaveResolution} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Log resolution details..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-zinc-200 text-xs font-mono focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 placeholder-zinc-600"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRcaDrawerOpen(false);
                        openEditModal(selectedIncident);
                      }}
                      className="px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-400 text-[11px] font-medium hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    >
                      Full Edit
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-[11px] transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isUpdating ? 'Saving...' : 'Resolve'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* TECHNICAL METADATA (COLLAPSIBLE) */}
              <div className="p-6">
                <button 
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="w-full flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-2 hover:text-zinc-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5" />
                    Technical Metadata
                  </span>
                  <span>{showRawJson ? '▲' : '▼'}</span>
                </button>
                
                {showRawJson && (
                  <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-end">
                      <button
                        onClick={handleCopyJson}
                        className="text-[10px] flex items-center gap-1 font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <Copy className="w-3 h-3" /> Copy JSON
                      </button>
                    </div>
                    <pre className="p-3 rounded-md bg-[#09090b] border border-zinc-800 text-zinc-400 font-mono text-[10px] leading-relaxed overflow-x-auto max-h-[300px]">
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
      </div>
    </div>
  );
};
