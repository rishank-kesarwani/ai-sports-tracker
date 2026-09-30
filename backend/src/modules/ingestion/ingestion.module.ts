import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { SportsModule } from '../sports/sports.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiPlatformModule } from '../ai-platform/ai-platform.module';

@Module({
  imports: [SportsModule, RealtimeModule, NotificationsModule, AiPlatformModule],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
