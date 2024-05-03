import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { SearchOptionsDto } from './dto/search-name.dto';
import { RunnerTrainer } from './entities/runner-trainer.entity';

@Injectable()
export class RunnerTrainerService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RunnerTrainer)
    private runnerTrainerRepository: Repository<RunnerTrainer>,
  ) {}
 /* Get Runner Trainers  */
  async findAll(searchOptions: SearchOptionsDto): Promise<RunnerTrainer[]> {
    const queryBuilder = this.runnerTrainerRepository
      .createQueryBuilder('trainer')
      .select('trainer.id ,trainer.displayName');
    if (searchOptions.name) {
      queryBuilder.andWhere('trainer.displayName like :displayName', {
        displayName: `%${searchOptions.name}%`,
      });
    }
    queryBuilder.addOrderBy('trainer.displayName', 'ASC')
    const entities = await queryBuilder.getRawMany();

    return entities;
  }
}
