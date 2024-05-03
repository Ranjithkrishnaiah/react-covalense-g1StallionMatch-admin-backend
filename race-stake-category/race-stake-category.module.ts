import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceStakeCategory } from './entities/race-stake-category.entity';
import { RaceStakeCategoryController } from './race-stake-category.controller';
import { RaceStakeCategoryService } from './race-stake-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceStakeCategory])],
  controllers: [RaceStakeCategoryController],
  providers: [RaceStakeCategoryService],
})
export class RaceStakeCategoryModule {}
