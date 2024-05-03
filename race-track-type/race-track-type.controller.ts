import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RaceTrackTypeService } from './race-track-type.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Track-Types')
@Controller({
  path: 'race-track-type',
  version: '1',
})
export class RaceTrackTypeController {
  constructor(private readonly raceTrackTypeService: RaceTrackTypeService) {}

  @ApiOperation({
    summary: 'Get Race Track Types ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.raceTrackTypeService.findAll();
  }
}
