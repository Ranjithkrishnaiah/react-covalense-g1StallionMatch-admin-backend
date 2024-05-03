import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyRate } from './entities/currency-rate.entity';

@Injectable()
export class CurrencyRateService {
  constructor(
    @InjectRepository(CurrencyRate)
    private currencyRateRepository: Repository<CurrencyRate>,
  ) {}

  /* Get all Currency Rates */
  findAll() {
    return this.currencyRateRepository.find();
  }

  /* Get Currency Rate By Code */
  async findOne(currencyCode: string) {
    let data = await this.currencyRateRepository.find({
      currencyCode,
    });
    if (data.length > 0) {
      return data[0];
    }
    return;
  }
}
