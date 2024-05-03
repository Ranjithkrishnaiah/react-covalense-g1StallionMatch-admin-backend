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
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CreatePricingTileDto } from 'src/marketing-tiles/dto/create-pricing-tile.dto';
import { DeleteTileDto } from 'src/marketing-tiles/dto/delete-tile.dto';
import { PricingTileResponseDto } from 'src/marketing-tiles/dto/pricing-tile-response.dto';
import { PricingTileTypeDto } from 'src/marketing-tiles/dto/pricing-tile-type.dto';
import { MarketingTilesService } from 'src/marketing-tiles/marketing-tiles.service';
import { RoleGuard } from 'src/role/role.gaurd';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { CreateReportsOverviewDto } from './dto/create-overview.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { ReorderItemDto } from './dto/reorder-item.dto';
import { UpdateCarouselInfoDto } from './dto/update-carousel-info.dto';
import { UpdateOverviewInfoDto } from './dto/update-overview.dto';
import { UpdateTestimonialInfoDto } from './dto/update-testimonial-info.dto';
import { MarketingAdditonInfoService } from './marketing-addition-info.service';

@ApiTags('Marketing AdditonInfo')
@Controller({
  path: '',
  version: '1',
})
export class MarketingAdditonInfoController {
  constructor(
    private readonly marketingAdditonInfoService: MarketingAdditonInfoService,
    private readonly marketingTilesService: MarketingTilesService,
  ) {}

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_HOME_PAGE', 'MARKETING_LANDING_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('testimonial')
  createTestimonial(@Body() createTestimonialDto: CreateTestimonialDto) {
    return this.marketingAdditonInfoService.create(
      createTestimonialDto,
      'testimonial',
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_HOME_PAGE', 'MARKETING_LANDING_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('testimonial/:testimonialId')
  findOneTestimonial(
    @Param('testimonialId', new ParseUUIDPipe()) testimonialId: string,
  ) {
    return this.marketingAdditonInfoService.findOne(
      testimonialId,
      'testimonial',
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_HOME_PAGE', 'MARKETING_LANDING_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('testimonial/:testimonialId')
  updateTestimonial(
    @Param('testimonialId', new ParseUUIDPipe()) testimonialId: string,
    @Body() updateTestimonialDto: UpdateTestimonialInfoDto,
  ) {
    return this.marketingAdditonInfoService.update(
      testimonialId,
      updateTestimonialDto,
      'testimonial',
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_HOME_PAGE', 'MARKETING_LANDING_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete('testimonial/delete-image/:testimonialId')
  deleteTestimonialImage(
    @Param('testimonialId', new ParseUUIDPipe()) testimonialId: string,
  ) {
    return this.marketingAdditonInfoService.removeImage(testimonialId);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_HOME_PAGE',
      'MARKETING_LANDING_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('carousel')
  createCarousel(@Body() createCarouselDto: CreateCarouselDto) {
    return this.marketingAdditonInfoService.create(
      createCarouselDto,
      'carousel',
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_HOME_PAGE',
      'MARKETING_LANDING_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('carousel/:carouselId')
  findOneCarousel(
    @Param('carouselId', new ParseUUIDPipe()) carouselId: string,
  ) {
    return this.marketingAdditonInfoService.findOne(carouselId, 'carousel');
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_HOME_PAGE',
      'MARKETING_LANDING_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('carousel/:carouselId')
  updateCarousel(
    @Param('carouselId', new ParseUUIDPipe()) carouselId: string,
    @Body() updateCarouselDto: UpdateCarouselInfoDto,
  ) {
    return this.marketingAdditonInfoService.update(
      carouselId,
      updateCarouselDto,
      'carousel',
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'MARKETING_HOME_PAGE',
      'MARKETING_LANDING_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete('carousel/delete-image/:carouselId')
  deleteCarouselImage(
    @Param('carouselId', new ParseUUIDPipe()) carouselId: string,
  ) {
    return this.marketingAdditonInfoService.removeImage(carouselId);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_REPORTS_OVERVIEW_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('reports-overview')
  createOverview(@Body() createReportsOverviewDto: CreateReportsOverviewDto) {
    return this.marketingAdditonInfoService.create(
      createReportsOverviewDto,
      'reportsOverview',
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_REPORTS_OVERVIEW_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('reports-overview/:reportsOverviewId')
  findOneOverview(
    @Param('reportsOverviewId', new ParseUUIDPipe()) reportsOverviewId: string,
  ) {
    return this.marketingAdditonInfoService.findOne(
      reportsOverviewId,
      'overview',
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_REPORTS_OVERVIEW_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('reports-overview/:reportsOverviewId')
  updateOverview(
    @Param('reportsOverviewId', new ParseUUIDPipe()) reportsOverviewId: string,
    @Body() updateOverviewDto: UpdateOverviewInfoDto,
  ) {
    return this.marketingAdditonInfoService.update(
      reportsOverviewId,
      updateOverviewDto,
      'overview',
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_REPORTS_OVERVIEW_PAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete('reports-overview/:reportsOverviewId/file/:fileType')
  deleteReportsOverviewFile(
    @Param('reportsOverviewId', new ParseUUIDPipe()) reportsOverviewId: string,
    @Param('fileType') fileType: string,
  ) {
    if (!['image', 'pdf'].includes(fileType)) {
      throw new UnprocessableEntityException(
        'File type is not valid!, allowed types image or pdf',
      );
    }
    if (fileType == 'image') {
      return this.marketingAdditonInfoService.removeImage(reportsOverviewId);
    }
    return this.marketingAdditonInfoService.removePdf(reportsOverviewId);
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
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('marketingPageSection/:marketingPageSectionId/reorder')
  reorderItems(
    @Param('marketingPageSectionId', new ParseUUIDPipe())
    marketingPageSectionId: string,
    @Body() reordered: ReorderItemDto,
  ) {
    return this.marketingAdditonInfoService.reorderAdditionInfo(
      marketingPageSectionId,
      reordered,
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
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete('marketingPageAdditionalInfo/:additionalInfoId')
  remove(
    @Param('additionalInfoId', new ParseUUIDPipe()) additionalInfoId: string,
  ) {
    return this.marketingAdditonInfoService.remove(additionalInfoId);
  }

  @ApiOperation({
    summary: 'Create a New Pricing Tile',
  })
  @ApiCreatedResponse({
    description: 'Pricing Tile created successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_STALLION_MATCH_PAGE_FOR_FARMS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('pricing-tile')
  createFreePricing(
    @Query() pricingTileTypeDto: PricingTileTypeDto,
    @Body() createPricingTileDto: CreatePricingTileDto,
  ) {
    return this.marketingAdditonInfoService.create(
      createPricingTileDto,
      pricingTileTypeDto.type,
    );
  }

  @ApiOperation({
    summary: 'Get All Pricing Tile - By Pricing type',
  })
  @ApiOkResponse({
    description: '',
    type: PricingTileResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_STALLION_MATCH_PAGE_FOR_FARMS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('pricing-tile')
  findFreePricingTile(
    @Query() pricingTileTypeDto: PricingTileTypeDto,
  ): Promise<PricingTileResponseDto[]> {
    return this.marketingTilesService.findAllBySectionType(
      pricingTileTypeDto.type,
    );
  }

  @ApiOperation({
    summary: 'Remove a Pricing Tile',
  })
  @ApiOkResponse({
    description: 'Pricing Tile removed successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_STALLION_MATCH_PAGE_FOR_FARMS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete('pricing-tile')
  removeFreePricingTile(
    @Query() pricingTileTypeDto: PricingTileTypeDto,
    @Body() deleteTileDto: DeleteTileDto,
  ) {
    return this.marketingTilesService.remove(
      deleteTileDto,
      pricingTileTypeDto.type,
    );
  }
}
