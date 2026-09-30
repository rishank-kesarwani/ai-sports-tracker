import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SportsService } from '../sports/sports.service';
import { RealtimeService } from '../realtime/realtime.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiPlatformService } from '../ai-platform/ai-platform.service';
import { RedisService } from '../redis/redis.service';
import { NormalizedMatch } from '../../common/interfaces/sports.interface';

@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly sportsService: SportsService,
    private readonly realtimeService: RealtimeService,
    private readonly notificationsService: NotificationsService,
    private readonly aiService: AiPlatformService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.logger.log('Sports Ingestion Service initialized. Starting periodic background sync pipeline...');
    this.startScheduledSync();
  }

  /**
   * Main sync workflow that ingests live & scheduled sports data,
   * detects score/minute/status state changes, broadcasts SSE, and triggers notifications.
   */
  async processSyncJob(): Promise<{ matchesSynced: number; eventsDispatched: number }> {
    const lockAcquired = await this.redisService.acquireLock('ingestion:sync:job', 25);
    if (!lockAcquired) {
      this.logger.debug('Sync job skipped: another worker node is currently holding the sync lock.');
      return { matchesSynced: 0, eventsDispatched: 0 };
    }

    let matchesSynced = 0;
    let eventsDispatched = 0;

    try {
      this.logger.log('Starting ingestion sync pipeline...');
      const liveMatches = await this.sportsService.getLiveMatches();

      for (const match of liveMatches) {
        matchesSynced++;
        const prevKey = `sports:ingestion:prev:${match.id}`;
        const prevMatch = await this.redisService.get<NormalizedMatch>(prevKey);

        if (!prevMatch) {
          // First time seeing this match or cache expired
          await this.redisService.set(prevKey, match, 3600);
          continue;
        }

        // State Change Detection: Score changes
        const scoreChanged =
          prevMatch.homeTeam.score !== match.homeTeam.score ||
          prevMatch.awayTeam.score !== match.awayTeam.score;

        // State Change Detection: Status changes (SCHEDULED -> LIVE -> FINISHED)
        const statusChanged = prevMatch.status !== match.status;

        if (scoreChanged || statusChanged) {
          eventsDispatched++;
          this.logger.log(
            `Match state transition detected on [${match.id}] ${match.homeTeam.name} vs ${match.awayTeam.name}. Score: ${match.homeTeam.score}-${match.awayTeam.score}, Status: ${match.status}`,
          );

          // 1. Broadcast SSE event to connected browsers
          this.realtimeService.broadcastMatchUpdate(
            match,
            scoreChanged ? 'SCORE_CHANGE' : 'MATCH_STATUS_CHANGE',
          );

          // 2. If match just finished, trigger AI match summary generation
          if (match.status === 'FINISHED' && prevMatch.status !== 'FINISHED') {
            this.aiService.generateMatchSummary(match.id).catch((err) => {
              this.logger.warn(`Automated AI post-match recap failed for ${match.id}: ${err.message}`);
            });
          }
        }

        // Update previous state snapshot
        await this.redisService.set(prevKey, match, 3600);
      }
    } catch (err: any) {
      this.logger.error(`Ingestion sync job error: ${err.message}`, err.stack);
    } finally {
      await this.redisService.releaseLock('ingestion:sync:job');
    }

    return { matchesSynced, eventsDispatched };
  }

  private startScheduledSync() {
    // Run sync every 30 seconds
    this.syncTimer = setInterval(() => {
      this.processSyncJob().catch((err) => {
        this.logger.warn(`Scheduled sync failed: ${err.message}`);
      });
    }, 30000);
  }
}
