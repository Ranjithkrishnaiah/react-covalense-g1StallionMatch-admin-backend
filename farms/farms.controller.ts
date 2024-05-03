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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { FarmGalleryResponseDto } from 'src/farm-gallery-images/dto/farm-gallery-response.dto';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CreateFarmDto } from './dto/create-farm.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { SearchOptionsDownloadDto } from './dto/download-farm-list.dto';
import { FarmMediaListResDto } from './dto/farm-media-list-res.dto';
import { FarmNameSearchDto } from './dto/farm-name-search.dto';
import { FarmsListDto } from './dto/farms-list.dto';
import { LocationsListDto } from './dto/locations-list.dto';
import { SearchByNameDto } from './dto/search-by-name.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateFarmGalleryDto } from './dto/update-farm-gallery.dto';
import { UpdateFarmMediaInfoDto } from './dto/update-farm-media-info';
import { UpdateFarmOverviewDto } from './dto/update-farm-overview.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Farm } from './entities/farm.entity';
import { FarmsService } from './farms.service';

@ApiTags('Farms')
@Controller({
  path: 'farms',
  version: '1',
})
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create New Farm',
  })
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_CREATE_A_NEW_FARM'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createFarmDto: CreateFarmDto) {
    return this.farmsService.create(createFarmDto);
  }

  @ApiOperation({
    summary: 'Get All Farms Locations',
  })
  @Get('locations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  async getAllFarmsLocations() {
    return await this.farmsService.getAllFarmsLocations();
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_VIEW_FARMS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard')
  getDashboradData(@Query() optionsDto: DashboardDto) {
    return this.farmsService.getFarmDashboardData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard - Farm Visitors Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_VIEW_FARMS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-visitors')
  getDashboradVisitorData(@Query() optionsDto: DashboardDto) {
    return this.farmsService.getDashboradVisitorData(optionsDto);
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
    permissions: ['FARM_ADMIN_DASHBOARD_EXPORT_FUNCTION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.farmsService.getDashboradReportData(optionsDto);
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Search farm By farmName',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-farm-name')
  async findFarmsByName(
    @Query() pageOptionsDto: FarmNameSearchDto,
  ): Promise<Farm[]> {
    return this.farmsService.findFarmsByName(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Search Farm',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_READ_ONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  async findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Farm>> {
    return this.farmsService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Searched Farms List with Users',
  })
  @ApiOkResponse({
    description: 'Get Searched Farms List with Users',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('searched-by-users/:farmName')
  getAllFarmsSearchedByUsers(@Param('farmName') farmName: string) {
    return this.farmsService.getAllFarmsSearchedByUsers(farmName);
  }

  @ApiOperation({
    summary: 'Get All Farms',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('byName/:farmName')
  findAllByGender(
    @Param('farmName') farmName: string,
    @Query() searchByNameDto: SearchByNameDto,
  ) {
    return this.farmsService.findAllByName(farmName, searchByNameDto);
  }

  @ApiOperation({
    summary: 'Get Farm Details by Farm Id',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':farmId')
  findOne(@Param('farmId', new ParseUUIDPipe()) farmId: string) {
    return this.farmsService.getFarmDetails(farmId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Farms Details',
  })
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_FARM'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateFarmDto: UpdateFarmDto,
  ) {
    return this.farmsService.update(id, updateFarmDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm- pProfile Image upload',
  })
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_FARM'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('profile-image')
  async profileImageUpload(@Body() data: FileUploadUrlDto) {
    return await this.farmsService.profileImageUpload(data);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Update Overview Data',
  })
  @ApiOkResponse({
    description: 'Farm - Overview Data Updated Successfully',
  })
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_FARM'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':farmId/overview')
  overviewUpdate(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() updateDto: UpdateFarmOverviewDto,
  ) {
    return this.farmsService.overviewUpdate(farmId, updateDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Gallery Image Upload Initiation',
  })
  @ApiCreatedResponse({
    description: 'Farm - Gallery Image Uploaded successfully',
  })
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_FARM'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post(':farmId/gallery-images')
  async galleryImageUpload(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() data: FileUploadUrlDto,
  ) {
    return await this.farmsService.galleryImageUpload(farmId, data);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Add/Remove Gallery Data',
  })
  @ApiOkResponse({
    description: 'Farm - Gallery Data  Updated Successfully',
  })
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_FARM'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':farmId/gallery-images')
  galleryUpdate(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() updateDto: UpdateFarmGalleryDto,
  ) {
    return this.farmsService.galleryUpdate(farmId, updateDto);
  }

  @ApiOperation({
    summary: 'Get All Farm Gallery Images',
  })
  @ApiOkResponse({
    description: '',
    type: FarmGalleryResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':farmId/gallery-images')
  getAllStallionGalleryImages(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ): Promise<FarmGalleryResponseDto[]> {
    return this.farmsService.getAllGalleryImages(farmId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Media Images/Videos Upload Initiation',
  })
  @ApiCreatedResponse({
    description: 'Farm - Media Images/Videos Uploaded successfully',
  })
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_FARM'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post(':farmId/media-files')
  async farmMediaFileUpload(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() data: FileUploadUrlDto,
  ) {
    return await this.farmsService.farmMediaFileUpload(farmId, data);
  }

  @ApiOperation({
    summary: 'Get All Farm Media',
  })
  @ApiOkResponse({
    description: '',
    type: FarmMediaListResDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_FARM'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':farmId/media')
  getAllFarmMediaByFarmId(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ): Promise<FarmMediaListResDto[]> {
    return this.farmsService.getAllFarmMediaByFarmId(farmId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Farm - Add/Remove/Update Media Data',
  })
  @ApiOkResponse({
    description: 'Farm - Media Data Updated Successfully',
  })
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_FARM'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':farmId/medias')
  testimonialUpdate(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() updateDto: UpdateFarmMediaInfoDto,
  ) {
    return this.farmsService.mediaUpdate(farmId, updateDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Farm Stallions Without Pagination',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':farmId/stallion-names')
  getAllStallionsWithoutPaging(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ) {
    return this.farmsService.getAllStallionsWithoutPaging(farmId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Farm Stallions Without Pagination',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':farmId/members')
  getFarmMembers(@Param('farmId', new ParseUUIDPipe()) farmId: string) {
    return this.farmsService.getFarmMembers(farmId);
  }

  @ApiOperation({
    summary: 'Get Farm Locations by Farms',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('by-farms')
  findByFarms(@Body() farmsListDto: FarmsListDto) {
    return this.farmsService.findByFarms(farmsListDto);
  }

  @ApiOperation({
    summary: 'Get Farms,Users,Stallions by Locations',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('by-locations')
  findByLocations(@Body() locationsListDto: LocationsListDto) {
    return this.farmsService.findByLocations(locationsListDto);
  }

  @ApiOperation({
    summary: 'Download Farm List',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_EXPORT_LISTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/download-farm-list')
  async download(@Query() searchOptionsDownloadDto: SearchOptionsDownloadDto) {
    return this.farmsService.downloadList(searchOptionsDownloadDto);
  }

  @ApiOperation({
    summary: 'Get World Reach Farms',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_VIEW_FARMS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/world-reach-farms')
  getWorldReachFarms(@Query() optionsDto: DashboardDto) {
    return this.farmsService.getWorldReachFarms(optionsDto);
  }
}
