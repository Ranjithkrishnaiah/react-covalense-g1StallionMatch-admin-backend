import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { AdminModuleAccessLevelService } from './admin-module-access-level.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('AdminModuleAccessLevel')
@Controller({
  path: 'adminModuleAccessLevel',
  version: '1',
})
export class AdminModuleAccessLevelController {
  constructor(
    private readonly permissionService: AdminModuleAccessLevelService,
  ) {}

  @ApiOperation({
    summary: 'Get All Admin Module Access Levels',
  })
  @Get()
  get() {
    return this.permissionService.findAll();
  }
}
