import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { DashboardDto } from 'src/messages/dto/dashboard.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { DashboardOrdersByCountryDto } from './dto/dashboard-orders-bycountry.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { ReportSearchOptionsDownloadDto } from './dto/report-search-options-download.dto';
import { SearchOrdersOptionsDto } from './dto/search-orders-options.dto';
import { SearchValuableUserDto } from './dto/search-valuable-user.dto';
import { ValuableUserResponse } from './dto/valuable-user-response.dto';
import { ReportService } from './report.service';

@ApiTags('Report')
@Controller({
  path: 'report',
  version: '1',
})
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({
    summary: 'Get Report Order List',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_READ_ONLYALL_REPORTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('orders-list')
  findAll(@Query() searchOrdersOptionsDto: SearchOrdersOptionsDto) {
    return this.reportService.findAll(searchOrdersOptionsDto);
  }

  @ApiOperation({
    summary: 'get orders min and max price',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_READ_ONLYALL_REPORTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('orders-min-max-price')
  async minMaxPrice(@Query() searchOrdersOptionsDto: SearchOrdersOptionsDto) {
    return this.reportService.minMaxPrice(searchOrdersOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Valuable Users',
  })
  @ApiOkResponse({
    description: '',
    type: ValuableUserResponse,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_READ_ONLYALL_REPORTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('valuable-users')
  async findValuableUsers(
    @Query() searchOptionsDto: SearchValuableUserDto,
  ): Promise<ValuableUserResponse[]> {
    return this.reportService.findValuableUsers(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_VIEW_REPORTS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard')
  getDashboradData(@Query() optionsDto: DashboardDto) {
    return this.reportService.getReportsDashboardData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Most Popular Locations',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_VIEW_REPORTS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('most-popular-locations')
  getPopularLocations(@Query() optionsDto: DashboardDto) {
    return this.reportService.getPopularLocations(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Most Valuable Users',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_VIEW_REPORTS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('most-valuable-users')
  getValuableUsers(@Query() optionsDto: DashboardDto) {
    return this.reportService.getValuableUsers(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Order History Chart',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_VIEW_REPORTS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('order-history-chart')
  getOrderHistoryChart(@Query() optionsDto: DashboardDto) {
    return this.reportService.getOrderHistoryChart(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Report Breakdown Chart',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_VIEW_REPORTS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('report-breakdown-chart')
  getReportBreakdownChart(@Query() optionsDto: DashboardDto) {
    return this.reportService.getReportBreakdownChart(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Report Orders By Country Id',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_READ_ONLYALL_REPORTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('orders-by-country')
  getOrdersByCountryId(@Query() optionsDto: DashboardOrdersByCountryDto) {
    return this.reportService.getOrdersByCountryId(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Report',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_DASHBOARD_EXPORT_FUNCTION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.reportService.getDashboradReportData(optionsDto);
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Get Details',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_EDIT_REPORT_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':id')
  async findDetails(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @ApiOperation({
    summary: 'Send Report',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_SEND_RESEND_REPORTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('send-report/:orderProductId')
  sendReport(
    @Param('orderProductId', new ParseUUIDPipe()) orderProductId: string,
  ) {
    return this.reportService.sendReport(orderProductId);
  }

  @ApiOperation({
    summary: 'Cancel Report',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_CANCEL_REPORTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('cancel-report/:orderProductId')
  cancelReport(@Param('orderProductId') orderProductId: string) {
    return this.reportService.cancelReport(orderProductId);
  }

  @ApiOperation({
    summary: 'Share Report',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_SHARE_REPORTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('share-report/:orderProductId/:emailId')
  shareReport(
    @Param('orderProductId') orderProductId: string,
    @Param('emailId') emailId: string,
  ) {
    return this.reportService.shareReport(orderProductId, emailId);
  }

  @ApiOperation({
    summary: 'Download Order list ',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_EXPORT_LISTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/download-list')
  async download(
    @Query() reportSearchOptionsDownloadDto: ReportSearchOptionsDownloadDto,
  ) {
    return this.reportService.download(reportSearchOptionsDownloadDto);
  }
}
