import React from 'react';
import Link from 'next/link';
import { Match } from '../../types/sports';
import { Radio, ChevronRight } from 'lucide-react';

export const LiveTicker: React.FC<{ matches: Match[] }> = ({ matches }) => {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="w-full mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900/80 to-slate-900/80 border border-red-500/20 backdrop-blur-md p-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">Live Match Center</span>
        </div>
        <Link href="/sports" className="text-[11px] text-gray-400 hover:text-cyan-400 flex items-center transition-colors">
          <span>View All</span>
          <ChevronRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>

      <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none">
        {matches.map((match) => (
          <Link
            key={match.id}
            href={`/matches/${match.id}`}
            className="flex-shrink-0 flex items-center space-x-3 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer group min-w-[240px]"
          >
            <div className="flex flex-col items-center justify-center pr-2 border-r border-slate-800">
              <span className="text-[10px] font-bold text-red-400 animate-pulse">{match.minute || 'LIVE'}</span>
              <span className="text-[9px] text-gray-400 uppercase">{match.sport}</span>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white truncate max-w-[110px]">{match.homeTeam.name}</span>
                <span className="font-bold text-cyan-400">{match.homeTeam.score ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white truncate max-w-[110px]">{match.awayTeam.name}</span>
                <span className="font-bold text-cyan-400">{match.awayTeam.score ?? 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
