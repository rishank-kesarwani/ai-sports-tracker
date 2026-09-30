import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../services/api';
import { Match, League } from '../../types/sports';
import { MatchCard } from '../../components/sports/MatchCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowRight, Trophy, Activity, Globe } from 'lucide-react';

export default function SportsHubPage() {
  const [sportsList, setSportsList] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSports() {
      try {
        const [sportsRes, liveRes, leaguesRes]: any = await Promise.all([
          api.get('/sports'),
          api.get('/sports/matches/live'),
          api.get('/sports/leagues'),
        ]);
        setSportsList(sportsRes || []);
        setLiveMatches(liveRes || []);
        setLeagues(leaguesRes || []);
      } catch (e) {
        console.error('Failed to load sports hub:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSports();
  }, []);

  return (
    <AppLayout
      title="Sports Hub | Football, Cricket, Basketball & Tennis"
      description="Select sports categories, browse active tournaments, and view real-time match fixtures."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">Sports Directory</h1>
        <p className="text-xs text-gray-400 mt-1">
          Explore multi-sport coverage with unified normalized telemetry and near-real-time streaming.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading sports categories..." />
      ) : (
        <div className="space-y-8">
          {/* Sports Categories Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sportsList.map((sport) => (
              <Link
                key={sport.id}
                href={`/sports/${sport.id.toLowerCase()}`}
                className="group relative overflow-hidden rounded-2xl glass-card p-5 border border-slate-800 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{sport.id === 'Soccer' ? '⚽' : sport.id === 'Cricket' ? '🏏' : sport.id === 'Basketball' ? '🏀' : '🎾'}</span>
                  <div className="p-2 rounded-xl bg-slate-800 text-gray-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">{sport.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{sport.activeLeaguesCount} Top Competitions</p>
              </Link>
            ))}
          </div>

          {/* Active Live Matches Across Sports */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-lg font-bold text-white">Live Matches Across All Sports</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>

          {/* Major Competitions */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Featured Leagues &amp; Tournaments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/leagues/${league.id}`}
                  className="flex items-center justify-between p-4 rounded-xl glass-card hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    {league.badgeUrl && <img src={league.badgeUrl} alt={league.name} className="w-8 h-8 object-contain" />}
                    <div>
                      <h4 className="text-xs font-bold text-white">{league.name}</h4>
                      <p className="text-[10px] text-cyan-400">{league.sport} &bull; {league.country || 'Global'}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
