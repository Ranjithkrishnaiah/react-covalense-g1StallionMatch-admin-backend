import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from './role.gaurd';
import { RoleService } from './role.service';

@ApiBearerAuth()
@ApiTags('Role')
@Controller({
  path: 'roles',
  version: '1',
})
export class RoleController {
  constructor(private readonly rolesService: RoleService) {}
  @ApiOperation({
    summary: 'Get All Roles',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  get() {
    return this.rolesService.userDetailsPermissionRoles();
  }

  @ApiOperation({
    summary: 'Get All User Roles For Settings',
  })
  @SetMetadata('api', {
    permissions: ['ADMIN_USER_MANAGEMENT_MANAGE_PERMISSION_LEVEL_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('settings')
  getAllUserRolesForSettings() {
    return this.rolesService.getAllUserRolesForSettings();
  }
}
