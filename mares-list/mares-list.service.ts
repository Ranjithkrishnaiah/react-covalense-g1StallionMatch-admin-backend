import { Inject, Injectable, Param, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { MareList } from './entities/mares-list.entity';
import { Request } from 'express';
import { MareListInfo } from 'src/mares-list-info/entities/mare-list-info.entity';
import { FarmsService } from 'src/farms/farms.service';

@Injectable({ scope: Scope.REQUEST })
export class MaresListService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MareList)
    private mareListRepository: Repository<MareList>,
    private farmService: FarmsService,
  ) {}

  //Get all records
  async findAll(@Param('id') id: number) {
    const member = this.request.user;
    let mlcntQuery = getRepository(MareListInfo)
      .createQueryBuilder('mli')
      .select('mli.id, count(marelist.id) maresCount')
      .innerJoin('mli.marelists', 'marelist')
      .groupBy('mli.id');

    const queryBuilder = getRepository(MareListInfo)
      .createQueryBuilder('mli')
      .select(
        'mli.id as mareListInfoId, mli.listname as listname, mli.listFileName, mli.createdOn as uploadedOn, maresCount',
      )
      .innerJoin('(' + mlcntQuery.getQuery() + ')', 'mlcnt', 'mlcnt.id=mli.id')
      .where('mli.createdBy = :createdBy', { createdBy: id });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

   //Get a record by FarmId
  async findByFarmId(@Param('farmId') farmId: string) {
    let record = await this.farmService.getFarmByUuid(farmId);
    let mlcntQuery = getRepository(MareListInfo)
      .createQueryBuilder('mli')
      .select('mli.id, count(marelist.id) maresCount')
      .innerJoin('mli.marelists', 'marelist')
      .groupBy('mli.id');

    const queryBuilder = getRepository(MareListInfo)
      .createQueryBuilder('mli')
      .select(
        'mli.id as mareListInfoId, mli.listname as listname, mli.listFileName, mli.createdOn as uploadedOn, maresCount',
      )
      .innerJoin('(' + mlcntQuery.getQuery() + ')', 'mlcnt', 'mlcnt.id=mli.id')
      .where('mli.farmId = :farmId', { farmId: record.id });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }
}
