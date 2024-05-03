import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProductItem } from './entities/order-product-item.entity';
import { OrderProductItemsService } from './order-product-items.service';
import { OrderProductItemsController } from './order-product-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderProductItem])],
  controllers: [OrderProductItemsController],
  providers: [OrderProductItemsService],
  exports: [OrderProductItemsService],
})
export class OrderProductItemsModule {}
