import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AiPlatformModule } from '../ai-platform/ai-platform.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SportsModule } from '../sports/sports.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [AiPlatformModule, NotificationsModule, SportsModule, RealtimeModule],
  controllers: [HealthController],
})
export class HealthModule {}
