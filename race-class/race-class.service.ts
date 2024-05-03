import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { RaceClass } from './entities/race-class.entity';

@Injectable()
export class RaceClassService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceClass)
    private raceClassRepository: Repository<RaceClass>,
  ) {}

  /* Get Race Classes */
  async findAll() {
    const queryBuilder = await this.raceClassRepository
      .createQueryBuilder('class')
      .select('class.id,class.displayName')
      .getRawMany();
    return queryBuilder;
  }
}
