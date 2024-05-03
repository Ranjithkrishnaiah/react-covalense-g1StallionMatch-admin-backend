import { ApiResponseProperty } from '@nestjs/swagger';

export class ProgenyResponseDto {
  @ApiResponseProperty()
  horseId: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  sex: string;

  @ApiResponseProperty()
  yob: number;

  @ApiResponseProperty()
  countryName: string;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  damName: string;

  @ApiResponseProperty()
  sireName: string;

  @ApiResponseProperty()
  runner: boolean;

  @ApiResponseProperty()
  stakes: boolean;

  @ApiResponseProperty() s;
  progeny: number;

  @ApiResponseProperty()
  isVerified: boolean;

  @ApiResponseProperty()
  createdOn: Date;
}
