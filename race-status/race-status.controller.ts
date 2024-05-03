import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RaceStatusService } from './race-status.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('RaceStatus')
@Controller({
  path: 'race-status',
  version: '1',
})
export class RaceStatusController {
  constructor(private readonly raceStatusService: RaceStatusService) { }

  @ApiOperation({
    summary: 'Get Race Statuses '
  })
  @ApiOkResponse({
    description: '',
    isArray: true
  })
  @Get()
  findAll() {
    return this.raceStatusService.findAll();
  }

  @Get('API-Status')
  findAPIStatus() {
    return this.raceStatusService.findAPIStatus();
  }
  @Get('IsImportrd')
  findIsImported() {
    return this.raceStatusService.findIsImported();
  }

}
