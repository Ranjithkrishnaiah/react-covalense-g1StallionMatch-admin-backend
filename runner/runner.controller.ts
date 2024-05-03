import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { DashboardDto } from 'src/runner/dto/dashboard.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { AccuracyRatingDashboardDto } from './dto/accuracy-rating-dashboard.dto';
import { CreateRunnerDto } from './dto/create-runner.dto';
import { DashboardOptionalCountryDto } from './dto/dashboard-optional-country.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { MatchedHorseSearchDto } from './dto/search-by-horse-name.dto';
import { SearchOptionsDownloadDto } from './dto/search-options-download.dto';
import { SearchOptionsDto } from './dto/search-options-dto';
import { EligibiltyByRaceIdDto } from './dto/update-eligibility-byrace.dto';
import { UpdateRunnerDto } from './dto/update-runner.dto';
import { Runner } from './entities/runner.entity';
import { RunnerService } from './runner.service';

@ApiBearerAuth()
@ApiTags('Runner')
@Controller({
  path: 'runner',
  version: '1',
})
export class RunnerController {
  constructor(private readonly runnerService: RunnerService) {}

  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_EDIT_EXISTING_RUNNER_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('matched-horse-name')
  async searchByName(@Query() searchOptionsDto: MatchedHorseSearchDto) {
    return this.runnerService.searchByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard')
  getDashboradData(@Query() optionsDto: DashboardDto) {
    return this.runnerService.getRunnerDashboardData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Report',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_DASHBOARD_EXPORT_FUNCTION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.runnerService.getDashboradReportData(optionsDto);
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }

  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_EDIT_EXISTING_RUNNER_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.runnerService.findOne(id);
  }

  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_EDIT_EXISTING_RUNNER_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('getHorseDetails/:horseId')
  getHorseDetails(@Param('horseId', new ParseUUIDPipe()) horseId: string) {
    return this.runnerService.getHorseDetails(horseId);
  }

  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_ADD_NEW_RUNNER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createRunnerDto: CreateRunnerDto) {
    return this.runnerService.create(createRunnerDto);
  }

  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_SEARCH_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  async findAll(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Runner>> {
    return this.runnerService.findAll(searchOptionsDto);
  }

  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_EDIT_EXISTING_RUNNER_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRunnerDto: UpdateRunnerDto,
  ) {
    return this.runnerService.update(id, updateRunnerDto);
  }
  
  @SetMetadata('api', {
    permissions: [
      'RUNNER_ADMIN_ADD_NEW_RUNNER',
      'RUNNER_ADMIN_EDIT_EXISTING_RUNNER_DETAILS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':runnerId/change-eligibility/All')
  updateAll(
    @Param('runnerId', new ParseUUIDPipe()) runnerId: string,
    @Body() eligibiltyByRaceIdDto: EligibiltyByRaceIdDto,
  ) {
    return this.runnerService.updateAll(runnerId, eligibiltyByRaceIdDto);
  }

  @SetMetadata('api', {
    permissions: [
      'RUNNER_ADMIN_ADD_NEW_RUNNER',
      'RUNNER_ADMIN_EDIT_EXISTING_RUNNER_DETAILS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('updateOnlyRunner/:horseId')
  updateOnlyRunner(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Body() eligibiltyByRaceIdDto: EligibiltyByRaceIdDto,
  ) {
    return this.runnerService.updateOnlyRunner(horseId, eligibiltyByRaceIdDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard World Reach Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/world-reach')
  getDashboradWorldReachData(@Query() optionsDto: DashboardOptionalCountryDto) {
    return this.runnerService.getDashboradWorldReachData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data - Accuracy Rating',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/accuracy-rating')
  getDashboradAccuracyRatingData(
    @Query() optionsDto: AccuracyRatingDashboardDto,
  ) {
    return this.runnerService.getDashboradAccuracyRatingData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data - Most common horse colours (Rnrs)',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/common-horse-colours')
  getDashboradMostCommonHorseColoursData(
    @Query() optionsDto: DashboardOptionalCountryDto,
  ) {
    return this.runnerService.getDashboradMostCommonHorseColoursData(
      optionsDto,
    );
  }
  @Get('horse-rating/:horseId')
  async findRating(@Param('horseId', new ParseUUIDPipe()) horseId: string) {
    return this.runnerService.findRating(horseId);
  }

  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_EXPORT_LIST'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/download-list')
  async download(@Query() searchOptionsDto: SearchOptionsDownloadDto) {
    return this.runnerService.download(searchOptionsDto);
  }
}
