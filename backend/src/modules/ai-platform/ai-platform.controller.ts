import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AiPlatformService } from './ai-platform.service';
import { OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

export class ChatRequestDto {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export class ComparePlayersDto {
  playerAId: string;
  playerBId: string;
}

@ApiTags('AI Sports Intelligence')
@Controller('ai')
export class AiPlatformController {
  constructor(private readonly aiService: AiPlatformService) {}

  @Post('chat')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Conversational AI sports assistant powered by shared AI Platform' })
  async chat(
    @Body() dto: ChatRequestDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.aiService.chatAssistant(dto.message, dto.history || [], userId);
  }

  @Get('match-summary/:id')
  @ApiOperation({ summary: 'Generate grounded AI tactical recap for a match' })
  async getMatchSummary(@Param('id') matchId: string) {
    return this.aiService.generateMatchSummary(matchId);
  }

  @Post('compare-players')
  @ApiOperation({ summary: 'Side-by-side AI athlete comparison and scout breakdown' })
  async comparePlayers(@Body() dto: ComparePlayersDto) {
    return this.aiService.comparePlayers(dto.playerAId, dto.playerBId);
  }
}
