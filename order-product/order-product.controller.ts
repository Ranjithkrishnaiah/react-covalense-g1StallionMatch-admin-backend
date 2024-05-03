import {
  Controller
} from '@nestjs/common';
import {
  ApiTags
} from '@nestjs/swagger';
import { OrderProductService } from './order-product.service';

@ApiTags('Order Products')
@Controller({
  path: 'order-products',
  version: '1',
})
export class OrderProductController {
  constructor(private readonly orderProductService: OrderProductService) {}

 
}
