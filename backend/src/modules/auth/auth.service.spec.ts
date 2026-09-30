import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationServiceClient } from '../notifications/notification-service.client';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;
  let mockNotificationClient: any;

  beforeEach(async () => {
    mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateRefreshToken: jest.fn().mockResolvedValue(undefined),
      setResetPasswordToken: jest.fn().mockResolvedValue(undefined),
      updatePassword: jest.fn().mockResolvedValue(undefined),
      getSanitizedUser: jest.fn().mockImplementation((u) => ({ id: u._id || 'user-1', email: u.email, name: u.name })),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt_token_sample'),
      verify: jest.fn(),
    };

    mockNotificationClient = {
      sendNotification: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NotificationServiceClient, useValue: mockNotificationClient },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should register a new user successfully', async () => {
    mockUsersService.findByEmail.mockResolvedValueOnce(null);
    mockUsersService.create.mockResolvedValueOnce({
      _id: 'user-new-1',
      email: 'newuser@test.com',
      name: 'John Doe',
      role: 'user',
    });

    const result = await authService.register({
      email: 'newuser@test.com',
      password: 'Password123!',
      name: 'John Doe',
    });

    expect(result.tokens).toBeDefined();
    expect(result.user.email).toBe('newuser@test.com');
  });

  it('should reject registration if email already exists', async () => {
    mockUsersService.findByEmail.mockResolvedValueOnce({ email: 'existing@test.com' });

    await expect(
      authService.register({
        email: 'existing@test.com',
        password: 'Password123!',
        name: 'Jane',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should login valid credentials and return tokens', async () => {
    const passwordHash = await bcrypt.hash('secret123', 10);
    mockUsersService.findByEmail.mockResolvedValueOnce({
      _id: 'user-1',
      email: 'sports@fan.com',
      passwordHash,
      name: 'Fan',
      role: 'user',
    });

    const result = await authService.login({
      email: 'sports@fan.com',
      password: 'secret123',
    });

    expect(result.tokens.accessToken).toBe('jwt_token_sample');
  });

  it('should reject login with wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct_password', 10);
    mockUsersService.findByEmail.mockResolvedValueOnce({
      _id: 'user-1',
      email: 'sports@fan.com',
      passwordHash,
    });

    await expect(
      authService.login({
        email: 'sports@fan.com',
        password: 'wrong_password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
