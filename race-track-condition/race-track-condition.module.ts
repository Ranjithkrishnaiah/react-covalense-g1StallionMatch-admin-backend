import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceTrackCondition } from './entities/race-track-condition.entity';
import { RaceTrackConditionController } from './race-track-condition.controller';
import { RaceTrackConditionService } from './race-track-condition.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceTrackCondition])],
  controllers: [RaceTrackConditionController],
  providers: [RaceTrackConditionService],
})
export class RaceTrackConditionModule {}
