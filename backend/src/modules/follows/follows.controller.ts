import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Follows & Favorites')
@Controller('follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get all teams, leagues, and players followed by current user' })
  async getMyFollows(@CurrentUser('id') userId: string) {
    return this.followsService.getUserFollows(userId);
  }

  @Post('teams/:id')
  @ApiOperation({ summary: 'Follow a sports team' })
  async followTeam(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.followsService.followTeam(userId, id);
  }

  @Delete('teams/:id')
  @ApiOperation({ summary: 'Unfollow a sports team' })
  async unfollowTeam(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.followsService.unfollowTeam(userId, id);
  }

  @Post('leagues/:id')
  @ApiOperation({ summary: 'Follow a sports league' })
  async followLeague(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.followsService.followLeague(userId, id);
  }

  @Delete('leagues/:id')
  @ApiOperation({ summary: 'Unfollow a sports league' })
  async unfollowLeague(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.followsService.unfollowLeague(userId, id);
  }

  @Post('players/:id')
  @ApiOperation({ summary: 'Follow a player/athlete' })
  async followPlayer(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.followsService.followPlayer(userId, id);
  }

  @Delete('players/:id')
  @ApiOperation({ summary: 'Unfollow a player/athlete' })
  async unfollowPlayer(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.followsService.unfollowPlayer(userId, id);
  }
}
