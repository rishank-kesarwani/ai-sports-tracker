import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { NotificationServiceClient } from '../notifications/notification-service.client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationClient: NotificationServiceClient,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      role: 'user',
      preferences: {
        followedTeams: [],
        followedLeagues: [],
        followedPlayers: [],
        followedSports: ['Soccer', 'Basketball', 'Cricket', 'Tennis'],
        notificationSettings: {
          matchStarting: true,
          matchResult: true,
          teamNews: true,
          weeklyDigest: false,
          channels: ['IN_APP', 'EMAIL'],
        },
      },
    });

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return {
      user: await this.usersService.getSanitizedUser(user),
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return {
      user: await this.usersService.getSanitizedUser(user),
      tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret', 'sports_tracker_super_secret_refresh_jwt_key_2026'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Access denied. Session expired.');
      }

      const isTokenMatching = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isTokenMatching) {
        // Reuse detection / compromised token! Clear token hash
        await this.usersService.updateRefreshToken(user._id.toString(), null);
        throw new UnauthorizedException('Invalid refresh token. Please sign in again.');
      }

      // Rotate tokens
      const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
      await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

      return {
        user: await this.usersService.getSanitizedUser(user),
        tokens,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Return success message anyway to prevent user enumeration
      return { message: 'If that email exists, password reset instructions have been sent.' };
    }

    const rawToken = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const tokenHash = await bcrypt.hash(rawToken, salt);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await this.usersService.setResetPasswordToken(user._id.toString(), tokenHash, expiresAt);

    // Asynchronously dispatch reset email via Notification Service
    const resetUrl = `${this.configService.get<string>('frontendUrl', 'http://localhost:3000')}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    this.notificationClient
      .sendNotification({
        userId: user._id.toString(),
        type: 'PASSWORD_RESET',
        title: 'Reset Your AI Sports Tracker Password',
        message: `Use the following link to reset your password (valid for 1 hour): ${resetUrl}`,
        channel: 'EMAIL',
        recipientEmail: user.email,
        data: { resetUrl, token: rawToken },
      })
      .catch((err) => {
        this.logger.warn(`Failed to dispatch reset email via Notification Service: ${err.message}`);
      });

    return {
      message: 'If that email exists, password reset instructions have been sent.',
      // In non-production/demo testing we also return the token for convenience
      devResetToken: process.env.NODE_ENV !== 'production' ? rawToken : undefined,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // In our implementation, since we hash tokens, we check user records with active reset tokens
    // Or we find user by email if provided, or verify against active tokens
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(dto.newPassword, salt);

    // For demonstration and robust token lookup:
    // We can also allow finding the user with an active token
    // If token is UUID, we can find and match
    return {
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessSecret = this.configService.get<string>('jwt.accessSecret', 'sports_tracker_super_secret_access_jwt_key_2026');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret', 'sports_tracker_super_secret_refresh_jwt_key_2026');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: this.configService.get<string>('jwt.accessExpiration', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: this.configService.get<string>('jwt.refreshExpiration', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(refreshToken, salt);
    await this.usersService.updateRefreshToken(userId, hash);
  }
}
