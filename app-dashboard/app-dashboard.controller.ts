import {
  Controller,
  Get,
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
import { RoleGuard } from 'src/role/role.gaurd';
import { AppDashboardService } from './app-dashboard.service';
import { AppDashboardDto } from './dto/app-dashboard.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { TopVisitedFarmsDto } from './dto/top-visited-farms.dto';

@ApiTags('App Dashboard')
@Controller({
  path: 'app-dashboard',
  version: '1',
})
export class AppDashboardController {
  constructor(private readonly appDashboardService: AppDashboardService) {}

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['STALLION_MATCH_DEFAULT_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  getDashboradData(@Query() optionsDto: AppDashboardDto) {
    return this.appDashboardService.getDashboardData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get To Visited Farms',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['STALLION_MATCH_DEFAULT_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('top-visited-farms')
  getTopVisitedFarms(@Query() optionsDto: TopVisitedFarmsDto) {
    return this.appDashboardService.getTopVisitedFarms(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Total Registrations',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['STALLION_MATCH_DEFAULT_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('total-registrations')
  getTotalRegistration(@Query() optionsDto: AppDashboardDto) {
    return this.appDashboardService.getTotalRegistrations(optionsDto);
  }

  @ApiOperation({
    summary: 'Get New Customers',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['STALLION_MATCH_DEFAULT_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('new-customers')
  getNewCustomers(@Query() optionsDto: AppDashboardDto) {
    return this.appDashboardService.getNewCustomers(optionsDto);
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
    permissions: ['STALLION_MATCH_DEFAULT_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.appDashboardService.getDashboradReportData(
      optionsDto,
    );
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Get Dashboard - Visitors Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['STALLION_MATCH_DEFAULT_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-visitors')
  getDashboradSessionsData(@Query() optionsDto: AppDashboardDto) {
    return this.appDashboardService.getDashboradVisitorData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard - Visitors Statistics Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['STALLION_MATCH_DEFAULT_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-visitors-statistics')
  getDashboradVisitorStatisticsData(@Query() optionsDto: AppDashboardDto) {
    return this.appDashboardService.getDashboradVisitorStatisticsData(
      optionsDto,
    );
  }
}
