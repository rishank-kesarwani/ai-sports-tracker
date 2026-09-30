import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '../components/layout/AppLayout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Match, FollowedCategory } from '../types/sports';
import { MatchCard } from '../components/sports/MatchCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Bookmark, Trophy, Users, Globe, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  const { user, openLoginModal } = useAuth();
  const [follows, setFollows] = useState<FollowedCategory | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadFavorites() {
      setLoading(true);
      try {
        const [followsRes, matchesRes]: any = await Promise.all([
          api.get('/follows/me'),
          api.get('/sports/matches'),
        ]);

        setFollows(followsRes || null);
        setMatches(matchesRes || []);
      } catch (e) {
        console.error('Failed to load favorites:', e);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [user]);

  if (!user) {
    return (
      <AppLayout title="My Favorites | AI Sports Tracker">
        <div className="max-w-md mx-auto my-12 text-center">
          <EmptyState
            title="Sign In to Personalize Your Hub"
            description="Follow clubs, leagues, and athletes to get personalized fixtures and match alerts."
            actionText="Sign In Now"
            onAction={() => openLoginModal('Please sign in to view your followed teams and custom sports feed.')}
            icon={<Bookmark className="w-8 h-8" />}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="My Favorites & Followed Clubs | AI Sports Tracker"
      description="Personalized match feed for your followed teams, leagues, and athletes."
    >
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">My Followed Hub</h1>
        <p className="text-xs text-gray-400 mt-1">
          Your personalized sports feed based on your followed clubs, leagues, and athletes.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your followed clubs and schedules..." />
      ) : (
        <div className="space-y-8">
          {/* Followed Summary Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Followed Clubs</h3>
                  <p className="text-xs text-gray-400">{follows?.teams?.length || 0} Clubs tracked</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Followed Leagues</h3>
                  <p className="text-xs text-gray-400">{follows?.leagues?.length || 0} Leagues tracked</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Followed Athletes</h3>
                  <p className="text-xs text-gray-400">{follows?.players?.length || 0} Players tracked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Followed Clubs List */}
          {follows?.teams && follows.teams.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-white mb-4">Followed Clubs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {follows.teams.map((t) => (
                  <Link
                    key={t.itemId}
                    href={`/teams/${t.itemId}`}
                    className="p-3.5 rounded-xl glass-card flex items-center space-x-3 hover:border-cyan-500/40"
                  >
                    {t.itemBadgeUrl ? (
                      <img src={t.itemBadgeUrl} alt={t.itemName} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        {t.itemName.slice(0, 2)}
                      </div>
                    )}
                    <span className="text-xs font-bold text-white truncate">{t.itemName}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Fixtures for Followed Teams */}
          <div>
            <h2 className="text-base font-bold text-white mb-4">Upcoming Fixtures for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
