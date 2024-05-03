import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AdminPortalRule } from './entities/admin-portal-rule.entity';
import { CreateRolePermissionDto } from 'src/app-permission/dto/create-role-permission.dto';
import { DeleteRolePermissionDto } from 'src/app-permission/dto/delete-role-permission.dto';

@Injectable({ scope: Scope.REQUEST })
export class AdminPortalRuleService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(AdminPortalRule)
    private apRule: Repository<AdminPortalRule>,
  ) {}

  /* Create a record */
  async create(createData: CreateRolePermissionDto) {
    return await this.apRule.save(this.apRule.create(createData));
  }

  /* Delete a record */
  async delete(deleteData: DeleteRolePermissionDto) {
    return await this.apRule.delete({
      roleId: deleteData.roleId,
      adminModuleAccessLevelId: deleteData.adminModuleAccessLevelId,
    });
  }
}
