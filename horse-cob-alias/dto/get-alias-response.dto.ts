import { ApiResponseProperty } from '@nestjs/swagger';

export class HorseCobAliasResponse {
  @ApiResponseProperty()
  horseId: number;

  @ApiResponseProperty()
  countryId: number;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  isActive: boolean;

  @ApiResponseProperty()
  isDefault: boolean;

  @ApiResponseProperty()
  horseUuid: number;

  @ApiResponseProperty()
  horseName: string;
}
