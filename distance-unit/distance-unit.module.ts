import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistanceUnitController } from './distance-unit.controller';
import { DistanceUnitService } from './distance-unit.service';
import { DistanceUnit } from './entities/distance-unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DistanceUnit])],
  controllers: [DistanceUnitController],
  providers: [DistanceUnitService],
})
export class DistanceUnitModule {}
