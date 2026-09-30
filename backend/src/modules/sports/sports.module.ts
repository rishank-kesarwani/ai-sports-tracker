import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SportsService } from './sports.service';
import { SportsController } from './sports.controller';
import { TheSportsDbProvider } from './providers/thesportsdb.provider';
import { Match, MatchSchema } from './schemas/match.schema';
import { Team, TeamSchema } from './schemas/team.schema';
import { League, LeagueSchema } from './schemas/league.schema';
import { Player, PlayerSchema } from './schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Team.name, schema: TeamSchema },
      { name: League.name, schema: LeagueSchema },
      { name: Player.name, schema: PlayerSchema },
    ]),
  ],
  providers: [SportsService, TheSportsDbProvider],
  controllers: [SportsController],
  exports: [SportsService, TheSportsDbProvider],
})
export class SportsModule {}
