import { ApiResponseProperty } from '@nestjs/swagger';

export class RecentorderResponse {
  @ApiResponseProperty()
  orderId: number;

  @ApiResponseProperty()
  productName: string;

  @ApiResponseProperty()
  productId: number;
}
