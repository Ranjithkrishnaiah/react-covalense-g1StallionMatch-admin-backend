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
import { PresignedUrlDto } from 'src/auth/dto/presigned-url.dto';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { TrackedStallionSearchDto } from 'src/favourite-stallions/dto/tracked-stallion-search.dto';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { SearchStallionMatchService } from 'src/search-stallion-match/search-stallion-match.service';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CreateStallionDto } from './dto/create-stallion.dto';
import { DamSireNameSearchDto } from './dto/dam-sire-name-search.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { FeeRangeSearchDto } from './dto/fee-range-search.dto.';
import { GalleryImagesResponse } from './dto/gallery-image-response.dto';
import { PriceMinMaxOptionsDto } from './dto/price-min-max-options.dto';
import { SearchDamNameResponse } from './dto/search-dam-name-response.dto';
import { SearchInFeeRangeResponseDto } from './dto/search-in-fee-range-response.dto';
import { SearchOptionsDownloadDto } from './dto/search-options-for-download.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SireNameSearchDto } from './dto/sire-name-search.dto';
import { StallionInfoResponseDto } from './dto/stallion-info-response.dto';
import { StallionNameSearchDto } from './dto/stallion-name-search.dto';
import { StallionTestimonialResponse } from './dto/stallion-testimonial-response.dto';
import { UpdateStallionGalleryDto } from './dto/update-stallion-gallery.dto';
import { UpdateStallionOverviewDto } from './dto/update-stallion-overview.dto';
import { UpdateStallionProfileDto } from './dto/update-stallion-profile.dto';
import { UpdateStallionTestimonialDto } from './dto/update-stallion-testimonial';
import { UpdateStallionDto } from './dto/update-stallion.dto';
import { Stallion } from './entities/stallion.entity';
import { StallionsService } from './stallions.service';

@ApiBearerAuth()
@ApiTags('Stallions')
@Controller({
  path: 'stallions',
  version: '1',
})
export class StallionsController {
  constructor(
    private readonly stallionsService: StallionsService,
    private readonly searchSMService: SearchStallionMatchService,
  ) {}

