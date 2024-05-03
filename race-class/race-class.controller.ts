import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RaceClassService } from './race-class.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('RaceClass')
@Controller({
  path: 'race-class',
  version: '1',
})
@Controller('race-class')
export class RaceClassController {
  constructor(private readonly raceClassService: RaceClassService) {}

  @ApiOperation({
    summary: 'Get Race Classes ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.raceClassService.findAll();
  }
}
