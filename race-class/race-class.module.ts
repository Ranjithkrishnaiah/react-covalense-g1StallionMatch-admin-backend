import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceClass } from './entities/race-class.entity';
import { RaceClassController } from './race-class.controller';
import { RaceClassService } from './race-class.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceClass])],
  controllers: [RaceClassController],
  providers: [RaceClassService],
})
export class RaceClassModule {}
