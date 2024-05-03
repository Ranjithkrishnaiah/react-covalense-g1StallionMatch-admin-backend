import { ApiResponseProperty } from '@nestjs/swagger';

export class PricingTileResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  title: string;
}
