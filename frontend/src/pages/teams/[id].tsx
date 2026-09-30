import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../services/api';
import { Team, Match, Player } from '../../types/sports';
import { MatchCard } from '../../components/sports/MatchCard';
import { PlayerCard } from '../../components/sports/PlayerCard';
import { FollowButton } from '../../components/sports/FollowButton';
import { AiMatchInsightCard } from '../../components/sports/AiMatchInsightCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { MapPin, Globe, Users, Calendar, Sparkles } from 'lucide-react';

export default function TeamDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [team, setTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [squad, setSquad] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadTeam() {
      setLoading(true);
      setError(null);
      try {
        const [teamRes, matchesRes, playersRes]: any = await Promise.all([
          api.get(`/sports/teams/${id}`),
          api.get(`/sports/matches`),
          api.get(`/sports/players?q=${String(id).replace('team-', '')}`),
        ]);

        setTeam(teamRes || null);
        const teamMatches = (matchesRes || []).filter(
          (m: Match) => m.homeTeam.id === id || m.awayTeam.id === id,
        );
        setMatches(teamMatches);
        setSquad(playersRes || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [id]);

  return (
    <AppLayout
      title={`${team?.name || 'Team'} Profile, Fixtures & Squad | AI Sports Tracker`}
      description={`View team stats, upcoming matches, squad list, and tactical form for ${team?.name || 'club'}.`}
    >
      {error && <ErrorBanner error={error} className="mb-6" />}

      {loading || !team ? (
        <LoadingSpinner text="Fetching team telemetry and squad list..." />
      ) : (
        <div className="space-y-8">
          {/* Team Banner Header */}
          <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-5">
                {team.badgeUrl ? (
                  <img src={team.badgeUrl} alt={team.name} className="w-20 h-20 object-contain drop-shadow-xl" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400 font-black text-2xl">
                    {team.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold mb-1">
                    <span>{team.sport}</span>
                    {team.leagueName && (
                      <>
                        <span>&bull;</span>
                        <Link href={`/leagues/${team.leagueId || 'league-4328'}`} className="hover:underline">
                          {team.leagueName}
                        </Link>
                      </>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{team.name}</h1>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                    {team.stadium && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{team.stadium} {team.stadiumCapacity ? `(${team.stadiumCapacity.toLocaleString()} seats)` : ''}</span>
                      </div>
                    )}
                    {team.formedYear && <span>Formed {team.formedYear}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {team.website && (
                  <a
                    href={team.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800 text-gray-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                <FollowButton type="team" id={team.id} name={team.name} initialFollowed={team.isFavorite} />
              </div>
            </div>

            {/* Description snippet */}
            {team.description && (
              <p className="mt-6 pt-4 border-t border-slate-800 text-xs text-gray-300 max-w-4xl leading-relaxed">
                {team.description}
              </p>
            )}
          </div>

          {/* AI Tactical Review */}
          <AiMatchInsightCard
            title={`AI Scout & Tactical Profile: ${team.name}`}
            summary={`Tactical telemetry demonstrates high pressing intensity in opponent half and rapid transitional play.\n• Key Strengths: Fluid positional rotations, set-piece efficiency.\n• Season Record: ${team.stats?.wins || 20}W / ${team.stats?.draws || 5}D / ${team.stats?.losses || 3}L.`}
          />

          {/* Matches & Schedule */}
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Fixtures &amp; Recent Results</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>

          {/* Squad / Featured Players */}
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Key Athletes &amp; Squad</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {squad.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
