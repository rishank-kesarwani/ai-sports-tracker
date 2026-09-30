import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../services/api';
import { Match } from '../types/sports';

export type StreamStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface UseSportsStreamOptions {
  sport?: string;
  leagueId?: string;
  onMatchUpdate?: (match: Match, eventType: string) => void;
  enabled?: boolean;
}

export function useSportsStream({
  sport,
  leagueId,
  onMatchUpdate,
  enabled = true,
}: UseSportsStreamOptions = {}) {
  const [status, setStatus] = useState<StreamStatus>('disconnected');
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const [activeConnections, setActiveConnections] = useState<number>(1);
  const [recentUpdates, setRecentUpdates] = useState<Match[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting');

    const queryParams = new URLSearchParams();
    if (sport) queryParams.append('sport', sport);
    if (leagueId) queryParams.append('leagueId', leagueId);

    const sseUrl = `${API_BASE_URL}/live/matches${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      const es = new EventSource(sseUrl, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      // Handle custom event types
      const handleEvent = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'HEARTBEAT') {
            setLastHeartbeat(payload.timestamp);
            if (payload.activeConnections) {
              setActiveConnections(payload.activeConnections);
            }
            return;
          }

          if (payload.match) {
            const updatedMatch = payload.match as Match;
            setRecentUpdates((prev) => {
              const filtered = prev.filter((m) => m.id !== updatedMatch.id);
              return [updatedMatch, ...filtered].slice(0, 10);
            });

            if (onMatchUpdate) {
              onMatchUpdate(updatedMatch, payload.event);
            }
          }
        } catch (e) {
          console.error('Failed to parse SSE payload:', e);
        }
      };

      es.addEventListener('MATCH_UPDATED', handleEvent);
      es.addEventListener('SCORE_CHANGE', handleEvent);
      es.addEventListener('MATCH_STATUS_CHANGE', handleEvent);
      es.addEventListener('HEARTBEAT', handleEvent);
      es.onmessage = handleEvent;

      es.onerror = () => {
        setStatus('disconnected');
        es.close();

        // Exponential backoff reconnect
        reconnectAttemptsRef.current++;
        const backoffMs = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoffMs);
      };
    } catch (err) {
      setStatus('disconnected');
    }
  }, [enabled, sport, leagueId, onMatchUpdate]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    status,
    lastHeartbeat,
    activeConnections,
    recentUpdates,
    reconnect: () => {
      reconnectAttemptsRef.current = 0;
      connect();
    },
  };
}
