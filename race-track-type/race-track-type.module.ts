import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceTrackType } from './entities/race-track-type.entity';
import { RaceTrackTypeController } from './race-track-type.controller';
import { RaceTrackTypeService } from './race-track-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceTrackType])],
  controllers: [RaceTrackTypeController],
  providers: [RaceTrackTypeService],
})
export class RaceTrackTypeModule {}
