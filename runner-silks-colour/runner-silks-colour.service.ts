import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RunnerSilksColour } from './entities/runner-silk-colours.entity';
import { Request } from 'express';

@Injectable()
export class RunnerSilksColourService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RunnerSilksColour)
    private runnerOwnerRepository: Repository<RunnerSilksColour>,
  ) {}
  
 /* Get Runner Silks Colour */
  async findAll() {
    return this.runnerOwnerRepository.find({});
  }
}
