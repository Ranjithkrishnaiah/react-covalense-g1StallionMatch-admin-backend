import { Module } from '@nestjs/common';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { ExcelModule } from 'src/excel/excel.module';
import { GoogleAnalyticsModule } from 'src/google-analytics/google-analytics.module';
import { AppDashboardController } from './app-dashboard.controller';
import { AppDashboardService } from './app-dashboard.service';

@Module({
  imports: [ExcelModule, GoogleAnalyticsModule, CommonUtilsModule],
  controllers: [AppDashboardController],
  providers: [AppDashboardService],
})
export class AppDashboardModule {}
