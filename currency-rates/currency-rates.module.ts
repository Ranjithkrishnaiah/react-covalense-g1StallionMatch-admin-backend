import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyRateController } from './currency-rates.controller';
import { CurrencyRateService } from './currency-rates.service';
import { CurrencyRate } from './entities/currency-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyRate])],
  controllers: [CurrencyRateController],
  providers: [CurrencyRateService],
})
export class CurrencyRateModule {}
