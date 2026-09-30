import { Controller, Get, Param, Query } from '@nestjs/common';
import { SportsService } from './sports.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of supported sports and current coverage' })
  getSports() {
    return this.sportsService.getAvailableSports();
  }

  @Get('leagues')
  @ApiOperation({ summary: 'Get leagues by sport or all' })
  @ApiQuery({ name: 'sport', required: false })
  getLeagues(@Query('sport') sport?: string) {
    return this.sportsService.getLeagues(sport);
  }

  @Get('leagues/:id')
  @ApiOperation({ summary: 'Get league details and standings' })
  getLeagueById(@Param('id') id: string) {
    return this.sportsService.getLeagueById(id);
  }

  @Get('teams')
  @ApiOperation({ summary: 'Search teams by keyword or sport' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'sport', required: false })
  searchTeams(@Query('q') q?: string, @Query('sport') sport?: string) {
    return this.sportsService.searchTeams(q || '', sport);
  }

  @Get('teams/:id')
  @ApiOperation({ summary: 'Get team details and squad' })
  getTeamById(@Param('id') id: string) {
    return this.sportsService.getTeamById(id);
  }

  @Get('players')
  @ApiOperation({ summary: 'Search players by keyword' })
  @ApiQuery({ name: 'q', required: false })
  searchPlayers(@Query('q') q?: string) {
    return this.sportsService.searchPlayers(q || '');
  }

  @Get('players/:id')
  @ApiOperation({ summary: 'Get player profile and statistics' })
  getPlayerById(@Param('id') id: string) {
    return this.sportsService.getPlayerById(id);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Query matches by sport, league, status, or date' })
  @ApiQuery({ name: 'sport', required: false })
  @ApiQuery({ name: 'leagueId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getMatches(
    @Query('sport') sport?: string,
    @Query('leagueId') leagueId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sportsService.getMatches({
      sport,
      leagueId,
      status,
      date,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('matches/upcoming')
  @ApiOperation({ summary: 'Get upcoming scheduled matches' })
  @ApiQuery({ name: 'sport', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getUpcomingMatches(@Query('sport') sport?: string, @Query('limit') limit = '10') {
    return this.sportsService.getUpcomingMatches(sport, parseInt(limit, 10));
  }

  @Get('matches/recent')
  @ApiOperation({ summary: 'Get recent finished matches' })
  @ApiQuery({ name: 'sport', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getRecentMatches(@Query('sport') sport?: string, @Query('limit') limit = '10') {
    return this.sportsService.getRecentMatches(sport, parseInt(limit, 10));
  }

  @Get('matches/live')
  @ApiOperation({ summary: 'Get current live or near-real-time matches' })
  @ApiQuery({ name: 'sport', required: false })
  getLiveMatches(@Query('sport') sport?: string) {
    return this.sportsService.getLiveMatches(sport);
  }

  @Get('matches/:id')
  @ApiOperation({ summary: 'Get match center details, minute events, and AI summary' })
  getMatchById(@Param('id') id: string) {
    return this.sportsService.getMatchById(id);
  }
}
