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
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PresignedUrlDto } from 'src/auth/dto/presigned-url.dto';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { FarmGalleryResponseDto } from 'src/farm-gallery-images/dto/farm-gallery-response.dto';
import { FarmInfoResDto } from 'src/farms/dto/farm-info-res.dto';
import { FarmMediaListResDto } from 'src/farms/dto/farm-media-list-res.dto';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { GalleryImagesResponse } from 'src/stallions/dto/gallery-image-response.dto';
import { StallionInfoResponseDto } from 'src/stallions/dto/stallion-info-response.dto';
import { StallionTestimonialResponse } from 'src/stallions/dto/stallion-testimonial-response.dto';
import { CreatieFarmMediaMarketingDto } from './dto/create-farm-media-marketing.dto';
import { CreatieStallionTestimonialMarketingDto } from './dto/create-stallion-testimonial-marketing.dto';
import { MarketingFilePdfUploadUrlDto } from './dto/marketing-file-pdf-upload.dto';
import { MarketingFileUploadUrlDto } from './dto/marketing-file-upload.dto';
import { searchFarmMedia } from './dto/search-farm-media.dto';
import { searchStallionTestimonial } from './dto/search-stallion-testimonial.dto';
import { UpdateMarketingFarmDto } from './dto/update-marketing-farm.dto';
import { UpdateMarketingPageHomeDto } from './dto/update-marketing-page-home.dto';
import { UpdateMarketingStallionFarmDto } from './dto/update-marketing-stallion-farm.dto';
import { UpdateMarketingStallionDto } from './dto/update-marketing-stallion.dto';
import { UpdateMarketingTrendsDto } from './dto/update-marketing-trends.dto';
import { UpdateStallionTestimonialMarketingDto } from './dto/update-stallion-testimonial-marketing.dto';
import { MarketingPageHomeService } from './marketing-page-home.service';

