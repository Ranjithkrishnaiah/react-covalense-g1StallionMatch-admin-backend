import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppPermissionService } from './app-permission.service';
import { AppPermissionController } from './app-permission.controller';
import { AdminModuleAccessLevel } from 'src/admin-module-access-level/entities/admin-module-access-level.entity';
import { RoleModule } from 'src/role/role.module';
import { AdminUserCustomRolePermissionModule } from 'src/admin-user-custom-role-permission/admin-user-custom-role-permission.module';
import { AdminPortalRuleModule } from 'src/admin-portal-rule/admin-portal-rule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminModuleAccessLevel]),
    RoleModule,
    AdminUserCustomRolePermissionModule,
    AdminPortalRuleModule,
  ],
  controllers: [AppPermissionController],
  providers: [AppPermissionService],
  exports: [AppPermissionService],
})
export class AppPermissionModule {}
