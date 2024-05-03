import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionRequest } from './entities/stallion-request.entity';
import { StallionRequestsController } from './stallion-requests.controller';
import { StallionRequestsService } from './stallion-requests.service';
import { CountryModule } from 'src/country/country.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([StallionRequest]),
   CountryModule,
   CommonUtilsModule,
  ],
  controllers: [StallionRequestsController],
  providers: [StallionRequestsService],
  exports: [StallionRequestsService],
})
export class StallionRequestsModule {}
