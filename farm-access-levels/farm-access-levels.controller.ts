import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FarmAccessLevelsService } from './farm-access-levels.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Farm Access Levels')
@Controller({
  path: 'farm-access-levels',
  version: '1',
})
export class FarmAccessLevelsController {
  constructor(
    private readonly stallionTestimonialsService: FarmAccessLevelsService,
  ) {}

  @ApiOperation({
    summary: 'Get All Farm Access Levels',
  })
  @Get()
  getAllAccessLevels() {
    return this.stallionTestimonialsService.getAllAccessLevels();
  }
}
