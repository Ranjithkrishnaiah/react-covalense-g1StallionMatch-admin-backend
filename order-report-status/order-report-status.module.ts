import { Module } from '@nestjs/common';
import { OrderReportStatusService } from './order-report-status.service';
import { OrderReportStatusController } from './order-report-status.controller';
import { OrderReportStatus } from './entities/order-report-status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([OrderReportStatus])],
  controllers: [OrderReportStatusController],
  providers: [OrderReportStatusService],
  exports: [OrderReportStatusService],
})
export class OrderReportStatusModule {}
