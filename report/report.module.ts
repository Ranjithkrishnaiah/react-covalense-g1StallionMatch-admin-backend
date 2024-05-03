import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { ExcelModule } from 'src/excel/excel.module';
import { MailModule } from 'src/mail/mail.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { OrderReportStatus } from 'src/order-report-status/entities/order-report-status.entity';
import { OrderReportStatusModule } from 'src/order-report-status/order-report-status.module';
import { OrderStatusModule } from 'src/order-status/order-status.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderReportStatus]),
    OrderReportStatusModule,
    ExcelModule,
    MailModule,
    NotificationsModule,
    MessageTemplatesModule,
    CommonUtilsModule,
    OrderStatusModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
