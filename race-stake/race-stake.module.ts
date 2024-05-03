import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceStake } from './entities/race-stake.entity';
import { RaceStakeController } from './race-stake.controller';
import { RaceStakeService } from './race-stake.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceStake])],
  controllers: [RaceStakeController],
  providers: [RaceStakeService],
})
export class RaceStakeModule {}
