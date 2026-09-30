import { Test, TestingModule } from '@nestjs/testing';
import { AiPlatformService } from './ai-platform.service';
import { AiPlatformClient } from './ai-platform.client';
import { SportsService } from '../sports/sports.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';

describe('AiPlatformService', () => {
  let service: AiPlatformService;
  let mockAiClient: any;
  let mockSportsService: any;
  let mockUsersService: any;
  let mockRedis: any;

  beforeEach(async () => {
    mockAiClient = {
      generateCompletion: jest.fn().mockResolvedValue({
        content: 'Tactical AI Analysis: Arsenal dominated the midfield with 58% possession.',
        model: 'ai-platform-gemini-pro',
        groundingSources: ['TheSportsDB Verified Telemetry'],
      }),
    };

    mockSportsService = {
      getMatchById: jest.fn().mockResolvedValue({
        id: 'match-101',
        sport: 'Soccer',
        leagueName: 'Premier League',
        homeTeam: { name: 'Arsenal', score: 2 },
        awayTeam: { name: 'Chelsea', score: 1 },
        status: 'LIVE',
        events: [],
        stats: { possession: { home: 58, away: 42 } },
      }),
      getPlayerById: jest.fn().mockImplementation((id) => ({
        id,
        name: id.includes('saka') ? 'Bukayo Saka' : 'Erling Haaland',
        sport: 'Soccer',
        stats: { goals: 15 },
      })),
      getLiveMatches: jest.fn().mockResolvedValue([]),
      getUpcomingMatches: jest.fn().mockResolvedValue([]),
      getRecentMatches: jest.fn().mockResolvedValue([]),
    };

    mockUsersService = {
      findById: jest.fn().mockResolvedValue({
        preferences: { followedTeams: ['Arsenal'] },
      }),
    };

    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiPlatformService,
        { provide: AiPlatformClient, useValue: mockAiClient },
        { provide: SportsService, useValue: mockSportsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AiPlatformService>(AiPlatformService);
  });

  it('should generate grounded AI match summary', async () => {
    const res = await service.generateMatchSummary('match-101');
    expect(res.summary).toContain('Tactical AI Analysis');
    expect(mockAiClient.generateCompletion).toHaveBeenCalled();
  });

  it('should compare two athletes side by side', async () => {
    const res = await service.comparePlayers('saka', 'haaland');
    expect(res.playerA.name).toBe('Bukayo Saka');
    expect(res.playerB.name).toBe('Erling Haaland');
    expect(res.analysis).toBeDefined();
  });

  it('should respond to conversational sports assistant query', async () => {
    const res = await service.chatAssistant('Who is playing tonight?', [], 'user-1');
    expect(res.reply).toBeDefined();
    expect(res.sources).toBeDefined();
  });
});
