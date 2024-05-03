import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MareRequest } from './entities/mare-requests.entity';
import { MareRequestsController } from './mare-requests.controller';
import { MareRequestsService } from './mare-requests.service';
import { CountryModule } from 'src/country/country.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([MareRequest]),
   CountryModule,
   CommonUtilsModule,
  ],
  controllers: [MareRequestsController],
  providers: [MareRequestsService],
  exports: [MareRequestsService],
})
export class MareRequestsModule {}
