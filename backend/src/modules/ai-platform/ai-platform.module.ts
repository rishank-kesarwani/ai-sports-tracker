import { Module } from '@nestjs/common';
import { AiPlatformService } from './ai-platform.service';
import { AiPlatformController } from './ai-platform.controller';
import { AiPlatformClient } from './ai-platform.client';
import { SportsModule } from '../sports/sports.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SportsModule, UsersModule],
  providers: [AiPlatformService, AiPlatformClient],
  controllers: [AiPlatformController],
  exports: [AiPlatformService, AiPlatformClient],
})
export class AiPlatformModule {}
