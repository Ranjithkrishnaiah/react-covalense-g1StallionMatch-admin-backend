import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorsesModule } from 'src/horses/horses.module';
import { SalesLot } from './entities/sales-lots.entity';
import { SalesLotsController } from './sales-lots.controller';
import { SalesLotsService } from './sales-lots.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesLot]), HorsesModule],
  controllers: [SalesLotsController],
  providers: [SalesLotsService],
})
export class SalesLotsModule {}
