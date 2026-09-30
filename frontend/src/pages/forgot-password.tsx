import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '../components/layout/AppLayout';
import { api } from '../services/api';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Mail, ArrowLeft, Check, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res?.devResetToken) {
        setDevToken(res.devResetToken);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Forgot Password | AI Sports Tracker">
      <div className="max-w-md mx-auto my-12">
        <div className="rounded-3xl glass-panel border border-slate-800 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white">Reset Password</h1>
            <p className="text-xs text-gray-400 mt-1">
              Enter your email and we will dispatch password recovery instructions.
            </p>
          </div>

          {error && <ErrorBanner error={error} className="mb-4" />}

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Instructions Dispatched</h3>
              <p className="text-xs text-gray-300">
                If an account exists for <span className="text-cyan-400">{email}</span>, a secure recovery email has been queued via Notification Service.
              </p>

              {devToken && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-left text-xs">
                  <p className="text-cyan-400 font-bold mb-1">Development Reset Token Link:</p>
                  <Link
                    href={`/reset-password?token=${devToken}&email=${encodeURIComponent(email)}`}
                    className="text-gray-300 underline break-all text-[11px]"
                  >
                    Click to Reset Password with Token
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:underline pt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Account Email</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs text-black bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Instructions</span>}
              </button>

              <div className="pt-4 text-center">
                <Link href="/login" className="inline-flex items-center text-xs text-gray-400 hover:text-white">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
