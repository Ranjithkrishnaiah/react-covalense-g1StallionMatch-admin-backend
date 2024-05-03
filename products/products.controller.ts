import {
  Body,
  Controller,
  Get,
  Param,
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
import { DashboardDto } from 'src/messages/dto/dashboard.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { ProductDetailsResponseDto } from './dto/product-details-response.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { SearchOptionsDto } from './dto/product-sort.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Products-list',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: [
      'PRODUCTS_PROMO_MANAGEMENT_SEARCH_VIEW_READONLY',
      'PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_ADD_NEW_PRODUCTS',
      'PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_EDIT_EXISTING',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('product-list')
  list() {
    return this.productsService.findList();
  }

  @ApiOperation({
    summary: 'Get All Products',
  })
  @ApiOkResponse({
    description: '',
    type: ProductResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_SEARCH_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Product>> {
    return this.productsService.findAll(pageOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Products ',
  })
  @ApiCreatedResponse({
    description: 'Record Created successfully!',
  })
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_ADD_NEW_PRODUCTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  creates(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard')
  getDashboradData(@Query() optionsDto: DashboardDto) {
    return this.productsService.getProductsDashboardData(optionsDto);
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
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_DASHBOARD_EXPORT_FUNCTION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.productsService.getDashboradReportData(optionsDto);
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/redemptions-graph')
  getRedemptionsData(@Query() optionsDto: DashboardDto) {
    return this.productsService.getRedemptionsData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Most Popular Promocodes Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/most-popular-promocodes')
  getMostPopularPromocodesData(@Query() optionsDto: DashboardDto) {
    return this.productsService.getMostPopularPromocodesData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Most Popular Products Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/most-popular-products')
  getMostPopularProductsData(@Query() optionsDto: DashboardDto) {
    return this.productsService.getMostPopularProductsData(optionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Product Details ',
  })
  @ApiCreatedResponse({
    description: '',
    type: ProductDetailsResponseDto,
  })
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_EDIT_EXISTING'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.findProductDetails(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Product Details ',
  })
  @ApiCreatedResponse({
    description: 'Record Updated successfully!',
  })
  @SetMetadata('api', {
    permissions: ['PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_EDIT_EXISTING'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() data: UpdateProductDto) {
    return this.productsService.update(id, data);
  }
}
