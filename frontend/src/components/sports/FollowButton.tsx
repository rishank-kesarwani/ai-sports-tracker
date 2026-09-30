import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Bookmark, Check, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  type: 'team' | 'player' | 'league';
  id: string;
  name: string;
  initialFollowed?: boolean;
  size?: 'sm' | 'md';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  type,
  id,
  name,
  initialFollowed = false,
  size = 'md',
}) => {
  const { user, requireAuth } = useAuth();
  const [followed, setFollowed] = useState(initialFollowed);
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    requireAuth(async () => {
      setLoading(true);
      try {
        const endpoint = `/follows/${type}s/${id}`;
        if (followed) {
          await api.delete(endpoint);
          setFollowed(false);
        } else {
          await api.post(endpoint);
          setFollowed(true);
        }
      } catch (err) {
        console.error(`Failed to follow ${type}:`, err);
      } finally {
        setLoading(false);
      }
    }, `Sign in to follow ${name} and receive match notifications.`);
  };

  const isSmall = size === 'sm';

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center rounded-xl font-semibold transition-all ${
        isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-xs'
      } ${
        followed
          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
          : 'bg-slate-800/90 text-gray-300 border border-slate-700/90 hover:border-cyan-500/40 hover:text-white'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : followed ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          <span>Following</span>
        </>
      ) : (
        <>
          <Bookmark className="w-3.5 h-3.5 mr-1 text-gray-400" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};
