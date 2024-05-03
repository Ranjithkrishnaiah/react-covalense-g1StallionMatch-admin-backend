import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { AppPermissionService } from './app-permission.service';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

@ApiTags('App Permissions')
@Controller({
  path: 'app-permission',
  version: '1',
})
@ApiBearerAuth()
export class AppPermissionController {
  constructor(private readonly permissionService: AppPermissionService) {}

  @ApiOperation({
    summary: 'Get All Permissions',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  @ApiOperation({
    summary: 'Get User Permissions',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('user')
  getUserPermissions() {
    return this.permissionService.getAllUserPermissions();
  }

  @ApiOperation({
    summary: 'Get Role Permissions',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: [
      'ADMIN_USER_MANAGEMENT_CREATE_NEW_USER',
      'ADMIN_USER_MANAGEMENT_EDIT_EXISTING_USER',
      'ADMIN_USER_MANAGEMENT_MANAGE_PERMISSION_LEVEL_SETTINGS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('role/:roleId')
  getRolePermissions(@Param('roleId', new ParseUUIDPipe()) roleId: string) {
    return this.permissionService.getRolePermissions(roleId);
  }

  @ApiOperation({
    summary: 'Save Role Permissions',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: [
      'ADMIN_USER_MANAGEMENT_MANAGE_PERMISSION_LEVEL_SETTINGS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('role/:roleId')
  updateRolePermissions(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
    @Body() updateDto: UpdateRolePermissionDto,
  ) {
    return this.permissionService.updateRolePermissions(roleId, updateDto);
  }
}
