import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SearchOptionsDto } from './dto/search-name.dto';
import { RunnerTrainer } from './entities/runner-trainer.entity';
import { RunnerTrainerService } from './runner-trainer.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Runner')
@Controller({
  path: 'runner-trainer',
  version: '1',
})
export class RunnerTrainerController {
  constructor(private readonly runnerTrainerService: RunnerTrainerService) {}

  @Get()
  findAll(@Query() searchOptions: SearchOptionsDto): Promise<RunnerTrainer[]> {
    return this.runnerTrainerService.findAll(searchOptions);
  }
}
