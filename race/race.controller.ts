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
import { CountryService } from 'src/country/service/country.service';
import { RoleGuard } from 'src/role/role.gaurd';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CreateRaceDto } from './dto/create-race.dto';
import { DashboardExcessDto } from './dto/dashboard-excess.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { SearchByNameDto } from './dto/search-by-name.dto';
import { SearchOptionsDownloadDto } from './dto/search-option-download.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { EligibiltyDto } from './dto/update-eligibility.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { Race } from './entities/race.entity';
import { RaceService } from './race.service';

@ApiBearerAuth()
@ApiTags('Race')
@Controller({
  path: 'race',
  version: '1',
})
export class RaceController {
  constructor(
    private readonly raceService: RaceService,
    private readonly countryService: CountryService,
  ) {}

  @ApiOperation({
    summary: 'Get Race List',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_SEARCH_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  async findAll(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Race>> {
    return this.raceService.findAll(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard')
  getDashboradData(@Query() optionsDto: DashboardDto) {
    return this.raceService.getRaceDashboardData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Eligible Race Countries List',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: [
      'RACE_ADMIN_DASHBOARD_VIEW_READONLY',
      'RUNNER_ADMIN_DASHBOARD_VIEW_READONLY',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('eligible-race-countries')
  async getEligibleRaceCountries() {
    return await this.countryService.getEligibleRaceCountries();
  }

  @ApiOperation({
    summary: 'Get Dashboard Report',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_DASHBOARD_EXPORT_FUNCTION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.raceService.getDashboradReportData(optionsDto);
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Get Race Details',
  })
  @ApiOkResponse({
    description: '',
    isArray: false,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_EDIT_EXISTING_RACE_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.raceService.findOne(id);
  }

  @ApiOperation({
    summary: 'Create Race',
  })
  @ApiOkResponse({
    description: 'Race Created Successfully',
    isArray: false,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_ADD_NEW_RACE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createRaceDto: CreateRaceDto) {
    return this.raceService.create(createRaceDto);
  }

  @ApiOperation({
    summary: 'Update Race Details',
  })
  @ApiOkResponse({
    description: 'Race Updated Successfully',
    isArray: false,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_EDIT_EXISTING_RACE_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRaceDto: UpdateRaceDto,
  ) {
    return this.raceService.update(id, updateRaceDto);
  }

  @ApiOperation({
    summary: 'Update Race eligibility',
  })
  @ApiOkResponse({
    description: '',
    isArray: false,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_EDIT_EXISTING_RACE_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('change-eligibility/:id')
  updateEligibility(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() eligibiltyDto: EligibiltyDto,
  ) {
    return this.raceService.updateEligibility(id, eligibiltyDto);
  }

  @ApiOperation({
    summary: 'Search with RaceName',
  })
  @ApiOkResponse({
    description: '',
    isArray: false,
  })
  @Get('byName/:displayName')
  findAllByRaceName(
    @Param('displayName') displayName: string,
    @Query() searchByNameDto: SearchByNameDto,
  ) {
    return this.raceService.findAllByName(displayName, searchByNameDto);
  }

  @ApiOperation({
    summary: 'Search with RaceName for Brief Details',
  })
  @ApiOkResponse({
    description: '',
    isArray: false,
  })
  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_EDIT_EXISTING_RUNNER_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('byRaceName/:raceName')
  findByRaceName(
    @Param('raceName') displayName: string,
    @Query() searchByNameDto: SearchByNameDto,
  ) {
    return this.raceService.findByRaceName(displayName, searchByNameDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data - Most Valuable Races',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/most-valuable-races')
  getMostValuableRaces(@Query() optionsDto: DashboardExcessDto) {
    return this.raceService.getMostValuableRaces(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data - Top Prizemoney Venues',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/top-prizemoney')
  getTopPrizemoneyByVenue(@Query() optionsDto: DashboardExcessDto) {
    return this.raceService.getTopPrizemoneyByVenue(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data - World Reach',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/world-reach')
  getWorldReach(@Query() optionsDto: DashboardExcessDto) {
    return this.raceService.getWorldReach(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data - Avg Distance',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/avg-distance')
  getAverageDistanceGraph(@Query() optionsDto: DashboardDto) {
    return this.raceService.getAverageDistanceGraph(optionsDto);
  }

  @ApiOperation({
    summary: 'Export Race List ',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_EXPORT_LIST'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/download-list')
  async download(@Query() searchOptionsDto: SearchOptionsDownloadDto) {
    return this.raceService.download(searchOptionsDto);
  }
}
