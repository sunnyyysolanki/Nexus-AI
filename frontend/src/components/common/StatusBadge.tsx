import React from 'react';
import { IncidentStatus } from '../../types/api';

interface StatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'OPEN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          OPEN
        </span>
      );
    case 'INVESTIGATING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
          INVESTIGATING
        </span>
      );
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          RESOLVED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
          {status}
        </span>
      );
  }
};
