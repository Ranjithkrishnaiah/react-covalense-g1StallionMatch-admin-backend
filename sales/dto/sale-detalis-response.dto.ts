import { ApiResponseProperty } from '@nestjs/swagger';

export class SaleDetailsResponseDto {
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
  countryId: number;

  @ApiResponseProperty()
  salesCompanyId: number;

  @ApiResponseProperty()
  salesInfoId: number;

  @ApiResponseProperty()
  isOnlineSales: boolean;

  @ApiResponseProperty()
  isPublic: boolean;

  @ApiResponseProperty()
  isHIP: boolean;

  @ApiResponseProperty()
  salesfileURL: string;

  @ApiResponseProperty()
  salesfileURLSDX: string;

  // @ApiResponseProperty()
  // senderName:string;

  // @ApiResponseProperty()
  // roleName:string;
}
