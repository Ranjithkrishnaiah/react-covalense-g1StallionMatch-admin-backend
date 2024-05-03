import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { OrderStatusService } from './order-status.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrderStatusResponseDto } from './dto/order-status-response.dto';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Order Status')
@Controller({
  path: 'order-status',
  version: '1',
})
export class OrderStatusController {
  constructor(private readonly orderStatusService: OrderStatusService) {}

  @ApiOperation({
    summary: 'Get Order Status List',
  })
  @ApiOkResponse({
    description: '',
    type: OrderStatusResponseDto,
    isArray: true,
  })
  @Get()
  async findOrderStatus(): Promise<OrderStatusResponseDto[]> {
    return this.orderStatusService.findAll();
  }
}
