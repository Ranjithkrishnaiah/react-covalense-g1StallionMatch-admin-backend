import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RegionsService } from './regions.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Regions')
@Controller({
  path: 'regions',
  version: '1',
})
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @ApiOperation({
    summary: 'Get Race Weathers List ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.regionsService.findAll();
  }

  @ApiOperation({
    summary: 'Get Race Weather ',
  })
  @ApiOkResponse({
    description: '',
    isArray: false,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionsService.findOne(+id);
  }
}
