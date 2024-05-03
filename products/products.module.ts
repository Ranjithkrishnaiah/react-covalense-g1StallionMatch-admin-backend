import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { ExcelModule } from 'src/excel/excel.module';
import { PricingModule } from 'src/pricing/pricing.module';
import { Product } from './entities/product.entity';
import { ProductsSubscriber } from './products-subscribers';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    PricingModule,
    ExcelModule,
    CommonUtilsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsSubscriber],
  exports: [ProductsService],
})
export class ProductsModule {}
