import {
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable({ scope: Scope.REQUEST })
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findOne(id: number) {
    return await this.roleRepository.find({
      where: { Id: id },
    });
  }

  async findOneByRoleId(id: number) {
    return await this.roleRepository.findOne({
      where: { RoleId: id },
    });
  }

  async findOneByRoleUuid(roleUuid) {
    try {
      const record = await this.roleRepository.findOneOrFail({
        roleUuid: roleUuid,
      });
      if (!record) {
        throw new UnprocessableEntityException('Role not exist!');
      } else {
        return record;
      }
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  async findScopes(memberId: string, permissionKeys: []) {
    return await this.roleRepository.manager.query(
      `EXEC procCheckAdminUserHasPermission 
        @userId=@0,
        @permissionKeys=@1`,
      [memberId, permissionKeys.toString()],
    );
  }

  async userDetailsPermissionRoles() {
    const queryBuilder = await this.roleRepository
      .createQueryBuilder('role')
      .select('role.roleUuid as Id, role.RoleName')
      .andWhere('role.RoleId in (6,7,8,9,10)');
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /*Will check only only 4 roles
    Admin, Developer, Data Audit, Marketing
  */
  async findUserRoleByRoleUuid(roleUuid) {
    try {
      const record = await this.roleRepository.findOneOrFail({
        roleUuid: roleUuid,
      });
      if (!record) {
        throw new UnprocessableEntityException('Role not exist!');
      } else {
        if (
          !['Admin', 'Developer', 'Marketing', 'DataAudit'].includes(
            record.RoleName,
          )
        ) {
          throw new UnprocessableEntityException(
            'Not a valid role to set permissions!',
          );
        }
        return record;
      }
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  async getAllUserRolesForSettings() {
    const queryBuilder = await this.roleRepository
      .createQueryBuilder('role')
      .select('role.roleUuid as Id, role.RoleName')
      .andWhere('role.RoleId in (6,7,8,9)');
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  async getUserRole(userId: number) {
    let record = await this.roleRepository.manager.query(
      `EXEC procGetUserRole 
        @userId=@0`,
      [userId],
    );
    if (!record.length) {
      throw new UnprocessableEntityException('Role not exist!');
    }
    return record[0];
  }
}
