import { Module } from '@nestjs/common';
import { FavouriteFarmsService } from './favourite-farms.service';
import { FavouriteFarmsController } from './favourite-farms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteFarm } from './entities/favourite-farm.entity';
import { FarmsModule } from 'src/farms/farms.module';

@Module({
  imports: [TypeOrmModule.forFeature([FavouriteFarm]), FarmsModule],
  controllers: [FavouriteFarmsController],
  providers: [FavouriteFarmsService],
  exports: [FavouriteFarmsService],
})
export class FavouriteFarmsModule {}
