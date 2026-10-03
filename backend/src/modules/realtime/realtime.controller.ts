import { Controller, Get, Query, Req, Sse } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { RealtimeService } from './realtime.service';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Realtime / Live Updates')
@Controller('live')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('matches')
  @OptionalAuth()
  @ApiOperation({ summary: 'Stream near-real-time match updates via Server-Sent Events (SSE)' })
  @ApiQuery({ name: 'sport', required: false })
  @ApiQuery({ name: 'leagueId', required: false })
  streamMatches(
    @Query('sport') sport?: string,
    @Query('leagueId') leagueId?: string,
    @Req() req?: Request,
  ): Observable<MessageEvent> {
    this.realtimeService.registerClient();

    if (req) {
      let closed = false;
      req.on('close', () => {
        if (!closed) {
          closed = true;
          this.realtimeService.unregisterClient();
        }
      });
    }

    return this.realtimeService.getEventsStream(sport, leagueId);
  }

  @Get('stats')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get active SSE stream statistics' })
  getStreamStats() {
    return {
      activeConnections: this.realtimeService.getActiveClientsCount(),
      protocol: 'Server-Sent Events (SSE)',
      heartbeatIntervalMs: 15000,
    };
  }
}
