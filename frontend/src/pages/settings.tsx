import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EmptyState } from '../components/common/EmptyState';
import { Settings, Bell, Shield, Mail, Smartphone, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshProfile, openLoginModal } = useAuth();
  const [matchStarting, setMatchStarting] = useState(
    user?.preferences?.notificationSettings?.matchStarting ?? true,
  );
  const [matchResult, setMatchResult] = useState(
    user?.preferences?.notificationSettings?.matchResult ?? true,
  );
  const [teamNews, setTeamNews] = useState(
    user?.preferences?.notificationSettings?.teamNews ?? true,
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    user?.preferences?.notificationSettings?.weeklyDigest ?? false,
  );
  const [emailChannel, setEmailChannel] = useState(
    user?.preferences?.notificationSettings?.channels?.includes('EMAIL') ?? true,
  );
  const [pushChannel, setPushChannel] = useState(
    user?.preferences?.notificationSettings?.channels?.includes('PUSH') ?? true,
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    return (
      <AppLayout title="Settings | AI Sports Tracker">
        <div className="max-w-md mx-auto my-12 text-center">
          <EmptyState
            title="Sign In to Manage Preferences"
            description="Manage alert channels, email subscriptions, and sport categories."
            actionText="Sign In Now"
            onAction={() => openLoginModal('Please sign in to modify settings.')}
            icon={<Settings className="w-8 h-8" />}
          />
        </div>
      </AppLayout>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const channels: string[] = ['IN_APP'];
      if (emailChannel) channels.push('EMAIL');
      if (pushChannel) channels.push('PUSH');

      await api.patch('/users/preferences', {
        notificationSettings: {
          matchStarting,
          matchResult,
          teamNews,
          weeklyDigest,
          channels,
        },
      });

      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      title="User Preferences & Notification Settings | AI Sports Tracker"
      description="Configure alert triggers, notification channels, and account details."
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white">Preferences &amp; Settings</h1>
          <p className="text-xs text-gray-400 mt-1">
            Customize how and when you receive live match alerts and digests.
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Account Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-gray-400">Full Name</label>
              <p className="font-bold text-white mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-gray-400">Email Address</label>
              <p className="font-bold text-white mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Notification Settings Form */}
        <form onSubmit={handleSave} className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Alert Triggers &amp; Channels</span>
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-white">Match Starting Alert</p>
                <p className="text-[11px] text-gray-400">Receive alert 15 minutes before your followed clubs kick off</p>
              </div>
              <input
                type="checkbox"
                checked={matchStarting}
                onChange={(e) => setMatchStarting(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-white">Final Match Result &amp; AI Debrief</p>
                <p className="text-[11px] text-gray-400">Receive instant full-time score and tactical summary</p>
              </div>
              <input
                type="checkbox"
                checked={matchResult}
                onChange={(e) => setMatchResult(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-white">Weekly Sports AI Digest</p>
                <p className="text-[11px] text-gray-400">Curated weekly telemetry wrap-up of your followed sports</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-gray-300">Delivery Channels</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-white font-medium flex-1">Email Dispatch</span>
                <input
                  type="checkbox"
                  checked={emailChannel}
                  onChange={(e) => setEmailChannel(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded"
                />
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-white font-medium flex-1">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={pushChannel}
                  onChange={(e) => setPushChannel(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {savedSuccess ? (
              <span className="flex items-center text-xs text-emerald-400 font-semibold">
                <Check className="w-4 h-4 mr-1" />
                Preferences updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-black bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
