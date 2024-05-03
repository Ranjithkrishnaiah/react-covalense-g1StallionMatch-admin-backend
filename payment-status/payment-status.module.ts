import { Module } from '@nestjs/common';
import { PaymentStatusService } from './payment-status.service';
import { PaymentStatusController } from './payment-status.controller';

@Module({
  controllers: [PaymentStatusController],
  providers: [PaymentStatusService],
})
export class PaymentStatusModule {}
