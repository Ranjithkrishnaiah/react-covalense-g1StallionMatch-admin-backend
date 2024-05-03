import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { RaceTrackCondition } from './entities/race-track-condition.entity';

@Injectable()
export class RaceTrackConditionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceTrackCondition)
    private raceTrackConditionRepository: Repository<RaceTrackCondition>,
  ) {}

  /* Get Race Track Conditions  */
  async findAll() {
    const queryBuilder = await this.raceTrackConditionRepository
      .createQueryBuilder('condition')
      .select('condition.id, condition.displayName')
      .where("condition.displayName IS NOT NULL AND condition.displayName !=''")
      .getRawMany();
    return queryBuilder;
  }
}
