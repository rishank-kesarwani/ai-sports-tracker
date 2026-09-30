import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowedItem, FollowedItemSchema } from './schemas/followed-item.schema';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { SportsModule } from '../sports/sports.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FollowedItem.name, schema: FollowedItemSchema }]),
    SportsModule,
    UsersModule,
  ],
  providers: [FollowsService],
  controllers: [FollowsController],
  exports: [FollowsService],
})
export class FollowsModule {}
