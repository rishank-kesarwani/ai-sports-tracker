import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '../components/layout/AppLayout';
import { api } from '../services/api';
import { Match, League, Team } from '../types/sports';
import { MatchCard } from '../components/sports/MatchCard';
import { LiveTicker } from '../components/sports/LiveTicker';
import { StandingsTable } from '../components/sports/StandingsTable';
import { AiMatchInsightCard } from '../components/sports/AiMatchInsightCard';
import { TeamCard } from '../components/sports/TeamCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { useAuth } from '../context/AuthContext';
import { useSportsStream } from '../hooks/useSportsStream';
import { Sparkles, Trophy, Flame, Calendar, ArrowRight, Zap } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'recent'>('live');

  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [premierLeague, setPremierLeague] = useState<League | null>(null);
  const [featuredTeams, setFeaturedTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // SSE Live streaming callback
  useSportsStream({
    onMatchUpdate: (updatedMatch) => {
      setLiveMatches((prev) => {
        const idx = prev.findIndex((m) => m.id === updatedMatch.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = updatedMatch;
          return updated;
        }
        return [updatedMatch, ...prev];
      });
    },
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [liveRes, upcomingRes, recentRes, leagueRes, teamsRes]: any = await Promise.all([
        api.get('/sports/matches/live'),
        api.get('/sports/matches/upcoming?limit=6'),
        api.get('/sports/matches/recent?limit=6'),
        api.get('/sports/leagues/league-4328'),
        api.get('/sports/teams?limit=4'),
      ]);

      setLiveMatches(liveRes || []);
      setUpcomingMatches(upcomingRes || []);
      setRecentMatches(recentRes || []);
      setPremierLeague(leagueRes || null);
      setFeaturedTeams(teamsRes || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sports = ['All', 'Soccer', 'Cricket', 'Basketball', 'Tennis'];

  const filterMatches = (matches: Match[]) => {
    if (selectedSport === 'All') return matches;
    return matches.filter((m) => m.sport.toLowerCase() === selectedSport.toLowerCase());
  };

  const displayedMatches =
    activeTab === 'live'
      ? filterMatches(liveMatches)
      : activeTab === 'upcoming'
      ? filterMatches(upcomingMatches)
      : filterMatches(recentMatches);

  return (
    <AppLayout
      title="AI Sports Tracker | Real-Time Live Scores & Tactical AI Analysis"
      description="Track live matches with sub-second SSE updates, AI tactical breakdowns, and personalized team feeds across Football, Cricket, Basketball, and Tennis."
    >
      {/* Live Match Ticker */}
      <LiveTicker matches={liveMatches} />

      {/* Hero Banner with Tactical AI Highlight */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/70 border border-[#1e293b] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-4">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span>Real-Time SSE &bull; Shared AI Platform &bull; Redis Ingestion</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Intelligent Sports Telemetry &amp; AI Tactical Debriefs
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-300 leading-relaxed">
            Live match tracking, minute-by-minute tactical momentum, and grounded LLM summaries across premier global leagues.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/ai-assistant"
              className="flex items-center px-4 py-2.5 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Ask AI Sports Analyst</span>
            </Link>

            <Link
              href="/sports"
              className="flex items-center px-4 py-2.5 rounded-xl font-semibold text-xs text-gray-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:text-white transition-all"
            >
              <span>Explore All Sports</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>

      {error && <ErrorBanner error={error} onRetry={fetchData} className="mb-6" />}

      {/* Sport Category Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedSport === sport
                  ? 'bg-cyan-400 text-black shadow-md shadow-cyan-500/20 font-bold'
                  : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Tab Controls (Live / Upcoming / Recent) */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Live ({liveMatches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'upcoming' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Upcoming</span>
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'recent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Results</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching live telemetry and normalized fixtures..." />
      ) : (
        <div className="space-y-8">
          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedMatches.length > 0 ? (
              displayedMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <div className="col-span-full p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-gray-400">
                No {activeTab} matches currently listed for {selectedSport}. Check other sports categories or scheduled fixtures.
              </div>
            )}
          </div>

          {/* AI Tactical Feature & Standings Split Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <AiMatchInsightCard
                title="Featured AI Match Intelligence"
                summary={
                  "Tactical breakdown of Arsenal vs Chelsea:\n• Arsenal registered 58% possession with high counter-press recovery.\n• Kai Havertz created 3 big chances with clinical link-up with Saka.\n• Chelsea relied on direct wing counters via Palmer."
                }
              />

              {/* Followed / Trending Teams Section */}
              <div className="rounded-2xl glass-panel p-5 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Trending Clubs</h3>
                  <Link href="/teams" className="text-xs text-cyan-400 hover:underline">
                    Browse All
                  </Link>
                </div>
                <div className="space-y-3">
                  {featuredTeams.slice(0, 3).map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      <Link href={`/teams/${team.id}`} className="flex items-center space-x-2.5 hover:text-cyan-400">
                        {team.badgeUrl && <img src={team.badgeUrl} alt={team.name} className="w-6 h-6 object-contain" />}
                        <div>
                          <p className="text-xs font-bold text-white">{team.name}</p>
                          <p className="text-[10px] text-gray-400">{team.leagueName || team.sport}</p>
                        </div>
                      </Link>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                        {team.stats?.points ? `${team.stats.points} pts` : team.sport}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Standings Table */}
            <div className="lg:col-span-2">
              <StandingsTable
                standings={premierLeague?.standings || []}
                title="English Premier League Standings"
              />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
