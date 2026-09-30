import React from 'react';
import Link from 'next/link';
import { Team } from '../../types/sports';
import { FollowButton } from './FollowButton';
import { MapPin, Users, ArrowUpRight } from 'lucide-react';

export const TeamCard: React.FC<{ team: Team }> = ({ team }) => {
  return (
    <div className="overflow-hidden rounded-2xl glass-card flex flex-col justify-between group">
      {/* Team Banner / Badge Area */}
      <div className="relative h-28 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-4 flex items-center justify-between">
        {team.bannerUrl && (
          <img
            src={team.bannerUrl}
            alt={team.name}
            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="relative z-10 flex items-center space-x-3">
          {team.badgeUrl ? (
            <img
              src={team.badgeUrl}
              alt={team.name}
              className="w-12 h-12 object-contain drop-shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-cyan-400 text-lg">
              {team.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
              {team.name}
            </h4>
            <p className="text-xs text-cyan-400 font-medium">{team.sport}</p>
          </div>
        </div>

        <div className="relative z-10">
          <FollowButton type="team" id={team.id} name={team.name} initialFollowed={team.isFavorite} size="sm" />
        </div>
      </div>

      {/* Team Details & Form */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate max-w-[140px]">{team.stadium || team.country || 'Official Arena'}</span>
          </div>
          {team.leagueName && <span className="text-gray-400 truncate max-w-[120px]">{team.leagueName}</span>}
        </div>

        {/* Recent Form Badges (e.g. W W D L W) */}
        {team.stats?.form && (
          <div className="flex items-center space-x-1.5 pt-1">
            <span className="text-[11px] text-gray-400 mr-1">Recent Form:</span>
            {team.stats.form.map((res, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  res === 'W'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : res === 'D'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {res}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/teams/${team.id}`}
          className="flex items-center justify-between w-full pt-2 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors border-t border-slate-800"
        >
          <span>View Team &amp; Squad</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
