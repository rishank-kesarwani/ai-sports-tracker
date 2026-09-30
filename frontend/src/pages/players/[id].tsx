import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../services/api';
import { Player } from '../../types/sports';
import { FollowButton } from '../../components/sports/FollowButton';
import { AiMatchInsightCard } from '../../components/sports/AiMatchInsightCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { User, Activity, Sparkles, Trophy } from 'lucide-react';

export default function PlayerDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadPlayer() {
      setLoading(true);
      setError(null);
      try {
        const res: any = await api.get(`/sports/players/${id}`);
        setPlayer(res || null);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadPlayer();
  }, [id]);

  return (
    <AppLayout
      title={`${player?.name || 'Player'} Profile & Statistics | AI Sports Tracker`}
      description={`Career statistics, tactical performance metrics, and scout report for ${player?.name || 'athlete'}.`}
    >
      {error && <ErrorBanner error={error} className="mb-6" />}

      {loading || !player ? (
        <LoadingSpinner text="Loading athlete profile..." />
      ) : (
        <div className="space-y-8">
          {/* Athlete Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="relative w-20 h-20 rounded-2xl bg-slate-800 overflow-hidden border border-slate-700">
                {player.thumbUrl || player.cutoutUrl ? (
                  <img src={player.thumbUrl || player.cutoutUrl} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cyan-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold mb-1">
                  <span>{player.sport}</span>
                  {player.teamName && (
                    <>
                      <span>&bull;</span>
                      <Link href={`/teams/${player.teamId || 'team-133604'}`} className="hover:underline">
                        {player.teamName}
                      </Link>
                    </>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{player.name}</h1>
                <p className="text-xs text-gray-400 mt-1">
                  {player.position || 'Athlete'} &bull; {player.nationality || 'International'}
                  {player.jerseyNumber ? ` &bull; #${player.jerseyNumber}` : ''}
                </p>
              </div>
            </div>

            <FollowButton type="player" id={player.id} name={player.name} initialFollowed={player.isFavorite} />
          </div>

          {/* AI Scout Telemetry Card */}
          <AiMatchInsightCard
            title={`AI Scout Assessment: ${player.name}`}
            summary={`Statistical Profile:\n• Technical Excellence: Elite progressive carries and decisive box penetration.\n• Tactical Versatility: Proven across high-leverage matches with consistent goal contribution rate.`}
          />

          {/* Key Metric Cards */}
          {player.stats && (
            <div>
              <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Season Telemetry &amp; Metrics</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(player.stats).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-2xl glass-card border border-slate-800">
                    <p className="text-xs font-medium text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-xl font-black text-cyan-400 mt-1">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {player.description && (
            <div className="p-6 rounded-2xl glass-card border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2">Biography &amp; Career Highlights</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{player.description}</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
