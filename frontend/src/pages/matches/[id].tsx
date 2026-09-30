import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../services/api';
import { Match } from '../../types/sports';
import { FreshnessBadge } from '../../components/common/FreshnessBadge';
import { AiMatchInsightCard } from '../../components/sports/AiMatchInsightCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { useSportsStream } from '../../hooks/useSportsStream';
import { MapPin, User, Clock, Sparkles, Loader2, Trophy, Activity } from 'lucide-react';

export default function MatchDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [match, setMatch] = useState<Match | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // SSE Real-time updates for this specific match
  useSportsStream({
    onMatchUpdate: (updatedMatch) => {
      if (updatedMatch.id === id) {
        setMatch(updatedMatch);
      }
    },
  });

  useEffect(() => {
    if (!id) return;

    async function loadMatch() {
      setLoading(true);
      setError(null);
      try {
        const res: any = await api.get(`/sports/matches/${id}`);
        setMatch(res || null);
        if (res?.aiSummary) {
          setAiSummary(res.aiSummary);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [id]);

  const handleGenerateAiDebrief = async () => {
    if (!id) return;
    setGeneratingAi(true);
    try {
      const res: any = await api.get(`/ai/match-summary/${id}`);
      if (res?.summary) {
        setAiSummary(res.summary);
      }
    } catch (e: any) {
      console.error('AI debrief generation failed:', e);
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <AppLayout
      title={`${match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : 'Match Center'} | AI Sports Tracker`}
      description="Live match scoreline, telemetry, minute events timeline, and AI tactical debrief."
    >
      {error && <ErrorBanner error={error} className="mb-6" />}

      {loading || !match ? (
        <LoadingSpinner text="Connecting to match telemetry feed..." />
      ) : (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Match Header Scoreboard */}
          <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-800 p-6 sm:p-10 shadow-2xl">
            {/* Top League Meta & Freshness */}
            <div className="flex items-center justify-between mb-8 text-xs">
              <div className="flex items-center space-x-2">
                <Link href={`/leagues/${match.leagueId}`} className="font-bold text-cyan-400 hover:underline">
                  {match.leagueName}
                </Link>
                {match.round && <span className="text-gray-400">&bull; {match.round}</span>}
              </div>
              <FreshnessBadge freshness={match.freshness} />
            </div>

            {/* Scoreboard Teams Grid */}
            <div className="grid grid-cols-3 items-center text-center gap-4">
              {/* Home Team */}
              <div className="flex flex-col items-center space-y-3">
                <Link href={`/teams/${match.homeTeam.id}`} className="hover:opacity-90 transition-opacity">
                  {match.homeTeam.badgeUrl ? (
                    <img src={match.homeTeam.badgeUrl} alt={match.homeTeam.name} className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-xl" />
                  ) : (
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-black text-cyan-400">
                      {match.homeTeam.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </Link>
                <h2 className="text-sm sm:text-lg font-black text-white">{match.homeTeam.name}</h2>
              </div>

              {/* Score & Status Center */}
              <div className="flex flex-col items-center">
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-gray-300 mb-3">
                  {match.status === 'LIVE' ? (
                    <span className="text-red-400 animate-pulse font-bold">{match.minute || 'LIVE'}</span>
                  ) : match.status === 'FINISHED' ? (
                    <span className="text-emerald-400">FULL TIME</span>
                  ) : (
                    <span>SCHEDULED</span>
                  )}
                </div>

                <div className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center space-x-3">
                  <span className="text-cyan-400">{match.homeTeam.score ?? '-'}</span>
                  <span className="text-gray-600">:</span>
                  <span className="text-cyan-400">{match.awayTeam.score ?? '-'}</span>
                </div>

                {match.homeTeam.subScores && (
                  <div className="mt-2 text-[11px] text-gray-400 flex items-center space-x-2">
                    <span>{match.homeTeam.subScores.join(' ')}</span>
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center space-y-3">
                <Link href={`/teams/${match.awayTeam.id}`} className="hover:opacity-90 transition-opacity">
                  {match.awayTeam.badgeUrl ? (
                    <img src={match.awayTeam.badgeUrl} alt={match.awayTeam.name} className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-xl" />
                  ) : (
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-black text-cyan-400">
                      {match.awayTeam.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </Link>
                <h2 className="text-sm sm:text-lg font-black text-white">{match.awayTeam.name}</h2>
              </div>
            </div>

            {/* Venue & Referee Bottom Bar */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
              {match.venue && (
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{match.venue}</span>
                </div>
              )}
              {match.referee && (
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Referee: {match.referee}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Tactical Debrief Action Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI Tactical Intelligence</span>
              </h3>

              <button
                onClick={handleGenerateAiDebrief}
                disabled={generatingAi}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generatingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{generatingAi ? 'Generating Analysis...' : 'Refresh AI Debrief'}</span>
              </button>
            </div>

            {aiSummary ? (
              <AiMatchInsightCard summary={aiSummary} title="AI Match Debrief & Key Highlights" />
            ) : (
              <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-center text-xs text-purple-200">
                Click &ldquo;Refresh AI Debrief&rdquo; to generate grounded LLM analysis using verified telemetry.
              </div>
            )}
          </div>

          {/* Match Events Timeline */}
          {match.events && match.events.length > 0 && (
            <div className="rounded-2xl glass-panel p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Match Events Timeline</span>
              </h3>

              <div className="space-y-3">
                {match.events.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center space-x-3">
                      <span className="w-9 h-7 rounded-lg bg-slate-800 font-bold text-xs text-cyan-400 flex items-center justify-center">
                        {ev.minute}&apos;
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">{ev.player}</p>
                        <p className="text-[11px] text-gray-400">
                          {ev.type.replace('_', ' ').toUpperCase()} {ev.assist ? `&bull; Assist: ${ev.assist}` : ''} {ev.detail ? `&bull; ${ev.detail}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 capitalize">{ev.team} Team</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match Telemetry Stats Comparison */}
          {match.stats && (
            <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Match Telemetry Comparison</span>
              </h3>

              <div className="space-y-4 text-xs">
                {match.stats.possession && (
                  <div>
                    <div className="flex justify-between text-gray-300 font-semibold mb-1">
                      <span>{match.stats.possession.home}%</span>
                      <span>Possession</span>
                      <span>{match.stats.possession.away}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div className="bg-cyan-400 h-full" style={{ width: `${match.stats.possession.home}%` }} />
                      <div className="bg-purple-500 h-full" style={{ width: `${match.stats.possession.away}%` }} />
                    </div>
                  </div>
                )}

                {match.stats.shotsOnTarget && (
                  <div>
                    <div className="flex justify-between text-gray-300 font-semibold mb-1">
                      <span>{match.stats.shotsOnTarget.home}</span>
                      <span>Shots on Target</span>
                      <span>{match.stats.shotsOnTarget.away}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div className="bg-cyan-400 h-full" style={{ width: `${(match.stats.shotsOnTarget.home / (match.stats.shotsOnTarget.home + match.stats.shotsOnTarget.away || 1)) * 100}%` }} />
                      <div className="bg-purple-500 h-full" style={{ width: `${(match.stats.shotsOnTarget.away / (match.stats.shotsOnTarget.home + match.stats.shotsOnTarget.away || 1)) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
