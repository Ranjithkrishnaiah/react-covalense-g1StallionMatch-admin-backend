import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelModule } from 'src/excel/excel.module';
import { HorsesModule } from 'src/horses/horses.module';
import { RaceHorse } from './entities/race-horse.entity';
import { RaceHorseController } from './race-horse.controller';
import { RaceHorseService } from './race-horse.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceHorse]), HorsesModule, ExcelModule],
  controllers: [RaceHorseController],
  providers: [RaceHorseService],
})
export class RaceHorseModule {}
