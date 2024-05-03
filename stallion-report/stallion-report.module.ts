import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionReportController } from './stallion-report.controller';
import { StallionsModule } from 'src/stallions/stallions.module';

@Module({
  imports: [StallionsModule],
  controllers: [StallionReportController],
  // providers: [StallionReportService],
  // exports: [StallionReportService]
})
export class StallionReportModule {}
