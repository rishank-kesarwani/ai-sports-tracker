import { Test, TestingModule } from '@nestjs/testing';
import { SportsService } from './sports.service';
import { TheSportsDbProvider } from './providers/thesportsdb.provider';
import { RedisService } from '../redis/redis.service';
import { getModelToken } from '@nestjs/mongoose';
import { Match } from './schemas/match.schema';
import { Team } from './schemas/team.schema';
import { League } from './schemas/league.schema';
import { Player } from './schemas/player.schema';

describe('SportsService', () => {
  let service: SportsService;
  let mockProvider: any;
  let mockRedis: any;

  beforeEach(async () => {
    mockProvider = {
      getLeaguesBySport: jest.fn().mockResolvedValue([{ id: 'league-1', name: 'Premier League', sport: 'Soccer' }]),
      getLeague: jest.fn().mockResolvedValue({ id: 'league-1', name: 'Premier League', sport: 'Soccer' }),
      searchTeams: jest.fn().mockResolvedValue([{ id: 'team-1', name: 'Arsenal', sport: 'Soccer' }]),
      getTeam: jest.fn().mockResolvedValue({ id: 'team-1', name: 'Arsenal', sport: 'Soccer' }),
      getPlayer: jest.fn().mockResolvedValue({ id: 'player-1', name: 'Bukayo Saka', sport: 'Soccer' }),
      getLiveScores: jest.fn().mockResolvedValue([{ id: 'match-1', sport: 'Soccer', status: 'LIVE' }]),
      getMatchById: jest.fn().mockResolvedValue({ id: 'match-1', sport: 'Soccer', status: 'LIVE' }),
    };

    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const mockModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportsService,
        { provide: TheSportsDbProvider, useValue: mockProvider },
        { provide: RedisService, useValue: mockRedis },
        { provide: getModelToken(Match.name), useValue: mockModel },
        { provide: getModelToken(Team.name), useValue: mockModel },
        { provide: getModelToken(League.name), useValue: mockModel },
        { provide: getModelToken(Player.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<SportsService>(SportsService);
  });

  it('should return available supported sports', () => {
    const sports = service.getAvailableSports();
    expect(sports).toHaveLength(4);
    expect(sports.map((s) => s.id)).toEqual(['Soccer', 'Cricket', 'Basketball', 'Tennis']);
  });

  it('should fetch leagues from provider and cache in Redis', async () => {
    const leagues = await service.getLeagues('Soccer');
    expect(leagues).toBeDefined();
    expect(mockProvider.getLeaguesBySport).toHaveBeenCalledWith('Soccer');
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it('should return cached leagues if present in Redis', async () => {
    mockRedis.get.mockResolvedValueOnce([{ id: 'league-cached', name: 'Cached League' }]);
    const leagues = await service.getLeagues('Soccer');
    expect(leagues[0].name).toBe('Cached League');
    expect(mockProvider.getLeaguesBySport).not.toHaveBeenCalled();
  });

  it('should get team details by ID', async () => {
    const team = await service.getTeamById('team-1');
    expect(team.name).toBe('Arsenal');
  });

  it('should get live matches', async () => {
    const live = await service.getLiveMatches();
    expect(live).toBeDefined();
    expect(live.length).toBeGreaterThan(0);
  });
});
