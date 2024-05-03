import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { RaceStake } from './entities/race-stake.entity';

@Injectable()
export class RaceStakeService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceStake)
    private raceStakeRepository: Repository<RaceStake>,
  ) {}
  /* Get Race Stakes */
  async findAll() {
    const queryBuilder = await this.raceStakeRepository
      .createQueryBuilder('stake')
      .select('stake.id,stake.displayName')
      .where("stake.displayName IS NOT NULL AND stake.displayName !=''")
      .getRawMany();
    return queryBuilder;
  }
}
