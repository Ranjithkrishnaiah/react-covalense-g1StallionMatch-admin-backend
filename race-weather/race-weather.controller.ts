import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RaceWeatherService } from './race-weather.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Race-Weather')
@Controller({
  path: 'race-weather',
  version: '1',
})
export class RaceWeatherController {
  constructor(private readonly raceWeatherService: RaceWeatherService) {}

  @ApiOperation({
    summary: 'Get Race Weathers List ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.raceWeatherService.findAll();
  }
}
