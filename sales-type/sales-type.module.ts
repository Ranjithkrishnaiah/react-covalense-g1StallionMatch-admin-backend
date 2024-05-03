import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salestype } from './entities/sales-type.entity';
import { SalesTypeController } from './sales-type.controller';
import { SalesTypeService } from './sales-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([Salestype])],
  controllers: [SalesTypeController],
  providers: [SalesTypeService],
})
export class SalesTypeModule {}
