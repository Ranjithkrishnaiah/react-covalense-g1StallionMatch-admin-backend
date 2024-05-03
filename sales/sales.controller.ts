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
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { PageDto } from 'src/utils/dtos/page.dto';
import { SaleCalenderResponseDto } from './dto/calender-response.dto';
import { SaleDetailsResponseDto } from './dto/sale-detalis-response.dto';
import { SalesRequestDto } from './dto/sales-request.dto';
import { SaleResponseDto } from './dto/sales-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';
import { SalesService } from './sales.service';

@ApiBearerAuth()
@ApiTags('Sales')
@Controller({
  path: 'sales',
  version: '1',
})
export class SalesController {
  constructor(private readonly SalesService: SalesService) {}

  @ApiOperation({
    summary: 'Get All Sales',
  })
  @ApiPaginatedResponse(SaleResponseDto)
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['SALES_SEARCH_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<SaleResponseDto[]>> {
    return this.SalesService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Create Sale',
  })
  @ApiOkResponse({
    description: 'Sale Created successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['SALES_ADD_NEW_SALE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() salesDto: SalesRequestDto) {
    return this.SalesService.create(salesDto);
  }

  @ApiOperation({
    summary: 'Update Sale',
  })
  @ApiOkResponse({
    description: 'Sale updated successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['SALES_EDIT_EXISTING_SALE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':salesId')
  salesUpdate(
    @Param('salesId', new ParseUUIDPipe()) salesId: string,
    @Body() updateDto: UpdateSalesDto,
  ): Promise<any> {
    return this.SalesService.salesUpdate(salesId, updateDto);
  }

  @ApiOperation({
    summary: 'Delete Sale',
  })
  @ApiOkResponse({
    description: 'Sale Deleted successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['SALES_EDIT_EXISTING_SALE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete(':id')
  deleteSale(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.SalesService.delete(id);
  }

  @ApiOperation({
    summary: 'Get Sales By month',
  })
  @ApiOkResponse({
    description: '',
    type: SaleCalenderResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['SALES_CALENDAR'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('fetchCurrentMonthSales/:month')
  fetchCurrentMonthSales(
    @Query('month') month: string,
  ): Promise<SaleCalenderResponseDto[]> {
    return this.SalesService.fetchCurrentMonthSales(month);
  }
  @ApiOperation({
    summary: 'Get Sale Details - By Id',
  })
  @ApiOkResponse({
    description: '',
    type: SaleDetailsResponseDto,
  })
  @ApiBearerAuth()
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['SALES_EDIT_EXISTING_SALE'],
  })
  @Get(':salesId')
  findOne(
    @Param('salesId', new ParseUUIDPipe()) salesId: string,
  ): Promise<SaleDetailsResponseDto> {
    return this.SalesService.getSalesById(salesId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({
    summary: 'Get All Sales List By Location',
  })
  @ApiOkResponse({
    description: 'Get All Sales List By Location',
  })
  @Get('getSalesByCountryId/:countryId')
  findSalesByLocation(@Param('countryId') countryId: string) {
    return this.SalesService.findSalesByLocation({ countryId: countryId });
  }
}
