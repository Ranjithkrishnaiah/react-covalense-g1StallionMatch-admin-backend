import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { CountryModule } from 'src/country/country.module';
import { ExcelModule } from 'src/excel/excel.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesModule } from 'src/horses/horses.module';
import { OrderTransactionModule } from 'src/order-transaction/order-transaction.module';
import { SalesModule } from 'src/sales/sales.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { HtmlToPdfService } from './html-to-pdf.service';
import { ReportBroodmareAffinityService } from './report-broodmare-affinity.service';
import { ReportSalesCatelogueService } from './report-sales-catelogue.service';
import { ReportStallionAffinityService } from './report-stallion-affinity.service';
import { ReportStallionShortlistService } from './report-stallion-shortlist.service';
import { ReportTemplatesCommonService } from './report-templates-common.service';
import { ReportTemplatesController } from './report-templates.controller';
import { ReportTemplatesService } from './report-templates.service';

@Module({
  imports: [
    ExcelModule,
    HorsesModule,
    CommonUtilsModule,
    FileUploadsModule,
    StallionsModule,
    OrderTransactionModule,
    SalesModule,
    TypeOrmModule.forFeature([Horse]),
    CountryModule,
  ],
  controllers: [ReportTemplatesController],
  providers: [
    ReportTemplatesService,
    HtmlToPdfService,
    ReportStallionShortlistService,
    ReportTemplatesCommonService,
    ReportBroodmareAffinityService,
    ReportSalesCatelogueService,
    ReportStallionAffinityService,
  ],
  exports: [ReportTemplatesService],
})
export class ReportTemplatesModule {}
