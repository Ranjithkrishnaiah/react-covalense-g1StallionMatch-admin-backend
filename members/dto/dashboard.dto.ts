import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DashboardDto {
  @ApiProperty()
  @IsString()
  readonly fromDate?: string;

  @ApiProperty()
  @IsString()
  readonly toDate?: string;
}
