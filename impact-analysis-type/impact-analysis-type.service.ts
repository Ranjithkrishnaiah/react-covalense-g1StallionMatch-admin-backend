import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { ImpactAnalysisType } from './entities/impact-analysis-type.entity';

@Injectable()
export class ImpactAnalysisTypeService {
  constructor(
    @InjectRepository(ImpactAnalysisType)
    private impactAnalysisTypeRepository: Repository<ImpactAnalysisType>,
  ) {}

  //Get all records
  async findAll() {
    let types = await getRepository(ImpactAnalysisType)
      .createQueryBuilder('type')
      .select('type.id as id,type.impactAnalysisType')
      .getRawMany();
    return types;
  }
}
