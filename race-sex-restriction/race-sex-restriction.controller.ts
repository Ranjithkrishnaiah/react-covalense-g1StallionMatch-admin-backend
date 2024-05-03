import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RaceSexRestrictionService } from './race-sex-restriction.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Race-Sex-Restriction')
@Controller({
  path: 'race-sex-restriction',
  version: '1',
})
export class RaceSexRestrictionController {
  constructor(
    private readonly raceSexRestrictionService: RaceSexRestrictionService,
  ) {}

  @ApiOperation({
    summary: 'Get Race Sex Restriction ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.raceSexRestrictionService.findAll();
  }
}
