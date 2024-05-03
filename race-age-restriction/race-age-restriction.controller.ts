import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RaceAgeRestrictionService } from './race-age-restriction.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Race-Age-Restriction')
@Controller({
  path: 'race-age-restriction',
  version: '1',
})
export class RaceAgeRestrictionController {
  constructor(
    private readonly raceAgeRestrictionService: RaceAgeRestrictionService,
  ) {}
  @ApiOperation({
    summary: 'Get Race Age Restriction ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.raceAgeRestrictionService.findAll();
  }
}
