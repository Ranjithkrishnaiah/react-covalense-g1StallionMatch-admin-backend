import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunnerTrainer } from './entities/runner-trainer.entity';
import { RunnerTrainerController } from './runner-trainer.controller';
import { RunnerTrainerService } from './runner-trainer.service';

@Module({
  imports: [TypeOrmModule.forFeature([RunnerTrainer])],
  controllers: [RunnerTrainerController],
  providers: [RunnerTrainerService],
})
export class RunnerTrainerModule {}
