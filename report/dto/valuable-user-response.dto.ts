import { ApiResponseProperty } from '@nestjs/swagger';

export class ValuableUserResponse {
  @ApiResponseProperty()
  clientName: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  total: number;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  currencyCode: string;

  @ApiResponseProperty()
  currencySymbol: string;
}
