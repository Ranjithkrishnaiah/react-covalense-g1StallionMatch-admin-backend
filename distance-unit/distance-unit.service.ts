import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistanceUnit } from './entities/distance-unit.entity';
import { Request } from 'express';

@Injectable()
export class DistanceUnitService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(DistanceUnit)
    private distanceUnitRepository: Repository<DistanceUnit>,
  ) {}

  //Get all distance units
  async findAll() {
    return this.distanceUnitRepository.query(
      'Select id,distanceUnit,distanceCode FROM tblDistanceUnit',
    );
  }
}
