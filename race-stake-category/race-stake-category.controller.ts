import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RaceStakeCategoryService } from './race-stake-category.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('RaceStakeCategory')
@Controller({
  path: 'race-stake-category',
  version: '1',
})
export class RaceStakeCategoryController {
  constructor(private readonly raceStakeService: RaceStakeCategoryService) {}

  @ApiOperation({
    summary: 'Get Race Stake Category',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get()
  findAll() {
    return this.raceStakeService.findAll();
  }
}
