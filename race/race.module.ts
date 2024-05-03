import { forwardRef, Module } from '@nestjs/common';
import { RaceService } from './race.service';
import { RaceController } from './race.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Race } from './entities/race.entity';
import { RunnerModule } from 'src/runner/runner.module';
import { RaceSubscriber } from './race.subscriber';
import { ExcelModule } from 'src/excel/excel.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { CountryModule } from 'src/country/country.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Race]),
    forwardRef(() => RunnerModule),
    ExcelModule,
    CommonUtilsModule,
    CountryModule,
  ],

  providers: [RaceService, RaceSubscriber],
  controllers: [RaceController],
  exports: [RaceService],
})
export class RaceModule {}
