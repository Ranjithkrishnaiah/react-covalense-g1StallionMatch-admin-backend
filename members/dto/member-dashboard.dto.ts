import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MemberDashboardDto {
  @ApiProperty()
  @IsString()
  readonly fromDate?: string;

  @ApiProperty()
  @IsString()
  readonly toDate?: string;
}
