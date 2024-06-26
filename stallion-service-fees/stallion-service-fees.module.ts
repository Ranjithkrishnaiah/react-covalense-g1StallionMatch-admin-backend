import { Module } from '@nestjs/common';
import { StallionServiceFeesService } from './stallion-service-fees.service';
import { StallionServiceFeesController } from './stallion-service-fees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionServiceFee } from './entities/stallion-service-fee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StallionServiceFee])],
  controllers: [StallionServiceFeesController],
  providers: [StallionServiceFeesService],
  exports: [StallionServiceFeesService],
})
export class StallionServiceFeesModule {}
