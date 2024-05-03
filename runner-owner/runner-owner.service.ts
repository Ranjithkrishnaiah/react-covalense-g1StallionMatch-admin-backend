import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RunnerOwner } from './entities/runner-owner.entity';
import { Request } from 'express';
import { SearchOptionsDto } from './dto/search-name.dto';

@Injectable()
export class RunnerOwnerService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RunnerOwner)
    private runnerOwnerRepository: Repository<RunnerOwner>,
  ) {}
/* Get Runner Owner List */
  async findAll(searchOptions: SearchOptionsDto): Promise<RunnerOwner[]> {
    const queryBuilder = this.runnerOwnerRepository
      .createQueryBuilder('owner')
      .select('owner.id ,owner.displayName');
    if (searchOptions.name) {
      queryBuilder.andWhere('owner.displayName like :displayName', {
        displayName: `%${searchOptions.name}%`,
      });
    }
    queryBuilder.addOrderBy('owner.displayName', 'ASC')
    const entities = await queryBuilder.getRawMany();
    return entities;
  }
}
