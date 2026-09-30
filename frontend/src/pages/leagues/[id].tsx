import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../services/api';
import { League, Match } from '../../types/sports';
import { StandingsTable } from '../../components/sports/StandingsTable';
import { MatchCard } from '../../components/sports/MatchCard';
import { FollowButton } from '../../components/sports/FollowButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { Globe, Calendar, Trophy } from 'lucide-react';

export default function LeagueDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [league, setLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadLeague() {
      setLoading(true);
      setError(null);
      try {
        const [leagueRes, matchesRes]: any = await Promise.all([
          api.get(`/sports/leagues/${id}`),
          api.get(`/sports/matches?leagueId=${id}`),
        ]);

        setLeague(leagueRes || null);
        setMatches(matchesRes || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadLeague();
  }, [id]);

  return (
    <AppLayout
      title={`${league?.name || 'League'} Standings & Fixtures | AI Sports Tracker`}
      description={`Real-time table standings, upcoming fixtures, and results for ${league?.name || 'this competition'}.`}
    >
      {error && <ErrorBanner error={error} className="mb-6" />}

      {loading || !league ? (
        <LoadingSpinner text="Fetching league standings and telemetry..." />
      ) : (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-center space-x-4">
              {league.badgeUrl && (
                <img src={league.badgeUrl} alt={league.name} className="w-16 h-16 object-contain drop-shadow-lg" />
              )}
              <div>
                <div className="flex items-center space-x-2 text-xs text-gray-400 mb-0.5">
                  <Link href="/leagues" className="hover:text-cyan-400">Leagues</Link>
                  <span>/</span>
                  <span className="text-cyan-400 font-semibold">{league.sport}</span>
                </div>
                <h1 className="text-2xl font-black text-white">{league.name}</h1>
                <p className="text-xs text-gray-400 mt-1">{league.country} &bull; Season {league.currentSeason}</p>
              </div>
            </div>

            <FollowButton type="league" id={league.id} name={league.name} initialFollowed={league.isFavorite} />
          </div>

          {/* Standings Table */}
          {league.standings && league.standings.length > 0 && (
            <StandingsTable standings={league.standings} title={`${league.name} Standings`} />
          )}

          {/* Fixtures & Results */}
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Fixtures &amp; Recent Results</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
