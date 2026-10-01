import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { IS_OPTIONAL_AUTH_KEY } from '../../../common/decorators/optional-auth.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let configService: ConfigService;

  const mockExecutionContext = (handlerOverride?: any, classOverride?: any): ExecutionContext => {
    return {
      getHandler: jest.fn().mockReturnValue(handlerOverride || {}),
      getClass: jest.fn().mockReturnValue(classOverride || {}),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers: {} }),
        getResponse: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'publicAccessEnabled') return true;
        return undefined;
      }),
    } as unknown as ConfigService;
    guard = new JwtAuthGuard(reflector, configService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true immediately if route is marked @Public()', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const context = mockExecutionContext();

      const result = guard.canActivate(context);
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, expect.any(Array));
    });

    it('should delegate to super.canActivate if not marked @Public()', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = mockExecutionContext();
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
      superCanActivateSpy.mockRestore();
    });
  });

  describe('handleRequest', () => {
    it('should return user or null for @Public() routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return true;
        return false;
      });
      const context = mockExecutionContext();

      const anonymousResult = guard.handleRequest(null, null, null, context);
      expect(anonymousResult).toBeNull();

      const authenticatedResult = guard.handleRequest(null, { userId: '123' }, null, context);
      expect(authenticatedResult).toEqual({ userId: '123' });
    });

    it('should allow anonymous access and return null when route is @OptionalAuth() and PUBLIC_ACCESS_ENABLED is true', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === IS_OPTIONAL_AUTH_KEY) return true;
        return false;
      });
      jest.spyOn(configService, 'get').mockReturnValue(true);
      const context = mockExecutionContext();

      const result = guard.handleRequest(null, null, null, context);
      expect(result).toBeNull();
    });

    it('should allow authenticated access and return user when route is @OptionalAuth() and valid token is present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === IS_OPTIONAL_AUTH_KEY) return true;
        return false;
      });
      jest.spyOn(configService, 'get').mockReturnValue(true);
      const context = mockExecutionContext();
      const mockUser = { userId: 'user-sports-1', email: 'fan@example.com' };

      const result = guard.handleRequest(null, mockUser, null, context);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for @OptionalAuth() route when PUBLIC_ACCESS_ENABLED is false and user is anonymous', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === IS_OPTIONAL_AUTH_KEY) return true;
        return false;
      });
      jest.spyOn(configService, 'get').mockReturnValue(false);
      const context = mockExecutionContext();

      expect(() => {
        guard.handleRequest(null, null, null, context);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for protected routes when no user or token is present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = mockExecutionContext();

      expect(() => {
        guard.handleRequest(null, null, null, context);
      }).toThrow(UnauthorizedException);
    });

    it('should return user for protected routes when valid user is present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = mockExecutionContext();
      const mockUser = { userId: 'user-777', email: 'pro@example.com' };

      const result = guard.handleRequest(null, mockUser, null, context);
      expect(result).toEqual(mockUser);
    });
  });
});
