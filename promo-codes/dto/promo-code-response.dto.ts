import { ApiResponseProperty } from '@nestjs/swagger';

export class PromoCodeResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  promoCode: string;

  @ApiResponseProperty()
  discountType: string;

  @ApiResponseProperty()
  price: number;

  @ApiResponseProperty()
  currencyId: number;

  @ApiResponseProperty()
  productids: string;

  @ApiResponseProperty()
  memberId: number;

  @ApiResponseProperty()
  duration: string;

  @ApiResponseProperty()
  durationType: string;

  @ApiResponseProperty()
  durationNo: number;

  @ApiResponseProperty()
  startDate: Date;

  @ApiResponseProperty()
  endDate: Date;

  @ApiResponseProperty()
  userIds: string;
}
