import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserCustomRolePermissionService } from './admin-user-custom-role-permission.service';
import { AdminUserCustomRolePermission } from './entities/admin-user-custom-role-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUserCustomRolePermission])],
  controllers: [],
  providers: [AdminUserCustomRolePermissionService],
  exports: [AdminUserCustomRolePermissionService],
})
export class AdminUserCustomRolePermissionModule {}
