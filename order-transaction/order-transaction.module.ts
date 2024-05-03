import { Module } from '@nestjs/common';
import { OrderTransactionService } from './order-transaction.service';
import { OrderTransactionsController } from './order-transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTransaction } from './entities/order-transaction.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderTransaction]), ProductsModule],
  controllers: [OrderTransactionsController],
  providers: [OrderTransactionService],
  exports: [OrderTransactionService],
})
export class OrderTransactionModule {}
