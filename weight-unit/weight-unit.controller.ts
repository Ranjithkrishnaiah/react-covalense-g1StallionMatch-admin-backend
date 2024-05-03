import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { WeightUnitService } from './weight-unit.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Runner')
@Controller({
  path: 'weight-unit',
  version: '1',
})
@Controller('weight-unit')
export class WeightUnitController {
  constructor(private readonly weightUnitService: WeightUnitService) {}

  @Get()
  findAll() {
    return this.weightUnitService.findAll();
  }
}
