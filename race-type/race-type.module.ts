import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceType } from './entities/race-type.entity';
import { RaceTypeController } from './race-type.controller';
import { RaceTypeService } from './race-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceType])],
  controllers: [RaceTypeController],
  providers: [RaceTypeService],
})
export class RaceTypeModule {}
