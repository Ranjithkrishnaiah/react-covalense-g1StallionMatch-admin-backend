import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunnerJockey } from './entities/runner-jockey.entity';
import { RunnerJockeyController } from './runner-jockey.controller';
import { RunnerJockeyService } from './runner-jockey.service';

@Module({
  imports: [TypeOrmModule.forFeature([RunnerJockey])],
  controllers: [RunnerJockeyController],
  providers: [RunnerJockeyService],
})
export class RunnerJockeyModule {}
