import React from 'react';
import { DataFreshness } from '../../types/sports';
import { Radio, Clock, Database } from 'lucide-react';

interface FreshnessBadgeProps {
  freshness: DataFreshness;
  lastSyncedAt?: string;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({ freshness, lastSyncedAt }) => {
  if (freshness === 'live') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
        <Radio className="w-3 h-3 mr-1 text-red-400" />
        LIVE
      </span>
    );
  }

  if (freshness === 'near-real-time') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
        <Clock className="w-3 h-3 mr-1 text-cyan-400" />
        Near-Real-Time
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-gray-400">
      <Database className="w-3 h-3 mr-1 text-gray-400" />
      Cached
    </span>
  );
};
