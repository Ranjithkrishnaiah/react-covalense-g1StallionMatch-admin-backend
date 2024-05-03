import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DistanceUnitService } from './distance-unit.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Distance-Unit')
@Controller({
  path: 'distance-unit',
  version: '1',
})
@Controller('distance-unit')
export class DistanceUnitController {
  constructor(private readonly distanceUnitService: DistanceUnitService) {}

  @ApiOperation({
    summary: 'Get All Distance Units',
  })
  @Get()
  findAll() {
    return this.distanceUnitService.findAll();
  }
}
