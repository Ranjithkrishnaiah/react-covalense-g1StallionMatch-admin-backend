import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelModule } from 'src/excel/excel.module';
import { HorsesModule } from 'src/horses/horses.module';
import { RaceModule } from 'src/race/race.module';
import { Runner } from './entities/runner.entity';
import { RunnerController } from './runner.controller';
import { RunnerService } from './runner.service';
import { RunnerSubscriber } from './runner.subscriber';
import { CurrenciesModule } from 'src/currencies/currencies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Runner]),
    forwardRef(() => RaceModule),
    HorsesModule,
    ExcelModule,
    CurrenciesModule
  ],
  controllers: [RunnerController],
  providers: [RunnerService, RunnerSubscriber],
  exports: [RunnerService],
})
export class RunnerModule {}
