import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DashboardExcessDto {
  @ApiProperty()
  @IsString()
  readonly fromDate?: string;

  @ApiProperty()
  @IsString()
  readonly toDate?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly countryId?: string;
}
