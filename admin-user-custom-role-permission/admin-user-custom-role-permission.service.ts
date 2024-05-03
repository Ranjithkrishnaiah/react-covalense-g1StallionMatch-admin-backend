import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AdminUserCustomRolePermission } from './entities/admin-user-custom-role-permission.entity';
import { CreateDto } from './dto/create.dto';
import { DeleteDto } from './dto/delete.dto';

@Injectable({ scope: Scope.REQUEST })
export class AdminUserCustomRolePermissionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(AdminUserCustomRolePermission)
    private aucrPermission: Repository<AdminUserCustomRolePermission>,
  ) {}

  /* Create a record */
  async create(createData: CreateDto) {
    return await this.aucrPermission.save(
      this.aucrPermission.create(createData),
    );
  }

  /* Delete a record */
  async delete(deleteData: DeleteDto) {
    return await this.aucrPermission.delete({
      memberId: deleteData.memberId,
      adminModuleAccessLevelId: deleteData.adminModuleAccessLevelId,
    });
  }
}
