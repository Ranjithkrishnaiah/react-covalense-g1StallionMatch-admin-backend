import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RunnerTrainer } from 'src/runner-trainer/entities/runner-trainer.entity';
import { Repository } from 'typeorm';
import { SearchOptionsDto } from './dto/search-name.dto';
import { RunnerJockey } from './entities/runner-jockey.entity';

@Injectable()
export class RunnerJockeyService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RunnerJockey)
    private runnerJockeyRepository: Repository<RunnerJockey>,
  ) { }
  /* Get Jockey List */
  async findAll(searchOptions: SearchOptionsDto): Promise<RunnerTrainer[]> {
    const queryBuilder = this.runnerJockeyRepository
      .createQueryBuilder('jockey')
      .select('jockey.id ,jockey.displayName');
    if (searchOptions.name) {
      queryBuilder.andWhere('jockey.displayName like :displayName', {
        displayName: `%${searchOptions.name}%`,
      });
    }
    queryBuilder.addOrderBy('jockey.displayName', 'ASC')
    const entities = await queryBuilder.getRawMany();

    return entities;
  }
}
