import { ApiResponseProperty } from '@nestjs/swagger';

export class SaleCalenderResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  salesName: string;

  @ApiResponseProperty()
  startDate: Date;

  @ApiResponseProperty()
  endDate: Date;
}
