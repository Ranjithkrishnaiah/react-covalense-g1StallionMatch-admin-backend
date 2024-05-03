import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesReportsetting } from './entities/sales-report-settings.entity';
import { SalesReportSettingsController } from './sales-report-settings.controller';
import { SalesReportSettingsService } from './sales-report-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesReportsetting])],
  controllers: [SalesReportSettingsController],
  providers: [SalesReportSettingsService],
})
export class SalesReportSettingsModule {}
