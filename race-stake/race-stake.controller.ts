import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RaceStakeService } from './race-stake.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('RaceStake')
@Controller({
  path: 'race-stake',
  version: '1',
})
export class RaceStakeController {
  constructor(private readonly raceStakeService: RaceStakeService) {}

  @ApiOperation({
    summary: 'Get Race Stakes ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.raceStakeService.findAll();
  }
}
