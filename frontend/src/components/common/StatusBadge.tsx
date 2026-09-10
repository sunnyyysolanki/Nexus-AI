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
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-500 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          OPEN
        </span>
      );
    case 'INVESTIGATING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-500 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          INVESTIGATING
        </span>
      );
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          RESOLVED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300">
          {status}
        </span>
      );
  }
};
