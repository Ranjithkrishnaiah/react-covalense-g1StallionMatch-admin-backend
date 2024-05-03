import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RunnerFinalPositionService } from './runner-final-position.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Runner')
@Controller({
  path: 'runner-final-position',
  version: '1',
})
export class RunnerFinalPositionController {
  constructor(
    private readonly runnerFinalPositionService: RunnerFinalPositionService,
  ) {}
    
/* Get Final Positions */
  @Get()
  findAll() {
    return this.runnerFinalPositionService.findAll();
  }
}
