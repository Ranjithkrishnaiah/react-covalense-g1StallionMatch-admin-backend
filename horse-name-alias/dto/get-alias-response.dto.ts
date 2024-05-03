import { ApiResponseProperty } from '@nestjs/swagger';

export class HorseNameAliasResponse {
  @ApiResponseProperty()
  horseId: number;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  isActive: boolean;

  @ApiResponseProperty()
  isDefault: boolean;
}
