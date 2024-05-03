import { Module } from '@nestjs/common';
import { FavouriteMareService } from './favourite-mares.service';
import { FavouriteMaresController } from './favourite-mares.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteMare } from './entities/favourite-mare.entity';
import { HorsesModule } from 'src/horses/horses.module';

@Module({
  imports: [TypeOrmModule.forFeature([FavouriteMare]), HorsesModule],
  controllers: [FavouriteMaresController],
  providers: [FavouriteMareService],
  exports: [FavouriteMareService],
})
export class FavouriteMaresModule {}
