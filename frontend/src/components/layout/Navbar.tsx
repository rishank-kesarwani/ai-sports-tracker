import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  Search,
  Bell,
  Sparkles,
  User as UserIcon,
  LogOut,
  Radio,
} from 'lucide-react';

export const Navbar: React.FC<{ sseStatus?: string }> = ({ sseStatus = 'connected' }) => {
  const router = useRouter();
  const { user, logout, openLoginModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/teams?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1e293b] bg-[#090d16]/90 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="flex items-center justify-center w-full h-full rounded-[10px] bg-[#090d16]">
                <Trophy className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                AI SPORTS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">TRACKER</span>
              </span>
            </div>
          </Link>

          {/* SSE Live Status Indicator */}
          <div className="hidden md:flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900 border border-slate-800 space-x-1.5 ml-3">
            <span
              className={`w-2 h-2 rounded-full ${
                sseStatus === 'connected'
                  ? 'bg-emerald-400 animate-ping'
                  : sseStatus === 'connecting' || sseStatus === 'reconnecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-gray-300">
              {sseStatus === 'connected' ? 'LIVE SSE' : sseStatus === 'connecting' ? 'CONNECTING...' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3.5 top-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams, players, leagues (e.g. Arsenal, Saka, NBA)..."
              className="w-full py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 rounded-xl bg-slate-900/80 border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <Link
            href="/ai-assistant"
            className="flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600/30 to-cyan-500/20 border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400 transition-all shadow-md shadow-purple-500/10"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-cyan-400 animate-pulse" />
            <span>AI Assistant</span>
          </Link>

          <Link
            href="/notifications"
            className="relative p-2 text-gray-400 transition-colors rounded-xl hover:text-white hover:bg-slate-800/80"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
          </Link>

          {/* User Account / Auth Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-center w-7 h-7 font-bold text-xs rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-500 text-black">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-gray-200 max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 w-48 mt-2 py-1.5 rounded-xl bg-[#0f172a] border border-[#1e293b] shadow-2xl shadow-black/80 animate-fadeIn z-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/favorites"
                    className="flex items-center px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-slate-800/60"
                  >
                    <Trophy className="w-4 h-4 mr-2 text-cyan-400" />
                    My Followed Teams
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-slate-800/60"
                  >
                    <UserIcon className="w-4 h-4 mr-2 text-purple-400" />
                    Settings & Alerts
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-3 py-2 text-xs text-left text-red-400 hover:bg-red-950/40"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openLoginModal('Sign in to follow teams, get live alerts, and access AI insights.')}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-black rounded-xl bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-500/20"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
