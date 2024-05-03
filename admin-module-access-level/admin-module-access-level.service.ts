import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminModuleAccessLevel } from './entities/admin-module-access-level.entity';
import { AdminModules } from './entities/admin-modules.entity';
import { getRepository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class AdminModuleAccessLevelService {
  constructor(
    @InjectRepository(AdminModules)
    @InjectRepository(AdminModuleAccessLevel)
    private adminModulesRepository: Repository<AdminModules>,
  ) {}

  /* Get All Admin Module Access Level */
  async findAll() {
    const queryBuilder = this.adminModulesRepository
      .createQueryBuilder('adminModule')
      .select('adminModule.id as moduleId, adminModule.moduleName as label');

    const entities = await queryBuilder.getRawMany();

    const adminModuleAccessLevelqueryBuilder = await getRepository(
      AdminModuleAccessLevel,
    )
      .createQueryBuilder('adminModuleAccessLevel')
      .select(
        'adminModuleAccessLevel.id as childId, adminModuleAccessLevel.adminModuleId as moduleId, adminModuleAccessLevel.accessLevel as label',
      );

    const adminModuleAccessLevelEntities =
      await adminModuleAccessLevelqueryBuilder.getRawMany();

    const response = entities.map((module) => {
      return {
        ...module,
        children: adminModuleAccessLevelEntities
          .filter((res) => res.moduleId == module.moduleId)
          .map((res) => {
            return {
              childId: 'ch-' + res.childId,
              moduleId: module.moduleId,
              label: res.label,
              expanded: true,
            };
          }),
      };
    });
    return response;
  }
}
