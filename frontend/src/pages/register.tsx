import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Trophy, ArrowRight, Lock, Mail, User, Loader2 } from 'lucide-react';

import { Logo } from '../components/common/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (user) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password, name);
      router.push('/');
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="Create Account | AI Sports Tracker"
      description="Create a free account to follow clubs, receive live score alerts, and explore AI sports telemetry."
    >
      <div className="max-w-md mx-auto my-10">
        <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-800 p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <Logo size="lg" link={false} showText={false} />
            </div>
            <h1 className="text-2xl font-black text-white">Join AI Sports Tracker</h1>
            <p className="text-xs text-gray-400 mt-1">Free access to real-time telemetry and AI analytics</p>
          </div>

          {error && <ErrorBanner error={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marcus Rashford"
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sportsfan@example.com"
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Password (6+ chars)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-gray-400">
            <span>Already registered? </span>
            <Link href="/login" className="text-cyan-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
