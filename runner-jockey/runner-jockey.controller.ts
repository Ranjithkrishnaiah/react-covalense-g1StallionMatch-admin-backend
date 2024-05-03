import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchOptionsDto } from './dto/search-name.dto';
import { RunnerJockey } from './entities/runner-jockey.entity';
import { RunnerJockeyService } from './runner-jockey.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Runner')
@Controller({
  path: 'runner-jockey',
  version: '1',
})
export class RunnerJockeyController {
  constructor(private readonly runnerJockeyService: RunnerJockeyService) {}

  @Get()
  findAll(@Query() searchOptions: SearchOptionsDto): Promise<RunnerJockey[]> {
    return this.runnerJockeyService.findAll(searchOptions);
  }
}
