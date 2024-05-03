import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaceStakeCategory } from './entities/race-stake-category.entity';

@Injectable()
export class RaceStakeCategoryService {
  constructor(
    @InjectRepository(RaceStakeCategory)
    private raceStakeRepository: Repository<RaceStakeCategory>,
  ) {}

  /* Get Race Stakes */
  async findAll() {
    const queryBuilder = await this.raceStakeRepository
      .createQueryBuilder('stake')
      .select('stake.raceStakeCategoryName as id, stake.raceStakeCategoryName AS displayName')
      .where("stake.raceStakeCategoryName != 'Non-Stakes'")
      .orderBy("stake.id", 'DESC')
      .getRawMany();
    return queryBuilder;
  }
}
