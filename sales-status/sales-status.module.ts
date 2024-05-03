import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesStatus } from './entities/sales-status.entity';
import { SalesStatusController } from './sales-status.controller';
import { SalesStatusService } from './sales-status.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesStatus])],
  controllers: [SalesStatusController],
  providers: [SalesStatusService],
})
export class SalesStatusModule {}
