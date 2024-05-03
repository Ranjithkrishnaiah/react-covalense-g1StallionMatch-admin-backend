import { forwardRef, Module } from '@nestjs/common';
import { FavouriteStallionsService } from './favourite-stallions.service';
import { FavouriteStallionsController } from './favourite-stallions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteStallion } from './entities/favourite-stallion.entity';
import { StallionsModule } from 'src/stallions/stallions.module';
import { FavouriteStallionsSubscriber } from './favourite-stallion.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavouriteStallion]),
    forwardRef(() => StallionsModule),
  ],
  controllers: [FavouriteStallionsController],
  providers: [FavouriteStallionsService, FavouriteStallionsSubscriber],
  exports: [FavouriteStallionsService],
})
export class FavouriteStallionsModule {}
