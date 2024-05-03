import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Payload } from './interface/stallion-retired-reasons-payload.interface';
import { StallionRetiredReasonsService } from './service/stallion-retired-reasons.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Stallion Retired Reasons')
@Controller({
  path: 'stallion-retired-reasons',
  version: '1',
})
export class StallionRetiredReasonsController {
  constructor(
    private StallionRetiredReasonsService: StallionRetiredReasonsService,
  ) {}

  @Get()
  getAllStallionRetiredReasons(): Promise<Payload[]> {
    return this.StallionRetiredReasonsService.getAllStallionRetiredReasons();
  }
}
