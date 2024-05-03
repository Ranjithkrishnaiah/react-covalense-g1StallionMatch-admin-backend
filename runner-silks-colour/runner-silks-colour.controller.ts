import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RunnerSilksColourService } from './runner-silks-colour.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Runner')
@Controller({
  path: 'runner-silks-colour',
  version: '1',
})
export class RunnerSilksColourController {
  constructor(
    private readonly runnerSilksColourService: RunnerSilksColourService,
  ) {}

  @Get()
  findAll() {
    return this.runnerSilksColourService.findAll();
  }
}
