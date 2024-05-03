import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RaceTrackConditionService } from './race-track-condition.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Track-Conditions')
@Controller({
  path: 'race-track-condition',
  version: '1',
})
export class RaceTrackConditionController {
  constructor(
    private readonly raceTrackConditionService: RaceTrackConditionService,
  ) {}

  @ApiOperation({
    summary: 'Get Race Track Conditions ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.raceTrackConditionService.findAll();
  }
}
