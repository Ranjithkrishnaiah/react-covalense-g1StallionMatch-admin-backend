import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { RaceAgeRestriction } from './age-restriction.entity';

@Injectable()
export class RaceAgeRestrictionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceAgeRestriction)
    private raceAgeRestrictionRepository: Repository<RaceAgeRestriction>,
  ) {}
  /* Get Race Age Restriction */
  async findAll() {
    return this.raceAgeRestrictionRepository.find({});
  }
}
