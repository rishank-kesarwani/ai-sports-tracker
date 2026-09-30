import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '../../components/layout/AppLayout';
import { api } from '../../services/api';
import { League } from '../../types/sports';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FollowButton } from '../../components/sports/FollowButton';
import { Globe, ArrowRight, Search } from 'lucide-react';

export default function LeaguesIndexPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [filteredLeagues, setFilteredLeagues] = useState<League[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeagues() {
      try {
        const res: any = await api.get('/sports/leagues');
        setLeagues(res || []);
        setFilteredLeagues(res || []);
      } catch (err) {
        console.error('Failed to load leagues:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeagues();
  }, []);

  useEffect(() => {
    let result = leagues;
    if (selectedSport !== 'All') {
      result = result.filter((l) => l.sport.toLowerCase() === selectedSport.toLowerCase());
    }
    if (search.trim()) {
      result = result.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredLeagues(result);
  }, [search, selectedSport, leagues]);

  const sports = ['All', 'Soccer', 'Cricket', 'Basketball', 'Tennis'];

  return (
    <AppLayout
      title="Global Sports Leagues & Tournaments | AI Sports Tracker"
      description="Browse standings, results, and fixtures for Premier League, NBA, IPL, ATP Tour and more."
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Leagues &amp; Tournaments</h1>
          <p className="text-xs text-gray-400 mt-1">Browse standings and schedule across major tournaments.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute w-4 h-4 text-gray-400 left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leagues..."
            className="w-full py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Sport Category Filter */}
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
        <LoadingSpinner text="Loading leagues catalog..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeagues.map((league) => (
            <div key={league.id} className="p-5 rounded-2xl glass-card flex flex-col justify-between group">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  {league.badgeUrl ? (
                    <img src={league.badgeUrl} alt={league.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-cyan-400 text-sm">
                      <Globe className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {league.name}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {league.sport} &bull; {league.country || 'Global'}
                    </p>
                  </div>
                </div>

                <FollowButton type="league" id={league.id} name={league.name} initialFollowed={league.isFavorite} size="sm" />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Season: {league.currentSeason || '2025-2026'}</span>
                <Link
                  href={`/leagues/${league.id}`}
                  className="flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <span>Standings &amp; Fixtures</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
