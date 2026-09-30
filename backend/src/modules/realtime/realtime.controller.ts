import { Controller, Get, Query, Req, Res, Sse } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { RealtimeService } from './realtime.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Realtime / Live Updates')
@Controller('live')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('matches')
  @ApiOperation({ summary: 'Stream near-real-time match updates via Server-Sent Events (SSE)' })
  @ApiQuery({ name: 'sport', required: false })
  @ApiQuery({ name: 'leagueId', required: false })
  streamMatches(
    @Query('sport') sport?: string,
    @Query('leagueId') leagueId?: string,
    @Req() req?: Request,
    @Res() res?: Response,
  ): Observable<MessageEvent> {
    this.realtimeService.registerClient();

    if (req) {
      req.on('close', () => {
        this.realtimeService.unregisterClient();
      });
    }

    return this.realtimeService.getEventsStream(sport, leagueId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get active SSE stream statistics' })
  getStreamStats() {
    return {
      activeConnections: this.realtimeService.getActiveClientsCount(),
      protocol: 'Server-Sent Events (SSE)',
      heartbeatIntervalMs: 15000,
    };
  }
}
