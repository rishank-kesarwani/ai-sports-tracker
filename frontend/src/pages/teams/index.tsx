import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../services/api';
import { Team } from '../../types/sports';
import { TeamCard } from '../../components/sports/TeamCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search } from 'lucide-react';

export default function TeamsIndexPage() {
  const router = useRouter();
  const { q: urlQuery } = router.query;

  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState((urlQuery as string) || '');
  const [selectedSport, setSelectedSport] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (urlQuery) {
      setSearch(urlQuery as string);
    }
  }, [urlQuery]);

  useEffect(() => {
    async function searchTeams() {
      setLoading(true);
      try {
        const sportParam = selectedSport !== 'All' ? selectedSport : '';
        const res: any = await api.get(`/sports/teams?q=${encodeURIComponent(search)}&sport=${sportParam}`);
        setTeams(res || []);
      } catch (e) {
        console.error('Failed to search teams:', e);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      searchTeams();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedSport]);

  const sports = ['All', 'Soccer', 'Cricket', 'Basketball', 'Tennis'];

  return (
    <AppLayout
      title="Search Sports Teams & Squads | AI Sports Tracker"
      description="Find football clubs, cricket franchises, NBA teams, and tennis squads."
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Teams &amp; Squads</h1>
          <p className="text-xs text-gray-400 mt-1">Search teams across all major leagues and sports.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute w-4 h-4 text-gray-400 left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name (e.g. Arsenal, Warriors)..."
            className="w-full py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-1">
        {sports.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSport(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedSport === s
                ? 'bg-cyan-400 text-black font-bold'
                : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Searching teams catalog..." />
      ) : teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <p className="text-sm font-semibold text-gray-300">No teams matched &ldquo;{search}&rdquo;</p>
          <p className="text-xs text-gray-500 mt-1">Try another search keyword or switch sports category.</p>
        </div>
      )}
    </AppLayout>
  );
}
