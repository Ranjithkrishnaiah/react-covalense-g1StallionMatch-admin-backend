import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { RoleGuard } from 'src/role/role.gaurd';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { PricingService } from './pricing.service';

@ApiTags('Pricing')
@Controller({
  path: 'pricing',
  version: '1',
})
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @ApiOperation({
    summary: 'Get All Prices for Products',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findAll(@Param('id') id: number) {
    return this.pricingService.find(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Pricing Records for Product ',
  })
  @ApiCreatedResponse({
    description: 'Record Created successfully!',
  })
  @SetMetadata('api', {
    permissions: [
      'PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_ADD_NEW_PRODUCTS',
      'PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_EDIT_EXISTING',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  creates(@Body() data: CreatePricingDto) {
    return this.pricingService.create(data);
  }
}
