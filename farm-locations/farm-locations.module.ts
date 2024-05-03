import { Module } from '@nestjs/common';
import { FarmLocationsService } from './farm-locations.service';
import { FarmLocationsController } from './farm-locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmLocation } from './entities/farm-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FarmLocation])],
  controllers: [FarmLocationsController],
  providers: [FarmLocationsService],
  exports: [FarmLocationsService],
})
export class FarmLocationsModule {}
