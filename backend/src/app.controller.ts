import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('API Root')
@Controller()
export class AppController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'API Root & Information' })
  getRoot() {
    return {
      name: 'AI Sports Tracker API',
      status: 'online',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/api/v1/health',
    };
  }
}
