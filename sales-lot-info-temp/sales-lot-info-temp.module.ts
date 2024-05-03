import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesLotInfoTemp } from './entities/sale-lot-info-temp.entity';
import { SalesLotInfoTempController } from './sales-lot-info-temp.controller';
import { SalesLotInfoTempService } from './sales-lot-info-temp.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesLotInfoTemp])],
  controllers: [SalesLotInfoTempController],
  providers: [SalesLotInfoTempService],
})
export class SalesLotInfoTempModule {}
