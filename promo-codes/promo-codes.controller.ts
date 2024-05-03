import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { PromoCodeResponseDto } from './dto/promo-code-response.dto';
import { SearchOptionsPromoDto } from './dto/search-options.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { PromoCodeService } from './promo-codes.service';

@ApiTags('Promo Codes')
@Controller({
  path: 'promo-codes',
  version: '1',
})
export class PromoCodesController {
  constructor(private readonly promoCodeService: PromoCodeService) { }

  @ApiOperation({ summary: 'Get All Promo Codes' })
  @ApiOkResponse({
    description: '',
    type: PromoCodeResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_SEARCH_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(@Query() pageOptionsDto: SearchOptionsPromoDto) {
    return this.promoCodeService.findAll(pageOptionsDto);
  }

  @ApiOperation({ summary: 'Get Promo Codes - By id' })
  @ApiOkResponse({
    description: '',
    type: PromoCodeResponseDto,
  })
  @Get(':promoCode')
  findOne(
    @Param('promoCode') promoCode: string,
  ): Promise<PromoCodeResponseDto> {
    return this.promoCodeService.findOne({ promoCode: promoCode });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Promo codes ',
  })
  @ApiCreatedResponse({
    description: 'Record Created successfully!',
  })

  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_PROMOCODE_ADD_NEW_PROMOCODE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() data: CreatePromoCodeDto) {
    return this.promoCodeService.create(data);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Promo codes',
  })
  @ApiCreatedResponse({
    description: 'Record Updated successfully!',
  })

  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_PROMOCODE_EDIT_EXISTING'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() data: UpdatePromoDto) {
    return this.promoCodeService.update(id, data);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_PROMOCODE_EDIT_EXISTING'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.promoCodeService.delete(id);
  }

  @ApiOperation({ summary: 'Download Promo Code List' })
  @ApiOkResponse({
    description: '',
    type: PromoCodeResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_SEARCH_EXPORT_FUNCTION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/download')
  download() {
    return this.promoCodeService.download();
  }
}
