import {
  Body,
  Controller,
  Delete,
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
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { KeyWordsSearchOptionsDto } from 'src/key-words-search/dto/key-words-search-options.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CreateAlongWithSireOrDamDto } from './dto/create-along-with-sire-or-dam.dto';
import { CreateHorseDto } from './dto/create-horse.dto';
import { CreateNewHorseWithPedigreeDto } from './dto/create-new-horse-with-pedigree.dto';
import { DamNameSearchDto } from './dto/dam-name-search.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { HorseNameSearchDto } from './dto/horse-name-search.dto';
import { HorseProfileImageUploadDto } from './dto/horse-profile-image-upload.dto';
import { HorsenameSearchOnlyDto } from './dto/horsename-search-only.dto';
import { MergeHorseDto } from './dto/merge-horse.dto';
import { ProgenyResponseDto } from './dto/progeny-response.dto';
import { ProgenyDto } from './dto/progeny.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SireNameSearchDto } from './dto/sire-name-search.dto';
import { UpdateHorseDto } from './dto/update-horse.dto';
import { UpdatePedigreeDto } from './dto/update-pedigree.dto';
import { Horse } from './entities/horse.entity';
import { HorseMergeService } from './horse-merge.service';
import { HorsesService } from './horses.service';

@ApiBearerAuth()
@ApiTags('Horses')
@Controller({
  path: 'horses',
  version: '1',
})
export class HorsesController {
  constructor(
    private readonly horsesService: HorsesService,
    private readonly horseMergeService: HorseMergeService,
  ) {}

  @ApiOperation({
    summary: 'Get All Horses Locations',
  })
  @Get('locations')
  @UseGuards(JwtAuthenticationGuard)
  async getAllHorsesLocations() {
    return await this.horsesService.getAllHorsesLocations();
  }

  @ApiOperation({
    summary: 'Get all the List of Horses alias',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('horseAlias')
  async findHorsesAlias(@Param('id') id: string) {
    return this.horsesService.findHorsesAlias(id);
  }

  @ApiOperation({
    summary: 'Create New Horse',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_CREATE_A_NEW_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createHorseDto: CreateHorseDto) {
    return this.horsesService.create(createHorseDto);
  }

  // @ApiOperation({
  //   summary: 'Create New Horse For Pedigree Position',
  // })
  // @SetMetadata('api', {
  //   permissions: ['HORSE_ADMIN_CREATE_A_NEW_HORSE'],
  // })
  // @UseGuards(JwtAuthenticationGuard, RoleGuard)
  // @Post('create-pedigree')
  // createForPedigreePosition(@Body() createHorseDto: CreateHorseNoProgenyidDto) {
  //   return this.horsesService.createForPedigreePosition(createHorseDto);
  // }

  @ApiOperation({
    summary: 'Create A New Horse With Pedigree Positions',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_CREATE_A_NEW_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('create-horse-with-pedigree')
  createANewHorseWithPedigreePositions(
    @Body() createHorseDto: CreateNewHorseWithPedigreeDto,
  ) {
    return this.horsesService.createNewHorseWithPedigree(createHorseDto);
  }

  @ApiOperation({
    summary: 'Create New Horse - Along With Either Sire or Dam',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_CREATE_A_NEW_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('create-along-with-sire-or-dam')
  createHorseAlongWithSireOrDamData(
    @Body() createHorseDto: CreateAlongWithSireOrDamDto,
  ) {
    return this.horsesService.createHorseAlongWithSireOrDamData(createHorseDto);
  }

  @ApiOperation({
    summary: 'Merge Horses',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_MERGE_HORSES'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('merge')
  mergeHorses(@Body() mergeHorseDto: MergeHorseDto) {
    return this.horseMergeService.mergeHorses(mergeHorseDto);
  }

  @ApiOperation({
    summary: 'Find Horses By horseName',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-horse-name')
  async findHorsesByName(
    @Query() searchOptionsDto: HorseNameSearchDto,
  ): Promise<Horse[]> {
    return this.horsesService.findHorsesByNameAndGender(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Find Horses By Name and Sex',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-horse-by-name-sex')
  async findHorsesByNameAndSex(
    @Query() searchOptionsDto: HorseNameSearchDto,
  ): Promise<Horse[]> {
    return this.horsesService.findHorsesByNameAndSex(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Find Sires By Sire-Name',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-sire-name')
  async findSiresByName(
    @Query() searchOptionsDto: SireNameSearchDto,
  ): Promise<Horse[]> {
    return this.horsesService.findSiresByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Find Dam By Dam-Name',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('search-dam-name')
  async findDamsByName(
    @Query() searchOptionsDto: DamNameSearchDto,
  ): Promise<Horse[]> {
    return this.horsesService.findDamsByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get All Eligibilites',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('eligibilities')
  async getEligibilities() {
    return this.horsesService.getEligibilities();
  }

  @ApiOperation({
    summary: 'Get All Stakes - Status',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('stakes-status')
  async getStakesStatus() {
    return this.horsesService.getStakesStatus();
  }

  @ApiOperation({
    summary: 'Get All Runner - Status',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('runner-status')
  async getRunnerStatus() {
    return this.horsesService.getRunnerStatus();
  }

  @ApiOperation({
    summary: 'Get All Sire - Status',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('sire-status')
  async getSireStatus() {
    return this.horsesService.getSireStatus();
  }

  @ApiOperation({
    summary: 'Get All Dam - Status',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('dam-status')
  async getDamStatus() {
    return this.horsesService.getDamStatus();
  }

  @ApiOperation({
    summary: 'Get All Accuracy- Profile Values Available ',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('accuracy-profile')
  async getAccuracyProfile() {
    return this.horsesService.getAccuracyProfile();
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_VIEW_HORSE_DETAILS_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard')
  getDashboradData(@Query() optionsDto: DashboardDto) {
    return this.horsesService.getHorseDashboardData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Report',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_DASHBOARD_EXPORT_FUNCTION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.horsesService.getDashboradReportData(optionsDto);
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Get Key Words Search List',
  })
  @ApiOkResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('key-words-search')
  keyWordsSearchService(
    @Query() keyWordsSearchOptionsDto: KeyWordsSearchOptionsDto,
  ) {
    return this.horsesService.keyWordsSearchService(keyWordsSearchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Default HorseData With Positions',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_CREATE_A_NEW_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('default')
  async defaultHorseDataWithPositions() {
    return await this.horsesService.defaultHorseDataWithPositions();
  }

  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_READ_ONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @ApiOperation({
    summary: 'Search Horses',
  })
  @Get()
  async findAll(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Horse>> {
    return this.horsesService.findAll(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Horse Progeny',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':horseId/progeny')
  getHorseProgeny(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Query() searchOptionsDto: ProgenyDto,
  ): Promise<PageDto<ProgenyResponseDto>> {
    return this.horsesService.getHorseProgeny(horseId, searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Horses Other Than Master',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_MERGE_HORSES'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':horseId/horse-name-search')
  horsesByNameExcludingMasterHorseId(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Query() searchOptionsDto: HorsenameSearchOnlyDto,
  ) {
    return this.horseMergeService.horsesByNameExcludingMasterHorseId(
      horseId,
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'GetHorse Pedigree By Id and ViewType',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id/:viewType')
  getHorsePedigreeByIdAndViewType(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('viewType') viewType: string,
  ) {
    return this.horsesService.getHorsePedigreeById(id);
  }

  @ApiOperation({
    summary: 'Get Horse Details By Id',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.horsesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update Horse Details By Id',
  })
  @SetMetadata('api', {
    permissions: [
      'HORSE_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_HORSE',
      'HORSE_ADMIN_RENAME_AN_EXISTING_HORSE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateHorseDto: UpdateHorseDto,
  ) {
    return this.horsesService.update(id, updateHorseDto);
  }

  // @ApiOperation({
  //   summary: 'Update Horse Details By Id - Without Progeny',
  // })
  // @SetMetadata('api', {
  //   permissions: [
  //     'HORSE_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_HORSE',
  //     'HORSE_ADMIN_RENAME_AN_EXISTING_HORSE',
  //   ],
  // })
  // @UseGuards(JwtAuthenticationGuard, RoleGuard)
  // @Patch(':id/without-progeny')
  // updateWitoutProgeny(
  //   @Param('id', new ParseUUIDPipe()) id: string,
  //   @Body() updateHorseDto: UpdateHorseNoProgenyidDto,
  // ) {
  //   return this.horsesService.updateWitoutProgeny(id, updateHorseDto);
  // }

  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_ARCHIVE_AN_EXISTING_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':id/remove-horse')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.horsesService.deleteOne(id);
  }

  @ApiOperation({
    summary: 'Update Horse Pedigree',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_ARCHIVE_AN_EXISTING_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':horseId/pedigree')
  testimonialUpdate(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Body() updateDto: UpdatePedigreeDto,
  ) {
    return this.horsesService.updatePedigree(horseId, updateDto);
  }

  @ApiOperation({
    summary: 'Horse ProfileImage - Get Presigned Url',
  })
  @ApiOkResponse({
    description: '',
    type: PresignedUrlDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post(':horseId/profile-image')
  async getProfileImageUploadUrl(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Body() data: FileUploadUrlDto,
  ): Promise<PresignedUrlDto> {
    return await this.horsesService.getProfileImageUploadUrl(horseId, data);
  }

  @ApiOperation({
    summary: 'Horse ProfileImage - Save',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':horseId/profile-image')
  async saveProfileImage(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Body() data: HorseProfileImageUploadDto,
  ) {
    return await this.horsesService.saveHorseProfilePic(horseId, data);
  }

  @ApiOperation({
    summary: 'Horse ProfileImage - Delete',
  })
  @ApiOkResponse({
    description: '',
    type: PresignedUrlDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete(':horseId/profile-image')
  async deleteProfileImage(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
  ) {
    return await this.horsesService.deleteHorseProfileImage(horseId);
  }

  @ApiOperation({
    summary: 'Get HorseData From The Input Position',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_CREATE_A_NEW_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':horseId/tag/:horsePosition')
  async getHorseDataFromTheInputPosition(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Param('horsePosition') horsePosition: string,
  ) {
    return await this.horsesService.getHorseDataFromTheInputPosition(
      horseId,
      horsePosition,
    );
  }
}
