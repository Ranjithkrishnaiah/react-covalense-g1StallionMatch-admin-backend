import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HorseTypesService } from './horse-types.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('HorseTypes')
@Controller({
  path: 'horse-types',
  version: '1',
})
export class HorseTypesController {
  constructor(private readonly horseTypesService: HorseTypesService) {}
  @Get()
  findAll() {
    return this.horseTypesService.findAll();
  }
}
