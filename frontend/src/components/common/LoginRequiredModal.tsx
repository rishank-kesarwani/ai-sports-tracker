import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Lock, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginRequiredModal: React.FC = () => {
  const { isLoginModalOpen, loginModalMessage, closeLoginModal } = useAuth();

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-2xl shadow-cyan-500/10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400" />

        <button
          onClick={closeLoginModal}
          className="absolute p-2 text-gray-400 transition-colors rounded-lg top-4 right-4 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">Sign In Required</h3>
          <p className="mt-2 text-sm text-gray-300 max-w-xs">{loginModalMessage}</p>

          <div className="w-full mt-6 space-y-3">
            <Link
              href="/login"
              onClick={closeLoginModal}
              className="flex items-center justify-center w-full py-3 px-4 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-lg shadow-cyan-500/20"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <Link
              href="/register"
              onClick={closeLoginModal}
              className="flex items-center justify-center w-full py-3 px-4 rounded-xl font-medium text-gray-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all hover:text-white"
            >
              Create Free Account
            </Link>
          </div>

          <div className="flex items-center mt-6 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
            <span>Encrypted Session &middot; Zero Spam Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
