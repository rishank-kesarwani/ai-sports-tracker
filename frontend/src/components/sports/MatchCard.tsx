import React from 'react';
import Link from 'next/link';
import { Match } from '../../types/sports';
import { FreshnessBadge } from '../common/FreshnessBadge';
import { format } from 'date-fns';
import { MapPin, Sparkles, Trophy } from 'lucide-react';

export const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  let formattedDate = 'Upcoming';
  try {
    formattedDate = format(new Date(match.startTime), 'EEE, MMM d • h:mm a');
  } catch (e) {}

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-5 group flex flex-col justify-between">
      {/* Top Meta Header */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-cyan-400">{match.leagueName}</span>
          {match.round && <span className="text-gray-400">&bull; {match.round}</span>}
        </div>
        <FreshnessBadge freshness={match.freshness} />
      </div>

      {/* Teams & Scores Row */}
      <Link href={`/matches/${match.id}`} className="space-y-3 block hover:opacity-95 transition-opacity">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {match.homeTeam.badgeUrl ? (
              <img
                src={match.homeTeam.badgeUrl}
                alt={match.homeTeam.name}
                className="w-7 h-7 object-contain rounded-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-300">
                {match.homeTeam.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-white text-sm tracking-tight">{match.homeTeam.name}</span>
          </div>
          <span className="text-lg font-black text-cyan-400">
            {match.homeTeam.score !== undefined ? match.homeTeam.score : '-'}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {match.awayTeam.badgeUrl ? (
              <img
                src={match.awayTeam.badgeUrl}
                alt={match.awayTeam.name}
                className="w-7 h-7 object-contain rounded-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-300">
                {match.awayTeam.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-white text-sm tracking-tight">{match.awayTeam.name}</span>
          </div>
          <span className="text-lg font-black text-cyan-400">
            {match.awayTeam.score !== undefined ? match.awayTeam.score : '-'}
          </span>
        </div>
      </Link>

      {/* Match Status / Venue Info */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1.5">
          {isLive ? (
            <span className="font-bold text-red-400 animate-pulse">{match.minute || 'Live in Progress'}</span>
          ) : isFinished ? (
            <span className="text-emerald-400 font-semibold">Full Time</span>
          ) : (
            <span>{formattedDate}</span>
          )}
        </div>

        {match.venue && (
          <div className="flex items-center text-[11px] text-gray-400 truncate max-w-[150px]">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{match.venue}</span>
          </div>
        )}
      </div>

      {/* AI Intelligence Snippet */}
      {match.aiSummary && (
        <div className="mt-3 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200 flex items-start space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2">{match.aiSummary}</p>
        </div>
      )}
    </div>
  );
};