  @ApiOperation({
    summary: 'Create a stallion',
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_CREATE_A_NEW_STALLION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createStallionDto: CreateStallionDto) {
    return this.stallionsService.create(createStallionDto);
  }

  @ApiOperation({
    summary: 'Get All Stallion Locations',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('locations')
  async getAllStallionLocations() {
    return this.stallionsService.getAllStallionLocations();
  }

  @ApiOperation({
    summary: 'Get stallion promotion status',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('promotion-status')
  async getPromotionsStatusList() {
    return this.stallionsService.getPromotionsStatusList();
  }

  @ApiOperation({
    summary: 'Get stallion Fee Status List',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('fee-updated-by')
  async getFeeStatusUpdatedList() {
    return this.stallionsService.getFeeStatusList();
  }

  @ApiOperation({
    summary: 'Get stallion Fee Status',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('fee-status')
  async getFeeStatusList() {
    return this.stallionsService.getFeeStatus();
  }

  @ApiOperation({
    summary: 'Get stallion By Name',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-stallion-name')
  async findStallionsByName(
    @Query() searchOptionsDto: StallionNameSearchDto,
  ): Promise<Stallion[]> {
    return this.stallionsService.findStallionsByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get all stallions',
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_RUN_A_SEARCH_FOR_STALLIONS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  async findAll(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Stallion>> {
    return this.stallionsService.findAll(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get stallion by sire name',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-sire-name')
  async findSiresByName(@Query() searchOptionsDto: SireNameSearchDto) {
    return this.stallionsService.findSiresByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get stallion by grand sire name',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-grand-sire-name')
  async findGrandSiresByName(@Query() searchOptionsDto: SireNameSearchDto) {
    return this.stallionsService.findGrandSiresByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get stallion by fee range',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('price-range')
  async getStallionMinMax(
    @Query() priceMinMaxOptionsDto: PriceMinMaxOptionsDto,
  ) {
    return this.stallionsService.getStallionsMinMaxFee(priceMinMaxOptionsDto);
  }

  @ApiOperation({
    summary: 'Get stud fee years list',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('stud-fee-year')
  async getStudFeeYear() {
    return this.stallionsService.getYearToStudList();
  }

  @ApiOperation({
    summary: 'Search Stallion Dam Sire Names',
  })
  @ApiOkResponse({
    description: '',
    type: SearchDamNameResponse,
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-dam-sire-name')
  async findDamSireByName(
    @Query() searchOptionsDto: DamSireNameSearchDto,
  ): Promise<SearchDamNameResponse[]> {
    return this.stallionsService.findDamSireByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Search Stallion Dam Sire Names',
  })
  @ApiOkResponse({
    description: '',
    type: SearchDamNameResponse,
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('dam-sire-searched-bymare')
  async findDamSireBySearched(
    @Query() searchOptionsDto: DamSireNameSearchDto,
  ): Promise<SearchDamNameResponse[]> {
    return this.stallionsService.findDamSireBySearchedByMare(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_VIEW_STALLIONS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard')
  getDashboradData(@Query() optionsDto: DashboardDto) {
    return this.stallionsService.getStallionDashboardData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Matched Mares for Stallion Match',
  })
  @ApiOkResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('matched-mares')
  async getMatchedMares(@Query() searchOptionsDto: DashboardDto) {
    return this.stallionsService.findMatchedMares(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Key Statistics of a Stallion',
  })
  @ApiOkResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('key-statistics')
  async getKeyStatistics(@Query() searchOptionsDto: DashboardDto) {
    return this.stallionsService.getKeyStatisticsForReport(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Close Analytics of a Stallion',
  })
  @ApiOkResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('close-analytics')
  async getCloseAnalytics(@Query() searchOptionsDto: DashboardDto) {
    return this.stallionsService.getCloseAnalyticsForReport(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Close Analytics of a Stallion',
  })
  @ApiOkResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('match-activity')
  async getMatchActivity(@Query() searchOptionsDto: DashboardDto) {
    return this.searchSMService.stallionMatchActivity(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get World Reach Stallions',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_VIEW_STALLIONS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/world-reach-stallions')
  getWorldReachStallions(@Query() optionsDto: DashboardDto) {
    return this.stallionsService.getWorldReachStallions(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Report',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_DASHBOARD_EXPORT_FUNCTION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.stallionsService.getDashboradReportData(optionsDto);
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Search Stallion In Fee Range',
  })
  @ApiOkResponse({
    description: '',
    type: SearchInFeeRangeResponseDto,
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-in-fee-range')
  async findStallionsInFeeRange(@Query() searchOptionsDto: FeeRangeSearchDto) {
    return this.stallionsService.findStallionsInFeeRange(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Searched Stallions List with Users',
  })
  @ApiOkResponse({
    description: 'Get Searched Stallions List with Users',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('searched-by-users')
  getAllStallionsSearchedByUsers(
    @Body() searchOptionsDto: TrackedStallionSearchDto,
  ) {
    return this.stallionsService.getAllStallionsSearchedByUsers(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get stallion by id',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.stallionsService.findOne(id);
  }

  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateStallionDto: UpdateStallionDto,
  ) {
    return this.stallionsService.update(id, updateStallionDto);
  }

  @ApiOperation({
    summary: 'Get stallion profile image',
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('profile-image')
  async profileImageUpload(@Body() data: FileUploadUrlDto) {
    return await this.stallionsService.profileImageUpload(data);
  }

  @ApiOperation({
    summary: 'Get All Stallion Gallery Images',
  })
  @ApiOkResponse({
    description: '',
    type: GalleryImagesResponse,
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':stallionId/gallery-images')
  getAllStallionGalleryImages(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ): Promise<GalleryImagesResponse[]> {
    return this.stallionsService.getAllStallionGalleryImages(stallionId);
  }

  @ApiOperation({
    summary: 'Stallion Gallery image - Get Presigned Url',
  })
  @ApiOkResponse({
    description: '',
    type: PresignedUrlDto,
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post(':stallionId/gallery-images')
  async galleryImageUpload(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() data: FileUploadUrlDto,
  ): Promise<PresignedUrlDto> {
    return await this.stallionsService.galleryImageUpload(stallionId, data);
  }

  @ApiOperation({
    summary: 'Stallion Gallery Image - Update Media Info',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':stallionId/gallery-images')
  galleryUpdate(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateDto: UpdateStallionGalleryDto,
  ): Promise<StallionInfoResponseDto> {
    return this.stallionsService.galleryUpdate(stallionId, updateDto);
  }

  @ApiOperation({
    summary: 'Stallion Profile - Update',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':stallionId/profile')
  profileUpdate(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateDto: UpdateStallionProfileDto,
  ): Promise<StallionInfoResponseDto> {
    return this.stallionsService.profileUpdate(stallionId, updateDto);
  }

  @ApiOperation({
    summary: 'Stallion Overview - Update',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':stallionId/overview')
  overviewUpdate(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateDto: UpdateStallionOverviewDto,
  ): Promise<StallionInfoResponseDto> {
    return this.stallionsService.overviewUpdate(stallionId, updateDto);
  }

  @ApiOperation({
    summary: 'Get all stallion testimonials',
  })
  @ApiOkResponse({
    description: '',
    type: StallionTestimonialResponse,
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':stallionId/testimonials')
  allTestimonials(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ): Promise<StallionTestimonialResponse[]> {
    return this.stallionsService.getAllTestimonialsByStallionId(stallionId);
  }

  @ApiOperation({
    summary: 'Stallion Testimonial - Add/Update',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':stallionId/testimonials')
  testimonialUpdate(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateDto: UpdateStallionTestimonialDto,
  ): Promise<StallionInfoResponseDto> {
    return this.stallionsService.testimonialUpdate(stallionId, updateDto);
  }

  @ApiOperation({
    summary: 'Stallion Testimoial Media - Get Presigned Url',
  })
  @ApiOkResponse({
    description: '',
    type: PresignedUrlDto,
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post(':stallionId/testimonials-media')
  async testimonialsMediaUpload(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() data: FileUploadUrlDto,
  ): Promise<PresignedUrlDto> {
    return await this.stallionsService.testimonialsMediaUpload(
      stallionId,
      data,
    );
  }

  @ApiOperation({
    summary: 'download Stallion List',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_EXPORT_LISTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/download-list')
  async download(@Query() searchOptionsDto: SearchOptionsDownloadDto) {
    return this.stallionsService.download(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'download Stallion Analytics',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_EXPORT_LISTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('analytics/download')
  async analyticsDownload(@Query() searchOptionsDto: DashboardDto) {
    return this.stallionsService.analyticsDownload(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'download Stallion Fee History',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_VIEW_SHARE_FEE_HISTORY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('fee-history/download')
  async feeHistoryDownload(@Query() searchOptionsDto: DashboardDto) {
    return this.stallionsService.studfeeHistoryDownload(searchOptionsDto);
  }
}
