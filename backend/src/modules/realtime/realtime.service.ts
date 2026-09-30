import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subject, Observable, interval, merge } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { NormalizedMatch } from '../../common/interfaces/sports.interface';
import { MOCK_MATCHES } from '../sports/providers/mock-sports-data';

export interface SseMatchEvent {
  data: {
    event: 'MATCH_UPDATED' | 'SCORE_CHANGE' | 'MATCH_STATUS_CHANGE' | 'HEARTBEAT';
    match?: NormalizedMatch;
    timestamp: string;
    activeConnections?: number;
  };
  type?: string;
  id?: string;
}

@Injectable()
export class RealtimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RealtimeService.name);
  private readonly eventSubject = new Subject<SseMatchEvent>();
  private activeClientsCount = 0;
  private simulationInterval: NodeJS.Timeout | null = null;

  onModuleInit() {
    // Background near-real-time event simulation for live match minutes and score events
    this.startLiveSimulation();
  }

  onModuleDestroy() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
  }

  public registerClient(): void {
    this.activeClientsCount++;
    this.logger.log(`SSE Client connected. Active clients: ${this.activeClientsCount}`);
  }

  public unregisterClient(): void {
    this.activeClientsCount = Math.max(0, this.activeClientsCount - 1);
    this.logger.log(`SSE Client disconnected. Active clients: ${this.activeClientsCount}`);
  }

  public getActiveClientsCount(): number {
    return this.activeClientsCount;
  }

  public broadcastMatchUpdate(match: NormalizedMatch, eventType: 'MATCH_UPDATED' | 'SCORE_CHANGE' | 'MATCH_STATUS_CHANGE' = 'MATCH_UPDATED') {
    this.eventSubject.next({
      data: {
        event: eventType,
        match,
        timestamp: new Date().toISOString(),
      },
      id: `${match.id}-${Date.now()}`,
      type: eventType,
    });
  }

  public getEventsStream(sportFilter?: string, leagueFilter?: string): Observable<MessageEvent | any> {
    // 15-second heartbeat to keep connection alive through proxies/firewalls
    const heartbeat$ = interval(15000).pipe(
      map(() => ({
        data: {
          event: 'HEARTBEAT' as const,
          timestamp: new Date().toISOString(),
          activeConnections: this.activeClientsCount,
        },
        type: 'HEARTBEAT',
      })),
    );

    const stream$ = this.eventSubject.asObservable().pipe(
      filter((item) => {
        if (!item.data.match) return true;
        if (sportFilter && item.data.match.sport.toLowerCase() !== sportFilter.toLowerCase()) {
          return false;
        }
        if (leagueFilter && item.data.match.leagueId !== leagueFilter) {
          return false;
        }
        return true;
      }),
    );

    return merge(heartbeat$, stream$);
  }

  private startLiveSimulation() {
    let tick = 0;
    this.simulationInterval = setInterval(() => {
      tick++;
      const liveMatches = MOCK_MATCHES.filter((m) => m.status === 'LIVE');
      if (liveMatches.length === 0) return;

      const matchToUpdate = { ...liveMatches[tick % liveMatches.length] };
      // Advance match minute or score
      if (matchToUpdate.sport === 'Soccer') {
        const currentMin = parseInt(String(matchToUpdate.minute || "65'").replace("'", ''), 10) || 65;
        const nextMin = currentMin >= 90 ? 45 : currentMin + 1;
        matchToUpdate.minute = `${nextMin}'`;
        matchToUpdate.lastSyncedAt = new Date().toISOString();
        matchToUpdate.freshness = 'near-real-time';

        this.broadcastMatchUpdate(matchToUpdate, 'MATCH_UPDATED');
      } else if (matchToUpdate.sport === 'Cricket') {
        matchToUpdate.minute = `19.${(tick % 6)} Ov`;
        matchToUpdate.lastSyncedAt = new Date().toISOString();
        this.broadcastMatchUpdate(matchToUpdate, 'MATCH_UPDATED');
      }
    }, 10000); // Pulse updates every 10s
  }
}
