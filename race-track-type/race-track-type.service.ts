import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaceTrackType } from './entities/race-track-type.entity';
import { Request } from 'express';

@Injectable()
export class RaceTrackTypeService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceTrackType)
    private raceTrackTypeRepository: Repository<RaceTrackType>,
  ) {}
  /* Get Race Track Types */
  async findAll() {
    const queryBuilder = await this.raceTrackTypeRepository
      .createQueryBuilder('type')
      .select('type.id, type.displayName,type.trackTypeCategoryId')
      .where("type.displayName IS NOT NULL AND type.displayName !=''")
      .getRawMany();
    return queryBuilder;
  }
}
