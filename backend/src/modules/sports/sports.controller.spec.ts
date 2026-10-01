import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { SportsController } from './sports.controller';
import { SportsService } from './sports.service';
import { IS_OPTIONAL_AUTH_KEY } from '../../common/decorators/optional-auth.decorator';

describe('SportsController', () => {
  let controller: SportsController;
  let service: SportsService;
  let reflector: Reflector;

  const mockSportsService = {
    getAvailableSports: jest.fn().mockReturnValue([{ id: 'Soccer', name: 'Soccer' }]),
    getLeagues: jest.fn().mockResolvedValue([{ id: '4328', name: 'English Premier League' }]),
    getLeagueById: jest.fn().mockResolvedValue({ id: '4328', name: 'English Premier League' }),
    getTeamsByLeague: jest.fn().mockResolvedValue([{ id: '133604', name: 'Arsenal' }]),
    getTeamById: jest.fn().mockResolvedValue({ id: '133604', name: 'Arsenal' }),
    getPlayerById: jest.fn().mockResolvedValue({ id: '34147178', name: 'Bukayo Saka' }),
    getLiveMatches: jest.fn().mockResolvedValue([{ id: 'match-1', sport: 'Soccer', status: 'LIVE' }]),
    getUpcomingMatches: jest.fn().mockResolvedValue([]),
    getRecentMatches: jest.fn().mockResolvedValue([]),
    getMatchById: jest.fn().mockResolvedValue({ id: 'match-1', sport: 'Soccer' }),
    getStandings: jest.fn().mockResolvedValue([]),
    search: jest.fn().mockResolvedValue({ teams: [], leagues: [], players: [] }),
  };

  beforeEach(async () => {
    reflector = new Reflector();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SportsController],
      providers: [
        { provide: SportsService, useValue: mockSportsService },
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    controller = module.get<SportsController>(SportsController);
    service = module.get<SportsService>(SportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have @OptionalAuth() on public sports discovery endpoints', () => {
    const methods: (keyof SportsController)[] = [
      'getSports',
      'getLeagues',
      'getLeagueById',
      'searchTeams',
      'getTeamById',
      'searchPlayers',
      'getPlayerById',
      'getMatches',
      'getUpcomingMatches',
      'getRecentMatches',
      'getLiveMatches',
      'getMatchById',
    ];

    for (const methodName of methods) {
      const handler = SportsController.prototype[methodName];
      const isOptional = Reflect.getMetadata(IS_OPTIONAL_AUTH_KEY, handler);
      expect(isOptional).toBe(true);
    }
  });

  it('should return sports list for anonymous user', () => {
    const result = controller.getSports();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('Soccer');
  });

  it('should allow fetching live matches anonymously', async () => {
    const matches = await controller.getLiveMatches('Soccer');
    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe('match-1');
  });

  it('should allow fetching team details anonymously', async () => {
    const team = await controller.getTeamById('133604');
    expect(team.name).toBe('Arsenal');
    expect(service.getTeamById).toHaveBeenCalledWith('133604');
  });
});
