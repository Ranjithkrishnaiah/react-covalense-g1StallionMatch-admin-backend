import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { Repository } from 'typeorm';
import { SearchOptionsDto } from './dto/search-name.dto';
import { RunnerOwner } from './entities/runner-owner.entity';
import { RunnerOwnerService } from './runner-owner.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Runner')
@Controller({
  path: 'runner-owner',
  version: '1',
})
export class RunnerOwnerController {
  constructor(private readonly runnerOwnerService: RunnerOwnerService) {}
  @InjectRepository(RunnerOwner)
  private runnerRepository: Repository<RunnerOwner>;

  @Get()
  async findAll(
    @Query() searchOptions: SearchOptionsDto,
  ): Promise<RunnerOwner[]> {
    return this.runnerOwnerService.findAll(searchOptions);
  }
}
