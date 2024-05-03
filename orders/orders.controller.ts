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
import { BroodmareAfinityOrderDto } from './dto/broodmareAfinityOrder.dto';
import { BroodmareSireOrderDto } from './dto/broodmareSireOrder.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { SalesCatelogueOrderDto } from './dto/salesCatelogueOrder.dto';
import { ShortlistStallionOrderDto } from './dto/shortlistStallionOrder.dto';
import { StallionAfinityOrderDto } from './dto/stallionAfinityOrder.dto';
import { StallionMatchProOrderDto } from './dto/stallionMatchPro.dto';
import { StockSaleOrderDto } from './dto/stockSaleOrder.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller({
  path: 'orders',
  version: '1',
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Order',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_CREATE_NEW_ORDER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Order or Approve Broodmare Sire Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created/updated.',
  })
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_CREATE_NEW_ORDER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('broodmare-sire')
  broodmareSireReport(@Body() broodmareSireCartDto: BroodmareSireOrderDto) {
    return this.ordersService.broodmareSireReport(broodmareSireCartDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Order or Approve for Broodmare Afinity Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created/updated.',
  })
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_CREATE_NEW_ORDER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('broodmare-afinity')
  broodmareAfinityReport(
    @Body() broodmareAfinityOrderDto: BroodmareAfinityOrderDto,
  ) {
    return this.ordersService.broodmareAfinityReport(broodmareAfinityOrderDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Order or Approve for Stallion Afinity Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created/update.',
  })
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_CREATE_NEW_ORDER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('stallion-afinity')
  stallionAfinityReport(
    @Body() stallionAfinityOrderDto: StallionAfinityOrderDto,
  ) {
    return this.ordersService.stallionAfinityReport(stallionAfinityOrderDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Order or Approve for Shortlist Stallion Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created/update.',
  })
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_CREATE_NEW_ORDER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('shortlist-stallion')
  shortlistStallionReport(
    @Body() shortlistStallionCartDto: ShortlistStallionOrderDto,
  ) {
    return this.ordersService.shortlistStallionReport(shortlistStallionCartDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Order or Approve Stallion Match Pro Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created/update.',
  })
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_CREATE_NEW_ORDER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('stallion-match-pro')
  stallionMatchProReport(
    @Body() stallionMatchProCartDto: StallionMatchProOrderDto,
  ) {
    return this.ordersService.stallionMatchProReport(stallionMatchProCartDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Order or Approve Sales Catelogue Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created/update.',
  })
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_CREATE_NEW_ORDER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('sales-catelogue')
  salesCatelogueReport(@Body() salesCatelogueCartDto: SalesCatelogueOrderDto) {
    return this.ordersService.salesCatelogueReport(salesCatelogueCartDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Order or Approve Stock Sale Report',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created/update.',
  })
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_CREATE_NEW_ORDER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('stock-sale')
  stockSaleReport(@Body() stockSaleOrderDto: StockSaleOrderDto) {
    return this.ordersService.stockSaleReport(stockSaleOrderDto);
  }

  @ApiOperation({
    summary: 'Get Report Orders By Country Id',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'REPORTS_ADMIN_ACTIVATE_LINKS',
      'REPORTS_ADMIN_DEACTIVATE_LINKS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('activate-deactivate-link/:orderProductId/:actionType')
  activateDeactivateLink(
    @Param('orderProductId') orderProductId: string,
    @Param('actionType') actionType: number,
  ) {
    return this.ordersService.activateDeactivateLink(
      orderProductId,
      actionType,
    );
  }

  @ApiOperation({
    summary: 'Veiw Order',
  })
  @ApiCreatedResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }
}
