import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunnerSilksColour } from './entities/runner-silk-colours.entity';
import { RunnerSilksColourController } from './runner-silks-colour.controller';
import { RunnerSilksColourService } from './runner-silks-colour.service';

@Module({
  imports: [TypeOrmModule.forFeature([RunnerSilksColour])],
  controllers: [RunnerSilksColourController],
  providers: [RunnerSilksColourService],
})
export class RunnerSilksColourModule {}
