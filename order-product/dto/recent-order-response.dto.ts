import { ApiResponseProperty } from '@nestjs/swagger';

export class RecentOrderResponse {
  @ApiResponseProperty()
  orderId: number;

  @ApiResponseProperty()
  paymentIntent: string;

  @ApiResponseProperty()
  paymentMode: string;

  @ApiResponseProperty()
  status: string;

  @ApiResponseProperty()
  productName: string;

  @ApiResponseProperty()
  clientName: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  paid: number;

  @ApiResponseProperty()
  subTotal: number;

  @ApiResponseProperty()
  discount: number;

  @ApiResponseProperty()
  paymentMethod: string;

  @ApiResponseProperty()
  productId: number;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  currencyCode: string;

  @ApiResponseProperty()
  currencySymbol: string;

  @ApiResponseProperty()
  orderCreatedOn: string;
}
