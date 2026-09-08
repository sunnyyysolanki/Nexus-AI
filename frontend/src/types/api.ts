export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Incident {
  id: string;
  title: string;
  serviceName: string;
  severity: SeverityLevel | string;
  status: IncidentStatus;
  alertMessage?: string;
  rootCauseSummary?: string;
  confidenceScore?: number;
  impactAnalysis?: string;
  rcaFullJson?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AlertPayload {
  serviceName: string;
  alertName: string;
  severity: SeverityLevel | string;
  message?: string;
  timestamp?: string;
  metadata?: string;
}

export interface UpdateIncidentRequest {
  status?: IncidentStatus;
  rootCauseSummary?: string;
  resolutionNotes?: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogEntity {
  id?: string;
  serviceName: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: string;
}

export interface MetricEntity {
  id?: string;
  serviceName: string;
  metricName: string;
  value: number;
  timestamp: string;
}

export interface RcaRequest {
  serviceName: string;
  incidentDescription: string;
  metrics?: string[];
  logs?: string[];
}

export interface RcaResponse {
  rootCauseSummary: string;
  confidenceScore: number;
  impactAnalysis: string;
  recommendedFixes: string[];
}

export interface DashboardStats {
  totalIncidents: number;
  openIncidents: number;
  investigatingIncidents: number;
  resolvedIncidents: number;
  criticalIncidents: number;
}
