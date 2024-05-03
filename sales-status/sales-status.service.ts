import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesStatus } from './entities/sales-status.entity';

@Injectable()
export class SalesStatusService {
  constructor(
    @InjectRepository(SalesStatus)
    private salesStatusRepository: Repository<SalesStatus>,
  ) { }

  /* Get All Sales-Status */
  async findAll() {
    const queryBuilder = await this.salesStatusRepository
      .createQueryBuilder('sales')
      .select('sales.id ,sales.status')
      .getRawMany();
    return queryBuilder;
  }
}
