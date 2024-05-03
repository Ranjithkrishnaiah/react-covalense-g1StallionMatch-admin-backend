import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesCompany } from './entities/sales-company.entity';
import { SalesCompanyController } from './sales-company.controller';
import { SalesCompanyService } from './sales-company.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesCompany])],
  controllers: [SalesCompanyController],
  providers: [SalesCompanyService],
})
export class SalesCompanyModule {}
