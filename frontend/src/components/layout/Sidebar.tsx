import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  Flame,
  Globe,
  Trophy,
  Users,
  Sparkles,
  Bookmark,
  Bell,
  Settings,
  Activity,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Live Scores', href: '/sports', icon: Flame },
  { name: 'Leagues', href: '/leagues', icon: Globe },
  { name: 'Teams & Squads', href: '/teams', icon: Users },
  { name: 'My Favorites', href: '/favorites', icon: Bookmark, authRequired: true },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles, badge: 'AI' },
  { name: 'Alerts & Digest', href: '/notifications', icon: Bell },
  { name: 'Preferences', href: '/settings', icon: Settings },
];

const sportFilters = [
  { name: 'Football (Soccer)', sport: 'Soccer', icon: '⚽' },
  { name: 'Cricket', sport: 'Cricket', icon: '🏏' },
  { name: 'Basketball', sport: 'Basketball', icon: '🏀' },
  { name: 'Tennis', sport: 'Tennis', icon: '🎾' },
];

export const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#1e293b] bg-[#090d16]/70 min-h-[calc(100vh-4rem)] p-4 space-y-6 flex-shrink-0">
      {/* Navigation Links */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400 transition-colors'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-black">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sports Categories */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2">Sports Hub</p>
        {sportFilters.map((s) => {
          const isActive = router.query.sport === s.sport;
          return (
            <Link
              key={s.sport}
              href={`/sports/${s.sport.toLowerCase()}`}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-sm">{s.icon}</span>
                <span>{s.name}</span>
              </div>
              <Activity className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        })}
      </div>

      {/* Architecture & Shared Services Portfolio Info */}
      <div className="mt-auto p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px]">
        <div className="flex items-center space-x-1.5 text-cyan-400 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Shared AI Platform</span>
        </div>
        <p className="text-gray-400 leading-relaxed">
          Tactical insights powered by shared Gemini LLM engine &amp; event-driven Redis + SSE pipeline.
        </p>
      </div>
    </aside>
  );
};
