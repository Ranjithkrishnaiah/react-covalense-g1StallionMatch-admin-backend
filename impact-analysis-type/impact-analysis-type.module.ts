import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImpactAnalysisType } from './entities/impact-analysis-type.entity';
import { ImpactAnalysisTypeController } from './impact-analysis-type.controller';
import { ImpactAnalysisTypeService } from './impact-analysis-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImpactAnalysisType])],
  controllers: [ImpactAnalysisTypeController],
  providers: [ImpactAnalysisTypeService],
})
export class ImpactAnalysisTypeModule {}
