import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { RaceType } from './entities/race-type.entity';

@Injectable()
export class RaceTypeService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceType)
    private raceTypeRepository: Repository<RaceType>,
  ) {}

  /* Get Race Types */
  async findAll() {
    const queryBuilder = await this.raceTypeRepository
      .createQueryBuilder('type')
      .select('type.id, type.displayName')
      .where("type.displayName IS NOT NULL AND type.displayName !=''")
      .getRawMany();
    return queryBuilder;
  }
}
