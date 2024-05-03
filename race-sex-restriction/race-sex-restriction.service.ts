import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { RaceSexRestriction } from './entities/race-sex-restriction.entity';

@Injectable()
export class RaceSexRestrictionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceSexRestriction)
    private raceSexRepository: Repository<RaceSexRestriction>,
  ) {}
  /* Get Race Sex Restriction */
  async findAll() {
    return this.raceSexRepository.find({});
  }
}
