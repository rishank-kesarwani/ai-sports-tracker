import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { TheSportsDbProvider } from './providers/thesportsdb.provider';
import {
  NormalizedLeague,
  NormalizedMatch,
  NormalizedPlayer,
  NormalizedTeam,
  SportType,
} from '../../common/interfaces/sports.interface';
import { Match, MatchDocument } from './schemas/match.schema';
import { Team, TeamDocument } from './schemas/team.schema';
import { League, LeagueDocument } from './schemas/league.schema';
import { Player, PlayerDocument } from './schemas/player.schema';
import { MOCK_LEAGUES, MOCK_MATCHES, MOCK_PLAYERS, MOCK_TEAMS } from './providers/mock-sports-data';

@Injectable()
export class SportsService {
  private readonly logger = new Logger(SportsService.name);

  constructor(
    private readonly provider: TheSportsDbProvider,
    private readonly redisService: RedisService,
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
    @InjectModel(Team.name) private readonly teamModel: Model<TeamDocument>,
    @InjectModel(League.name) private readonly leagueModel: Model<LeagueDocument>,
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
  ) {}

  getAvailableSports() {
    return [
      { id: SportType.SOCCER, name: 'Football (Soccer)', icon: 'futbol', activeLeaguesCount: 20, isLiveSupported: true },
      { id: SportType.CRICKET, name: 'Cricket', icon: 'cricket', activeLeaguesCount: 8, isLiveSupported: true },
      { id: SportType.BASKETBALL, name: 'Basketball', icon: 'basketball', activeLeaguesCount: 6, isLiveSupported: true },
      { id: SportType.TENNIS, name: 'Tennis', icon: 'tennis', activeLeaguesCount: 4, isLiveSupported: true },
    ];
  }

  async getLeagues(sport?: string): Promise<NormalizedLeague[]> {
    const cacheKey = `sports:leagues:${sport || 'all'}`;
    const cached = await this.redisService.get<NormalizedLeague[]>(cacheKey);
    if (cached) return cached;

    try {
      const leagues = await this.provider.getLeaguesBySport(sport || '');
      await this.redisService.set(cacheKey, leagues, 12 * 3600); // 12 hours TTL
      return leagues;
    } catch (e: any) {
      this.logger.warn(`Failed to fetch leagues for ${sport}: ${e.message}`);
      return MOCK_LEAGUES.filter((l) => !sport || l.sport.toLowerCase() === sport.toLowerCase());
    }
  }

  async getLeagueById(id: string): Promise<NormalizedLeague> {
    const cacheKey = `sports:league:${id}`;
    const cached = await this.redisService.get<NormalizedLeague>(cacheKey);
    if (cached) return cached;

    const league = await this.provider.getLeague(id);
    if (!league) {
      const fallback = MOCK_LEAGUES.find((l) => l.id === id || l.providerId === id);
      if (fallback) return fallback;
      throw new NotFoundException(`League with id ${id} not found`);
    }

    await this.redisService.set(cacheKey, league, 6 * 3600); // 6 hours TTL
    return league;
  }

  async searchTeams(query: string, sport?: string): Promise<NormalizedTeam[]> {
    if (!query || query.trim().length === 0) {
      return MOCK_TEAMS.filter((t) => !sport || t.sport.toLowerCase() === sport.toLowerCase());
    }

    const cacheKey = `sports:teams:search:${encodeURIComponent(query)}:${sport || 'all'}`;
    const cached = await this.redisService.get<NormalizedTeam[]>(cacheKey);
    if (cached) return cached;

    const teams = await this.provider.searchTeams(query, sport);
    await this.redisService.set(cacheKey, teams, 3600); // 1 hour TTL
    return teams;
  }

