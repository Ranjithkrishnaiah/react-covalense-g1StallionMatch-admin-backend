import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrderTransactionService } from './order-transaction.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { PageDto } from 'src/utils/dtos/page.dto';
import { RecentOrderResponse } from 'src/order-product/dto/recent-order-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { RecentorderResponse } from './dto/recent-orders-by-member-response.dto';

@ApiTags('Order Transactions')
@Controller({
  path: 'order-transactions',
  version: '1',
})
export class OrderTransactionsController {
  constructor(
    private readonly orderTransactionService: OrderTransactionService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Recent Order',
  })
  @ApiOkResponse({
    description: '',
    type: RecentOrderResponse,
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('recent-order')
  findRecentOrder(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<RecentOrderResponse[]>> {
    return this.orderTransactionService.findRecentOrder(searchOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Popular Payment Method',
  })
  @ApiOkResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('popular-payment-method')
  findPopularPaymentMethod(@Query() searchOptionsDto: SearchOptionsDto) {
    return this.orderTransactionService.findPopularPaymentMethod(
      searchOptionsDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Recent Order-by member',
  })
  @ApiOkResponse({
    description: '',
    type: RecentorderResponse,
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('recent-order-by-member/:id')
  findRecentOrderByMember(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.orderTransactionService.findRecentOrderByMember(id);
  }
}
