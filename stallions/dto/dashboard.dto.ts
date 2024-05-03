import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { StallionListFilter } from 'src/utils/constants/stallions';
export class DashboardDto {
  @ApiPropertyOptional({ enum: StallionListFilter })
  @IsEnum(StallionListFilter)
  @IsOptional()
  readonly filterBy?: String;

  @ApiProperty()
  @IsString()
  fromDate?: string;

  @ApiProperty()
  @IsString()
 toDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
   stallionId?: string;
}