  async getTeamById(id: string): Promise<NormalizedTeam> {
    const cacheKey = `sports:team:${id}`;
    const cached = await this.redisService.get<NormalizedTeam>(cacheKey);
    if (cached) return cached;

    const team = await this.provider.getTeam(id);
    if (!team) {
      const fallback = MOCK_TEAMS.find((t) => t.id === id || t.providerId === id);
      if (fallback) return fallback;
      throw new NotFoundException(`Team with id ${id} not found`);
    }

    await this.redisService.set(cacheKey, team, 6 * 3600); // 6 hours TTL
    return team;
  }

  async searchPlayers(query: string): Promise<NormalizedPlayer[]> {
    if (!query || query.trim().length === 0) {
      return MOCK_PLAYERS;
    }
    return this.provider.searchPlayers(query);
  }

  async getPlayerById(id: string): Promise<NormalizedPlayer> {
    const cacheKey = `sports:player:${id}`;
    const cached = await this.redisService.get<NormalizedPlayer>(cacheKey);
    if (cached) return cached;

    const player = await this.provider.getPlayer(id);
    if (!player) {
      const fallback = MOCK_PLAYERS.find((p) => p.id === id || p.providerId === id);
      if (fallback) return fallback;
      throw new NotFoundException(`Player with id ${id} not found`);
    }

    await this.redisService.set(cacheKey, player, 12 * 3600);
    return player;
  }

  async getMatches(params: {
    sport?: string;
    leagueId?: string;
    status?: string;
    date?: string;
    limit?: number;
  }): Promise<NormalizedMatch[]> {
    const cacheKey = `sports:matches:${params.sport || 'all'}:${params.leagueId || 'all'}:${params.status || 'all'}:${params.date || 'all'}`;
    const cached = await this.redisService.get<NormalizedMatch[]>(cacheKey);
    if (cached) return cached;

    let matches = MOCK_MATCHES;

    if (params.sport) {
      matches = matches.filter((m) => m.sport.toLowerCase() === params.sport?.toLowerCase());
    }
    if (params.leagueId) {
      matches = matches.filter((m) => m.leagueId === params.leagueId);
    }
    if (params.status) {
      matches = matches.filter((m) => m.status === params.status);
    }

    const result = params.limit ? matches.slice(0, params.limit) : matches;
    await this.redisService.set(cacheKey, result, 60); // 60s TTL for fast freshness
    return result;
  }

  async getUpcomingMatches(sport?: string, limit = 10): Promise<NormalizedMatch[]> {
    const matches = await this.getMatches({ sport, status: 'SCHEDULED', limit });
    return matches.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async getRecentMatches(sport?: string, limit = 10): Promise<NormalizedMatch[]> {
    const matches = await this.getMatches({ sport, status: 'FINISHED', limit });
    return matches.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  async getLiveMatches(sport?: string): Promise<NormalizedMatch[]> {
    const cacheKey = `sports:live:${sport || 'all'}`;
    const cached = await this.redisService.get<NormalizedMatch[]>(cacheKey);
    if (cached) return cached;

    let liveMatches = await this.provider.getLiveScores(sport);
    if (!liveMatches || liveMatches.length === 0) {
      liveMatches = MOCK_MATCHES.filter((m) => m.status === 'LIVE' && (!sport || m.sport.toLowerCase() === sport.toLowerCase()));
    }

    await this.redisService.set(cacheKey, liveMatches, 15); // 15 seconds for live
    return liveMatches;
  }

  async getMatchById(id: string): Promise<NormalizedMatch> {
    const cacheKey = `sports:match:${id}`;
    const cached = await this.redisService.get<NormalizedMatch>(cacheKey);
    if (cached) return cached;

    const match = await this.provider.getMatchById(id);
    if (!match) {
      const fallback = MOCK_MATCHES.find((m) => m.id === id || m.providerId === id);
      if (fallback) return fallback;
      throw new NotFoundException(`Match with id ${id} not found`);
    }

    const ttl = match.status === 'LIVE' ? 30 : 3600;
    await this.redisService.set(cacheKey, match, ttl);
    return match;
  }
}
