import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { ExcelService } from 'src/excel/excel.service';
import { ReportTemplatesService } from './report-templates.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Report Templates')
@Controller({
  path: 'report-templates',
  version: '1',
})
export class ReportTemplatesController {
  constructor(
    private reportTemplatesService: ReportTemplatesService,
    private excelService: ExcelService,
  ) {}

  @Get('broodmare-sire/:mareId/:stallionIds')
  async generateBroodMareSireReport(
    @Param('mareId', new ParseUUIDPipe()) mareId: string,
    @Param('stallionIds') stallionIds: string,
    @Param('fullName') fullName: string,
  ) {
    return await this.reportTemplatesService.generateBroodMareSireReport(
      mareId,
      stallionIds,
      {},
      fullName,
    );
  }

  @Get('sm-shortlist/:mareId/:stallionIds')
  async generateStallionMatchShortlistReport(
    @Param('mareId', new ParseUUIDPipe()) mareId: string,
    @Param('stallionIds') stallionIds: string,
    @Param('fullName') fullName: string,
  ) {
    return await this.reportTemplatesService.generateStallionMatchShortlistReport(
      mareId,
      stallionIds,
      {},
      fullName,
    );
  }

  @Get('sm-pro/:mareId/:stallionIds')
  async generateStallionMatchProReport(
    @Param('mareId', new ParseUUIDPipe()) mareId: string,
    @Param('stallionIds') stallionIds: string,
    @Param('fullName') fullName: string,
  ) {
    return await this.reportTemplatesService.generateStallionMatchProReport(
      mareId,
      stallionIds,
      {},
      fullName,
    );
  }

  @Get('broodmare-affinity/:mareId/:countryId')
  async generateBroodmareAffinityReport(
    @Param('mareId', new ParseUUIDPipe()) mareId: string,
    @Param('countryId') countryId: number,
    @Param('fullName') fullName: string,
    @Param('email') email: string,
  ) {
    return await this.reportTemplatesService.generateBroodmareAffinityReport(
      mareId,
      countryId,
      {},
      fullName,
      email,
    );
  }

  @Get('sales-catelogue/:orderProductId')
  async generateSalesCatelogueReport(
    @Param('fullName') fullName: string,
    @Param('orderProductId') orderProductId: number,
  ) {
    return await this.reportTemplatesService.generateSalesCatelogueReport(
      orderProductId,
      fullName,
    );
  }

  @Get('stallion-breeding-stock-sale/:orderProductId')
  async generateStallionBreedingStockSaleReport(
    @Param('fullName') fullName: string,
    @Param('orderProductId') orderProductId: number,
  ) {
    return await this.reportTemplatesService.generateStockSaleReport(
      orderProductId,
      fullName,
    );
  }

  @Get('stallion-affinity/:stallionId')
  async generateStallionAffinityReport(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Param('fullName') fullName: string,
    @Param('email') email: string,
  ) {
    return await this.reportTemplatesService.generateStallionAffinityReport(
      stallionId,
      {},
      fullName,
      email,
    );
  }

  @Get('excel')
  async generateExcel(@Res() res: Response) {
    let file = await this.excelService.generateReport(
      'Sample',
      [
        { header: 'Id', key: '_id', width: 30 },
        { header: 'Name', key: 'name', width: 30 },
      ],
      [
        { _id: 1, name: 'This Is' },
        { _id: 2, name: 'A Sample' },
      ],
    );
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }
}
