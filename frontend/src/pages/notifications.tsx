import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types/sports';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Bell, CheckCheck, Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
  const { user, openLoginModal } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadNotifications() {
      setLoading(true);
      try {
        const res: any = await api.get('/notifications');
        setNotifications(res?.items || res || []);
        setUnreadCount(res?.meta?.unreadCount || 0);
      } catch (e) {
        console.error('Failed to load notifications:', e);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  if (!user) {
    return (
      <AppLayout title="Notifications & Alerts | AI Sports Tracker">
        <div className="max-w-md mx-auto my-12 text-center">
          <EmptyState
            title="Sign In for Match Alerts"
            description="Receive live match starting notifications, score updates, and weekly AI digests."
            actionText="Sign In Now"
            onAction={() => openLoginModal('Sign in to view your alerts and notification settings.')}
            icon={<Bell className="w-8 h-8" />}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Match Notifications & Alerts | AI Sports Tracker"
      description="Live match start notifications, final score debriefs, and custom sports alerts."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Notifications &amp; Alerts</h1>
            <p className="text-xs text-gray-400 mt-1">
              Real-time match updates dispatched asynchronously via Notification Service.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching notifications..." />
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.read && markAsRead(notif._id)}
                className={`p-4 rounded-2xl glass-card flex items-start space-x-3.5 transition-all cursor-pointer ${
                  !notif.read ? 'border-cyan-500/40 bg-slate-900/90' : 'opacity-80'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    notif.type === 'MATCH_STARTING'
                      ? 'bg-amber-500/10 text-amber-400'
                      : notif.type === 'MATCH_RESULT'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-purple-500/10 text-purple-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                    <span className="text-[10px] text-gray-500">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{notif.message}</p>
                </div>

                {!notif.read && <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <Bell className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <h3 className="text-sm font-bold text-white">No New Notifications</h3>
            <p className="text-xs text-gray-500 mt-1">
              You will receive match starting alerts and results for followed clubs here.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
