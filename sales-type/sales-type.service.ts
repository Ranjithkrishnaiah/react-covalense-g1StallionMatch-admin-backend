import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salestype } from './entities/sales-type.entity';

@Injectable()
export class SalesTypeService {
  constructor(
    @InjectRepository(Salestype)
    private salesTypeRepository: Repository<Salestype>,
  ) { }
  /* Get All Sales-Type */
  async findAll() {
    const entities = await this.salesTypeRepository
      .createQueryBuilder('sales')
      .select('sales.id ,sales.salesTypeName')
      .getRawMany();
    return entities;
  }
}
