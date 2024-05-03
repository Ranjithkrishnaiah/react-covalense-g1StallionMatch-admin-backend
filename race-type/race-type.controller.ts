import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RaceTypeService } from './race-type.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Race-Types')
@Controller({
  path: 'race-type',
  version: '1',
})
export class RaceTypeController {
  constructor(private readonly raceTypeService: RaceTypeService) {}

  @ApiOperation({
    summary: 'Get Race Types ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.raceTypeService.findAll();
  }
}
