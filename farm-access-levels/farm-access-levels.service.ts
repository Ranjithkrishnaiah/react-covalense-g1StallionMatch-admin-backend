import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmAccessLevel } from './entities/farm-access-level.entity';

@Injectable()
export class FarmAccessLevelsService {
  constructor(
    @InjectRepository(FarmAccessLevel)
    private farmAccessLevelRepository: Repository<FarmAccessLevel>,
  ) {}

  //Get all farm access levels
  async getAllAccessLevels() {
    const queryBuilder = this.farmAccessLevelRepository
      .createQueryBuilder('access')
      .select(
        'access.id as id, access.accessName as accessName,access.roleId as roleId',
      );
    return queryBuilder.getRawMany();
  }
}
