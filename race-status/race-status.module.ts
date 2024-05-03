import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceStatus } from './entities/race-status.entity';
import { RaceStatusController } from './race-status.controller';
import { RaceStatusService } from './race-status.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceStatus])],
  controllers: [RaceStatusController],
  providers: [RaceStatusService],
})
export class RaceStatusModule { }
