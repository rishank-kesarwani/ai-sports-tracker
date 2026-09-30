import { Test, TestingModule } from '@nestjs/testing';
import { FollowsService } from './follows.service';
import { getModelToken } from '@nestjs/mongoose';
import { FollowedItem } from './schemas/followed-item.schema';
import { SportsService } from '../sports/sports.service';
import { UsersService } from '../users/users.service';

describe('FollowsService', () => {
  let service: FollowsService;
  let mockFollowedModel: any;
  let mockSportsService: any;
  let mockUsersService: any;

  beforeEach(async () => {
    mockFollowedModel = {
      create: jest.fn().mockImplementation((doc) => Promise.resolve({ ...doc, _id: 'f-1' })),
      findOneAndDelete: jest.fn().mockResolvedValue({ _id: 'f-1' }),
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { itemType: 'team', itemId: 'team-1', itemName: 'Arsenal' },
          { itemType: 'league', itemId: 'league-1', itemName: 'Premier League' },
        ]),
      }),
    };

    mockSportsService = {
      getTeamById: jest.fn().mockResolvedValue({ id: 'team-1', name: 'Arsenal', sport: 'Soccer' }),
      getLeagueById: jest.fn().mockResolvedValue({ id: 'league-1', name: 'Premier League', sport: 'Soccer' }),
      getPlayerById: jest.fn().mockResolvedValue({ id: 'player-1', name: 'Bukayo Saka', sport: 'Soccer' }),
    };

    mockUsersService = {
      findById: jest.fn().mockResolvedValue({
        preferences: { followedTeams: [], followedLeagues: [], followedPlayers: [] },
      }),
      updatePreferences: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        { provide: getModelToken(FollowedItem.name), useValue: mockFollowedModel },
        { provide: SportsService, useValue: mockSportsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
  });

  it('should allow user to follow a team', async () => {
    const res = await service.followTeam('user-1', 'team-1');
    expect(res.itemName).toBe('Arsenal');
    expect(mockFollowedModel.create).toHaveBeenCalled();
  });

  it('should allow user to unfollow a team', async () => {
    const res = await service.unfollowTeam('user-1', 'team-1');
    expect(res.success).toBe(true);
  });

  it('should return categorized user follows', async () => {
    const res = await service.getUserFollows('user-1');
    expect(res.teams).toHaveLength(1);
    expect(res.leagues).toHaveLength(1);
  });
});
