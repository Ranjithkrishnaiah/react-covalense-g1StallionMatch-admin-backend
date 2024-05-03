import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesCompany } from './entities/sales-company.entity';

@Injectable()
export class SalesCompanyService {
  constructor(
    @InjectRepository(SalesCompany)
    private salesCompanyRepository: Repository<SalesCompany>,
  ) {}
  /* Get All Sales-Company */
  async findAll() {
    const entities = await this.salesCompanyRepository
      .createQueryBuilder('sales')
      .select('sales.id ,sales.salescompanyName')
      .getRawMany();
    return entities;
  }
}
