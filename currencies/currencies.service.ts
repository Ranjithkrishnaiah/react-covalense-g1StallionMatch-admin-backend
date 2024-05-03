import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) {}

  /* Get all currencies */
  findAll() {
    return this.currencyRepository.find();
  }

  /* Get a currency */
  findOne(id: number) {
    return this.currencyRepository.findOne({
      id,
    });
  }

  /* Get CurrencyRate By CurrencyId */
  async findCurrencyRateByCurrencyId(id: number) {
    const queryBuilder = this.currencyRepository
      .createQueryBuilder('currency')
      .select('currencyRate.rate, currencyRate.currencyCode')
      .innerJoin(
        'tblCurrencyRate',
        'currencyRate',
        'currencyRate.currencyCode=currency.currencyCode',
      )
      .andWhere('currency.id = :id', { id: id });

    let data = await queryBuilder.getRawOne();
    if (!data) {
      return;
    }
    return data;
  }
}
