import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Payment Methods')
@Controller({
  path: 'payment-methods',
  version: '1',
})
export class PaymentMethodsController {
  constructor(private readonly PaymentMethodsService: PaymentMethodsService) {}
  @Get()
  findAll() {
    return this.PaymentMethodsService.findAll();
  }
}
