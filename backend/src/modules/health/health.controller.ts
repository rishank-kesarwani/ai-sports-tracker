import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { AiPlatformClient } from '../ai-platform/ai-platform.client';
import { NotificationServiceClient } from '../notifications/notification-service.client';
import { TheSportsDbProvider } from '../sports/providers/thesportsdb.provider';
import { RealtimeService } from '../realtime/realtime.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health & Observability')
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redisService: RedisService,
    private readonly aiClient: AiPlatformClient,
    private readonly notificationClient: NotificationServiceClient,
    private readonly sportsProvider: TheSportsDbProvider,
    private readonly realtimeService: RealtimeService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness & Readiness probe with multi-service dependency health' })
  async checkHealth(@Res() res: Response) {
    const mongoReadyState = this.mongoConnection.readyState;
    const isMongoHealthy = mongoReadyState === 1; // 1 = connected

    const isRedisHealthy = this.redisService.getIsConnected();
    const aiHealth = this.aiClient.getHealth();
    const notifHealth = this.notificationClient.getHealth();

    const services = {
      mongodb: {
        status: isMongoHealthy ? 'UP' : 'DEGRADED',
        readyState: mongoReadyState,
      },
      redis: {
        status: isRedisHealthy ? 'UP' : 'FALLBACK_IN_MEMORY',
        connected: isRedisHealthy,
      },
      aiPlatform: {
        status: aiHealth.circuitState === 'OPEN' ? 'CIRCUIT_OPEN' : 'UP',
        circuitState: aiHealth.circuitState,
      },
      notificationService: {
        status: notifHealth.circuitState === 'OPEN' ? 'CIRCUIT_OPEN' : 'UP',
        circuitState: notifHealth.circuitState,
      },
      theSportsDb: {
        status: 'UP',
        provider: this.sportsProvider.providerName,
      },
      realtimeSse: {
        status: 'UP',
        activeClients: this.realtimeService.getActiveClientsCount(),
      },
    };

    const isOverallHealthy = isMongoHealthy || isRedisHealthy;
    const statusCode = isOverallHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json({
      status: isOverallHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      services,
    });
  }
}
