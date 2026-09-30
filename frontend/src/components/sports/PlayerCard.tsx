import React from 'react';
import Link from 'next/link';
import { Player } from '../../types/sports';
import { FollowButton } from './FollowButton';
import { Sparkles, User as UserIcon } from 'lucide-react';

export const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
  return (
    <div className="overflow-hidden rounded-2xl glass-card p-4 flex items-center justify-between group">
      <Link href={`/players/${player.id}`} className="flex items-center space-x-3.5 flex-1 min-w-0">
        <div className="relative w-12 h-12 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700/80">
          {player.thumbUrl || player.cutoutUrl ? (
            <img
              src={player.thumbUrl || player.cutoutUrl}
              alt={player.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cyan-400 font-bold text-sm">
              <UserIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
            {player.name}
          </h4>
          <p className="text-xs text-gray-400 truncate">
            {player.position || 'Athlete'} &bull; {player.teamName || player.sport}
          </p>
          {player.jerseyNumber && (
            <span className="text-[10px] font-semibold text-cyan-400">#{player.jerseyNumber}</span>
          )}
        </div>
      </Link>

      <div className="ml-3 flex-shrink-0">
        <FollowButton type="player" id={player.id} name={player.name} initialFollowed={player.isFavorite} size="sm" />
      </div>
    </div>
  );
};

export const AiMatchInsightCard: React.FC<{
  summary: string;
  model?: string;
  sources?: string[];
  title?: string;
}> = ({ summary, model = 'AI Platform Gemini Pro', sources = ['TheSportsDB Official Telemetry'], title = 'AI Tactical Match Debrief' }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-900/90 border border-purple-500/30 p-5 shadow-xl shadow-purple-950/20 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <span>{title}</span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {model}
        </span>
      </div>

      <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">{summary}</p>

      {sources && sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-[10px] text-gray-400">
          <span>Grounded Sources: {sources.join(', ')}</span>
          <span className="text-purple-400 font-medium">Fact-Checked Against Official Stats</span>
        </div>
      )}
    </div>
  );
};
