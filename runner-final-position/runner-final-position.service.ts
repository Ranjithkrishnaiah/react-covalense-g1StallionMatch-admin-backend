import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { FinalPosition } from './entities/runner-final-position.entity';

@Injectable()
export class RunnerFinalPositionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FinalPosition)
    private finalPositionRepository: Repository<FinalPosition>,
  ) {}
/*  Get Final Positions*/
  async findAll() {
    return this.finalPositionRepository.find({ select: ['id', 'displayName'] });
  }
}
