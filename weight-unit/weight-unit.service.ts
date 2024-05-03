import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { WeightUnit } from './entities/weight-unit.entity';

@Injectable()
export class WeightUnitService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(WeightUnit)
    private weightRepository: Repository<WeightUnit>,
  ) { }
  /* Get All Weight Units */
  async findAll() {
    return this.weightRepository.find({});
  }
}