@ApiTags('Marketing Page')
@Controller({
  path: '',
  version: '1',
})
export class MarketingPageHomeController {
  constructor(
    private readonly marketingPageHomeService: MarketingPageHomeService,
  ) {}

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_LANDING_PAGE',
      'MARKETING_HOME_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
      'MARKETING_TRENDS_PAGE',
      'MARKETING_REPORTS_OVERVIEW_PAGE',
      'MARKETING_FARM_PAGE_PROMOTED',
      'MARKETING_STALLION_PAGE_PROMOTED',
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('page-data/:pageId')
  findById(@Param('pageId', new ParseUUIDPipe()) pageId: string) {
    return this.marketingPageHomeService.findByUuId(pageId);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_HOME_PAGE', 'MARKETING_LANDING_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('home/:pageId')
  updateHome(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Body() updateMarketingPageHomeDto: UpdateMarketingPageHomeDto,
  ) {
    return this.marketingPageHomeService.update(
      pageId,
      updateMarketingPageHomeDto,
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_STALLION_MATCH_PAGE_FOR_FARMS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('stallion-farm/:pageId')
  updateStallionPage(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Body() updateMarketingStallionFarmDto: UpdateMarketingStallionFarmDto,
  ) {
    return this.marketingPageHomeService.update(
      pageId,
      updateMarketingStallionFarmDto,
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_TRENDS_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('trends/:pageId')
  updateTrends(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Body() updateMarketingTrendsDto: UpdateMarketingTrendsDto,
  ) {
    return this.marketingPageHomeService.update(
      pageId,
      updateMarketingTrendsDto,
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_LANDING_PAGE',
      'MARKETING_HOME_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
      'MARKETING_TRENDS_PAGE',
      'MARKETING_REPORTS_OVERVIEW_PAGE',
      'MARKETING_FARM_PAGE_PROMOTED',
      'MARKETING_STALLION_PAGE_PROMOTED',
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('upload-image')
  async imageUpload(@Body() data: MarketingFileUploadUrlDto) {
    return await this.marketingPageHomeService.imageUpload(data);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_LANDING_PAGE',
      'MARKETING_HOME_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
      'MARKETING_TRENDS_PAGE',
      'MARKETING_REPORTS_OVERVIEW_PAGE',
      'MARKETING_FARM_PAGE_PROMOTED',
      'MARKETING_STALLION_PAGE_PROMOTED',
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('upload-pdf')
  async uploadPdf(@Body() data: MarketingFilePdfUploadUrlDto) {
    return await this.marketingPageHomeService.uploadPdf(data);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_LANDING_PAGE',
      'MARKETING_HOME_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
      'MARKETING_TRENDS_PAGE',
      'MARKETING_REPORTS_OVERVIEW_PAGE',
      'MARKETING_FARM_PAGE_PROMOTED',
      'MARKETING_STALLION_PAGE_PROMOTED',
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete('delete-image/:marketingPageSectionId')
  async deleteImage(
    @Param('marketingPageSectionId', new ParseUUIDPipe())
    marketingPageSectionId: string,
  ) {
    return await this.marketingPageHomeService.deleteImage(
      marketingPageSectionId,
    );
  }

  @ApiOperation({
    summary: 'Get stallion Details - By Marketing page Id and stallion Id',
  })
  @ApiOkResponse({
    description: '',
    type: StallionInfoResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_STALLION_PAGE_PROMOTED',
      'STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('stallion/:pageId/:stallionId/profile')
  findStallionById(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ): Promise<StallionInfoResponseDto> {
    return this.marketingPageHomeService.findStallionDataByUuId(
      pageId,
      stallionId,
      'profile',
    );
  }

  @ApiOperation({
    summary:
      'Get All stallion testimonials - By Marketing Page Id and Stallion Id',
  })
  @ApiOkResponse({
    description: '',
    type: StallionTestimonialResponse,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_STALLION_PAGE_PROMOTED',
      'STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('stallion/:pageId/:stallionId/testimonials')
  findStallionTestimonials(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Query() searchOptionsDto: searchStallionTestimonial,
  ): Promise<StallionTestimonialResponse[]> {
    return this.marketingPageHomeService.findStallionDataByUuId(
      pageId,
      stallionId,
      'testimonials',
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Add stallion testimonial - By Marketing Page Id and Stallion Id',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_STALLION_PAGE_PROMOTED',
      'STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('stallion/:pageId/:stallionId/testimonial')
  addStallionTestimonials(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() createDto: CreatieStallionTestimonialMarketingDto,
  ) {
    return this.marketingPageHomeService.addStallionTestimonial(
      pageId,
      stallionId,
      createDto,
    );
  }

  @ApiOperation({
    summary: 'Stallion Testimoial Media - Get Presigned Url',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_STALLION_PAGE_PROMOTED',
      'STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('stallion/:pageId/:stallionId/testimonials-media')
  testimonialsMediaUpload(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() createDto: FileUploadUrlDto,
  ): Promise<PresignedUrlDto> {
    return this.marketingPageHomeService.testimonialsMediaUpload(
      pageId,
      stallionId,
      createDto,
    );
  }

  @ApiOperation({
    summary:
      'Update stallion testimonial - By Marketing Page Id and Stallion Id',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_STALLION_PAGE_PROMOTED',
      'STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('stallion/:pageId/:stallionId/testimonial')
  updateStallionTestimonials(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateDto: UpdateStallionTestimonialMarketingDto,
  ) {
    return this.marketingPageHomeService.updateStallionTestimonial(
      pageId,
      stallionId,
      updateDto,
    );
  }

  @ApiOperation({
    summary:
      'Get All Stallion Gallery Images - By Marketing Page Id and Stallion Id',
  })
  @ApiOkResponse({
    description: '',
    type: GalleryImagesResponse,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_STALLION_PAGE_PROMOTED',
      'STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('stallion/:pageId/:stallionId/gallery-images')
  findStallionGalleryImages(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
  ): Promise<GalleryImagesResponse> {
    return this.marketingPageHomeService.findStallionDataByUuId(
      pageId,
      stallionId,
      'gallery-images',
    );
  }

  @ApiOperation({
    summary: 'Stallion Gallery image - Get Presigned Url',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_STALLION_PAGE_PROMOTED',
      'STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('stallion/:pageId/:stallionId/gallery-images')
  stalionGalleryImageUpload(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() createDto: FileUploadUrlDto,
  ): Promise<PresignedUrlDto> {
    return this.marketingPageHomeService.stalionGalleryImageUpload(
      pageId,
      stallionId,
      createDto,
    );
  }

  @ApiOperation({
    summary: 'Update Stallion - By Marketing Page Id and Stallion Id',
  })
  @ApiOkResponse({
    description: 'Stallion Updated Successfully',
    type: StallionInfoResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_STALLION_PAGE_PROMOTED',
      'STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('stallion/:pageId/:stallionId')
  updateStallion(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() updateMarketingStallionDto: UpdateMarketingStallionDto,
  ): Promise<StallionInfoResponseDto> {
    return this.marketingPageHomeService.updateStallionData(
      pageId,
      stallionId,
      updateMarketingStallionDto,
    );
  }

  @ApiOperation({
    summary: 'Get Farm Details - By Marketing page Id and Farm Id',
  })
  @ApiOkResponse({
    description: '',
    type: FarmInfoResDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_FARM_PAGE_PROMOTED',
      'FARM_ADMIN_EDIT_PROMOTED_FARM_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('farm/:pageId/:farmId/profile')
  findFarmById(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ): Promise<FarmInfoResDto> {
    return this.marketingPageHomeService.findFarmDataByUuId(
      pageId,
      farmId,
      'profile',
    );
  }

  @ApiOperation({
    summary: 'Get All Farm Gallery Images - By Marketing page Id and Farm Id',
  })
  @ApiOkResponse({
    description: '',
    type: FarmGalleryResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_FARM_PAGE_PROMOTED',
      'FARM_ADMIN_EDIT_PROMOTED_FARM_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('farm/:pageId/:farmId/gallery-images')
  findFarmGalleryImages(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
  ): Promise<FarmGalleryResponseDto[]> {
    return this.marketingPageHomeService.findFarmDataByUuId(
      pageId,
      farmId,
      'gallery-images',
    );
  }

  @ApiOperation({
    summary: 'Get All Farm Media - By Marketing page Id and Farm Id',
  })
  @ApiOkResponse({
    description: '',
    type: FarmMediaListResDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_FARM_PAGE_PROMOTED',
      'FARM_ADMIN_EDIT_PROMOTED_FARM_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('farm/:pageId/:farmId/media')
  findFarmMedias(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Query() searchOptionsDto: searchFarmMedia,
  ): Promise<FarmMediaListResDto[]> {
    return this.marketingPageHomeService.findFarmDataByUuId(
      pageId,
      farmId,
      'media',
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Add Farm Media - By Marketing page Id and Farm Id',
  })
  @ApiOkResponse({
    description: '',
    type: FarmMediaListResDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_FARM_PAGE_PROMOTED',
      'FARM_ADMIN_EDIT_PROMOTED_FARM_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('farm/:pageId/:farmId/media')
  addFarmMedias(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() createDto: CreatieFarmMediaMarketingDto,
  ) {
    return this.marketingPageHomeService.addFarmMedias(
      pageId,
      farmId,
      createDto,
    );
  }

  @ApiOperation({
    summary: 'Update Farm - By Marketing Page Id and Farm Id',
  })
  @ApiOkResponse({
    description: 'Farm Updated Successfully',
    type: FarmInfoResDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_FARM_PAGE_PROMOTED',
      'FARM_ADMIN_EDIT_PROMOTED_FARM_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('farm/:pageId/:farmId')
  updateFarm(
    @Param('pageId', new ParseUUIDPipe()) pageId: string,
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @Body() updateMarketingFarmDto: UpdateMarketingFarmDto,
  ): Promise<FarmInfoResDto> {
    return this.marketingPageHomeService.updateFarmData(
      pageId,
      farmId,
      updateMarketingFarmDto,
    );
  }
}
