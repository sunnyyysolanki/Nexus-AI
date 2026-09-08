import React from 'react';

interface SeverityBadgeProps {
  severity: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const normalized = severity?.toUpperCase() || 'INFO';

  const getStyle = () => {
    switch (normalized) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-800/60 shadow-glow-rose';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-400 border-orange-800/60';
      case 'MEDIUM':
        return 'bg-yellow-950/80 text-yellow-400 border-yellow-800/60';
      case 'LOW':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/60';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded border text-[11px] font-semibold tracking-wider uppercase font-mono ${getStyle()}`}
    >
      {normalized}
    </span>
  );
};
