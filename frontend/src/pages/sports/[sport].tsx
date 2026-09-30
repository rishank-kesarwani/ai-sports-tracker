import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../services/api';
import { Match, League, Team } from '../../types/sports';
import { MatchCard } from '../../components/sports/MatchCard';
import { TeamCard } from '../../components/sports/TeamCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { Trophy, Calendar, Flame, Users, ArrowRight } from 'lucide-react';

export default function SportDetailPage() {
  const router = useRouter();
  const { sport } = router.query;

  const sportName = sport ? sport.toString().charAt(0).toUpperCase() + sport.toString().slice(1) : 'Soccer';

  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sport) return;

    async function loadSportData() {
      setLoading(true);
      setError(null);
      try {
        const [matchesRes, leaguesRes, teamsRes]: any = await Promise.all([
          api.get(`/sports/matches?sport=${sportName}`),
          api.get(`/sports/leagues?sport=${sportName}`),
          api.get(`/sports/teams?sport=${sportName}`),
        ]);

        setMatches(matchesRes || []);
        setLeagues(leaguesRes || []);
        setTeams(teamsRes || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadSportData();
  }, [sport, sportName]);

  const liveMatches = matches.filter((m) => m.status === 'LIVE');
  const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED');
  const recentMatches = matches.filter((m) => m.status === 'FINISHED');

  return (
    <AppLayout
      title={`${sportName} Live Scores & Fixtures | AI Sports Tracker`}
      description={`Real-time ${sportName} scores, tournament standings, team form, and AI tactical insights.`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <Link href="/sports" className="hover:text-cyan-400">Sports</Link>
            <span>/</span>
            <span className="text-white font-semibold">{sportName}</span>
          </div>
          <h1 className="text-2xl font-black text-white">{sportName} Hub</h1>
        </div>
      </div>

      {error && <ErrorBanner error={error} />}

      {loading ? (
        <LoadingSpinner text={`Loading ${sportName} fixtures and standings...`} />
      ) : (
        <div className="space-y-8">
          {/* Live Matches if any */}
          {liveMatches.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-base font-bold">Live {sportName} Matches</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {liveMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Fixtures */}
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Upcoming {sportName} Fixtures</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((m) => <MatchCard key={m.id} match={m} />)
              ) : (
                <div className="col-span-full p-6 rounded-xl bg-slate-900/50 text-center text-xs text-gray-400">
                  No upcoming fixtures listed currently.
                </div>
              )}
            </div>
          </div>

          {/* Top Teams in this Sport */}
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Featured {sportName} Teams</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teams.map((t) => (
                <TeamCard key={t.id} team={t} />
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
