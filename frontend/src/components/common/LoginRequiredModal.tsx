import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, X, ArrowRight, ShieldCheck, Mail, User, Loader2 } from 'lucide-react';

export const LoginRequiredModal: React.FC = () => {
  const { isLoginModalOpen, loginModalMessage, closeLoginModal, login, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tab === 'login') {
        // Authenticate in-place without redirecting away
        await login(email, password, false);
      } else {
        await register(email, password, name, false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    closeLoginModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-2xl shadow-cyan-500/10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400" />

        <button
          onClick={handleCancel}
          className="absolute p-2 text-gray-400 transition-colors rounded-lg top-4 right-4 hover:text-white hover:bg-slate-800"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">Sign In Required</h3>
          <p className="mt-1.5 text-xs text-gray-300 max-w-xs">{loginModalMessage}</p>

          {/* Tab Switcher */}
          <div className="flex w-full mt-5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === 'login' ? 'bg-cyan-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tab === 'register' ? 'bg-cyan-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="w-full mt-3 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs text-left">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full mt-4 space-y-3 text-left">
            {tab === 'register' && (
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Rashford"
                    className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sportsfan@example.com"
                  className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-black bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Sign In & Continue' : 'Create & Continue'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="py-2.5 px-4 rounded-xl font-medium text-xs text-gray-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="flex items-center mt-5 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span>Encrypted Session &middot; Seamless Action Continuation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
