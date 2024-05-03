import { Module } from '@nestjs/common';
import { PromoCodeService } from './promo-codes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCodesSubscriber } from './promo-codes-subscribers';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode])],
  controllers: [PromoCodesController],
  providers: [PromoCodeService, PromoCodesSubscriber],
  exports: [PromoCodeService],
})
export class PromoCodesModule {}
