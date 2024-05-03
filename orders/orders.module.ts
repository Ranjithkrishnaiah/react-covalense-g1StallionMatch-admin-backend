import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderProductModule } from 'src/order-product/order-product.module';
import { OrderProductItemsModule } from 'src/order-product-items/order-product-items.module';
import { ReportTemplatesModule } from 'src/report-templates/report-templates.module';
import { OrderReportStatusModule } from 'src/order-report-status/order-report-status.module';
import { OrderTransactionModule } from 'src/order-transaction/order-transaction.module';
import { OrderStatusModule } from 'src/order-status/order-status.module';
import { ReportProductItemsModule } from 'src/report-product-items/report-product-items.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    OrderProductModule,
    OrderProductItemsModule,
    ReportTemplatesModule,
    OrderReportStatusModule,
    OrderTransactionModule,
    OrderStatusModule,
    ReportProductItemsModule,
    MessageTemplatesModule,
    NotificationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrderModule {}
