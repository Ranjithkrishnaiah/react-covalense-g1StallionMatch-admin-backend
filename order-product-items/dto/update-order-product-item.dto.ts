import { PartialType } from '@nestjs/swagger';
import { CreateOrderProductItemDto } from './create-order-product-item.dto';

export class UpdateOrderProductItemDto extends PartialType(
  CreateOrderProductItemDto,
) {}
