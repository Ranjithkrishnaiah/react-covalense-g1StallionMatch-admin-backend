import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeightUnit } from './entities/weight-unit.entity';
import { WeightUnitController } from './weight-unit.controller';
import { WeightUnitService } from './weight-unit.service';

@Module({
  imports: [TypeOrmModule.forFeature([WeightUnit])],
  controllers: [WeightUnitController],
  providers: [WeightUnitService],
})
export class WeightUnitModule {}
