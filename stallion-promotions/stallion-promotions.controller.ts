import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { StallionPromotionService } from './stallion-promotions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { CreateStallionPromotionDto } from './dto/create-stallion-promotion.dto';
import { StopStallionPromotionDto } from './dto/stop-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@ApiTags('Stallion Promotions')
@Controller({
  path: 'stallion-promotions',
  version: '1',
})
export class StallionPromotionController {
  constructor(
    private readonly StallionPromotionService: StallionPromotionService,
  ) {}

  @Get()
  findAll() {
    return this.StallionPromotionService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':promotionId')
  findOne(@Param('promotionId') promotionId: number) {
    return this.StallionPromotionService.findOne(promotionId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post()
  create(@Body() createStallionNomination: CreateStallionPromotionDto) {
    return this.StallionPromotionService.create(createStallionNomination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('stop-promotion/:stallionId')
  stopPromotion(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() stopPromotionDto: StopStallionPromotionDto,
  ) {
    return this.StallionPromotionService.stopPromotion(
      stallionId,
      stopPromotionDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch()
  updatePromotion(@Body() updatePromotionDto: UpdatePromotionDto) {
    return this.StallionPromotionService.updatePromotion(updatePromotionDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch(':promotionId/stop-promotion-byid')
  stopPromotionById(
    @Param('promotionId') promotionId: number,
    @Body() stopStallionPromotionDto: StopStallionPromotionDto,
  ) {
    return this.StallionPromotionService.stopPromotionById(
      promotionId,
      stopStallionPromotionDto,
    );
  }
}
