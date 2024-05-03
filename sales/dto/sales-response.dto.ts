import { ApiResponseProperty } from '@nestjs/swagger';

export class SaleResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  salesId: number;

  @ApiResponseProperty()
  salesName: string;

  @ApiResponseProperty()
  salesCode: string;

  @ApiResponseProperty()
  startDate: Date;

  @ApiResponseProperty()
  endDate: Date;

  @ApiResponseProperty()
  salesCompanyId: number;

  @ApiResponseProperty()
  companyName: string;
}
