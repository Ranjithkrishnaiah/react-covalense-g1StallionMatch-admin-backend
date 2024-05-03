import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionRetiredReasonsRepository } from './repository/stallion-retired-reasons.repository';
import { StallionRetiredReasonsService } from './service/stallion-retired-reasons.service';
import { StallionRetiredReasonsController } from './stallion-retired-reasons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StallionRetiredReasonsRepository])],
  controllers: [StallionRetiredReasonsController],
  providers: [StallionRetiredReasonsService],
})
export class StallionRetiredReasonsModule {}
