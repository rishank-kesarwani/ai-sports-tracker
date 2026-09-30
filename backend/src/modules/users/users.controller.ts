import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    return this.usersService.getSanitizedUser(user);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update sports and notification preferences' })
  async updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() preferences: any,
  ) {
    const updated = await this.usersService.updatePreferences(userId, preferences);
    return this.usersService.getSanitizedUser(updated);
  }
}
