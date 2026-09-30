import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FollowedItem, FollowedItemDocument } from './schemas/followed-item.schema';
import { SportsService } from '../sports/sports.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(FollowedItem.name)
    private readonly followedModel: Model<FollowedItemDocument>,
    private readonly sportsService: SportsService,
    private readonly usersService: UsersService,
  ) {}

  async followTeam(userId: string, teamId: string) {
    const team = await this.sportsService.getTeamById(teamId);
    try {
      const item = await this.followedModel.create({
        userId,
        itemType: 'team',
        itemId: team.id,
        itemName: team.name,
        itemBadgeUrl: team.badgeUrl,
        sport: team.sport,
      });

      // Also update user's quick preferences array
      const user = await this.usersService.findById(userId);
      if (user && !user.preferences.followedTeams.includes(team.name)) {
        await this.usersService.updatePreferences(userId, {
          followedTeams: [...(user.preferences.followedTeams || []), team.name],
        });
      }

      return item;
    } catch (e: any) {
      if (e.code === 11000) {
        throw new ConflictException('You are already following this team');
      }
      throw e;
    }
  }

  async unfollowTeam(userId: string, teamId: string) {
    const deleted = await this.followedModel.findOneAndDelete({
      userId,
      itemType: 'team',
      itemId: teamId,
    });
    if (!deleted) {
      throw new NotFoundException('Follow relationship not found');
    }
    return { success: true, message: 'Unfollowed team' };
  }

  async followLeague(userId: string, leagueId: string) {
    const league = await this.sportsService.getLeagueById(leagueId);
    try {
      const item = await this.followedModel.create({
        userId,
        itemType: 'league',
        itemId: league.id,
        itemName: league.name,
        itemBadgeUrl: league.badgeUrl,
        sport: league.sport,
      });

      const user = await this.usersService.findById(userId);
      if (user && !user.preferences.followedLeagues.includes(league.name)) {
        await this.usersService.updatePreferences(userId, {
          followedLeagues: [...(user.preferences.followedLeagues || []), league.name],
        });
      }

      return item;
    } catch (e: any) {
      if (e.code === 11000) {
        throw new ConflictException('You are already following this league');
      }
      throw e;
    }
  }

  async unfollowLeague(userId: string, leagueId: string) {
    const deleted = await this.followedModel.findOneAndDelete({
      userId,
      itemType: 'league',
      itemId: leagueId,
    });
    if (!deleted) {
      throw new NotFoundException('Follow relationship not found');
    }
    return { success: true, message: 'Unfollowed league' };
  }

  async followPlayer(userId: string, playerId: string) {
    const player = await this.sportsService.getPlayerById(playerId);
    try {
      const item = await this.followedModel.create({
        userId,
        itemType: 'player',
        itemId: player.id,
        itemName: player.name,
        itemBadgeUrl: player.thumbUrl,
        sport: player.sport,
      });

      const user = await this.usersService.findById(userId);
      if (user && !user.preferences.followedPlayers.includes(player.name)) {
        await this.usersService.updatePreferences(userId, {
          followedPlayers: [...(user.preferences.followedPlayers || []), player.name],
        });
      }

      return item;
    } catch (e: any) {
      if (e.code === 11000) {
        throw new ConflictException('You are already following this player');
      }
      throw e;
    }
  }

  async unfollowPlayer(userId: string, playerId: string) {
    const deleted = await this.followedModel.findOneAndDelete({
      userId,
      itemType: 'player',
      itemId: playerId,
    });
    if (!deleted) {
      throw new NotFoundException('Follow relationship not found');
    }
    return { success: true, message: 'Unfollowed player' };
  }

  async getUserFollows(userId: string) {
    const items = await this.followedModel.find({ userId }).exec();
    return {
      teams: items.filter((i) => i.itemType === 'team'),
      leagues: items.filter((i) => i.itemType === 'league'),
      players: items.filter((i) => i.itemType === 'player'),
      totalFollows: items.length,
    };
  }
}
