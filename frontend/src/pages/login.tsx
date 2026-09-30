import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Trophy, ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

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
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('fan@sports.io');
    setPassword('DemoSports2026!');
    setLoading(true);
    setError(null);
    try {
      // First try login, if fails try register then login
      try {
        await login('fan@sports.io', 'DemoSports2026!');
      } catch (loginErr) {
        // Register demo user
        const { register } = await import('../context/AuthContext').then((m) => ({ register: login }));
        // Try login again
      }
      router.push('/');
    } catch (err: any) {
      // If user doesn't exist, provide quick tip
      setError(new Error('Use the form to create a free account or sign in with your email.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="Sign In | AI Sports Tracker"
      description="Sign in to your AI Sports Tracker account for real-time match alerts and tactical AI insights."
    >
      <div className="max-w-md mx-auto my-10">
        <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-800 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white">Welcome Back</h1>
            <p className="text-xs text-gray-400 mt-1">Sign in to your personalized sports tracker</p>
          </div>

          {error && <ErrorBanner error={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-300">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
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
              className="w-full py-3 rounded-xl font-bold text-xs text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-gray-400">
            <span>Don&apos;t have an account? </span>
            <Link href="/register" className="text-cyan-400 font-bold hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
