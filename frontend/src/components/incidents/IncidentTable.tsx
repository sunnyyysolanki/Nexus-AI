import React, { useState } from 'react';
import { useIncidents, useAnalyzeIncident } from '../../hooks/useIncidents';
import { StatusBadge } from '../common/StatusBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { useUIStore } from '../../store/useUIStore';
import { IncidentStatus } from '../../types/api';
import { Search, Filter, Sparkles, Edit3, Eye, AlertCircle, RefreshCw } from 'lucide-react';

export const IncidentTable: React.FC = () => {
  const { data: incidents = [], isLoading, isFetching, refetch } = useIncidents();
  const { mutate: analyzeIncident, isPending: isAnalyzing } = useAnalyzeIncident();
  const { setSelectedIncident, setRcaDrawerOpen, openEditModal } = useUIStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Filtered incidents
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title?.toLowerCase().includes(search.toLowerCase()) ||
      incident.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
      incident.id?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || incident.status === statusFilter;
    const matchesSeverity =
      severityFilter === 'ALL' || incident.severity?.toUpperCase() === severityFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleTriggerAnalysis = (e: React.MouseEvent, incidentId: string) => {
    e.stopPropagation();
    setAnalyzingId(incidentId);
    analyzeIncident(incidentId, {
      onSettled: () => setAnalyzingId(null),
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-dark-border">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Incident Command</h2>
          <p className="text-xs text-zinc-500 mt-1">High-density stream, status management, and AI analysis</p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-dark-surface border border-dark-border text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-zinc-400' : ''}`} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-md bg-dark-surface border border-dark-border flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, service, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-md px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          {/* Severity Select */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-md px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="rounded-lg bg-dark-surface border border-dark-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] font-medium text-zinc-500 border-b border-dark-border">
              <tr>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Incident Title</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">AI Score</th>
                <th className="px-4 py-3 font-medium">Created At</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    Fetching incidents from API...
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No matching incidents found.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  const isCurrentAnalyzing = analyzingId === incident.id;
                  const hasRca = incident.confidenceScore !== null && incident.confidenceScore !== undefined;

                  return (
                    <tr
                      key={incident.id}
                      onClick={() => {
                        setSelectedIncident(incident);
                        setRcaDrawerOpen(true);
                      }}
                      className="hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={incident.status} size="sm" />
                      </td>

                      {/* Title & ID */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-100 group-hover:text-zinc-300 transition-colors line-clamp-1">
                          {incident.title}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5">ID: {incident.id}</div>
                      </td>

                      {/* Service */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-zinc-400">
                        {incident.serviceName}
                      </td>

                      {/* Severity */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <SeverityBadge severity={incident.severity} />
                      </td>

                      {/* AI RCA Score */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono">
                        {hasRca ? (
                          <span className="inline-flex items-center gap-1.5 text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-sm border border-zinc-700 text-[11px]">
                            <Sparkles className="w-3 h-3 text-zinc-400" />
                            {incident.confidenceScore}%
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">N/A</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-zinc-500">
                        {new Date(incident.createdAt).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Trigger AI RCA Button */}
                          <button
                            onClick={(e) => handleTriggerAnalysis(e, incident.id)}
                            disabled={isCurrentAnalyzing}
                            className="px-2 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 text-zinc-300 text-[11px] font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            title="Trigger AI Root Cause Analysis"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isCurrentAnalyzing ? 'animate-spin' : ''}`} />
                            <span className="hidden xl:inline">{isCurrentAnalyzing ? 'Analyzing' : 'AI RCA'}</span>
                          </button>

                          {/* Edit Status Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(incident);
                            }}
                            className="p-1.5 rounded bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                            title="Edit Status & Resolution Notes"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* View RCA Drawer Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIncident(incident);
                              setRcaDrawerOpen(true);
                            }}
                            className="p-1.5 rounded bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                            title="View Incident Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
