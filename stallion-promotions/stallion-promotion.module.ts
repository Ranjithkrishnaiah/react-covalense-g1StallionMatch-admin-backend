import { Module, forwardRef } from '@nestjs/common';
import { StallionPromotionService } from './stallion-promotions.service';
import { StallionPromotionController } from './stallion-promotions.controller';
import { StallionPromotion } from './entities/stallion-promotion.entity';
import { StallionsModule } from 'src/stallions/stallions.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([StallionPromotion]),

    forwardRef(() => StallionsModule),
  ],
  controllers: [StallionPromotionController],
  providers: [StallionPromotionService],
  exports: [StallionPromotionService],
})
export class StallionPromotionModule {}
