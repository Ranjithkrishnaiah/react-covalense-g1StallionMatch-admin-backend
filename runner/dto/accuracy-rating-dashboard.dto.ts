import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ACCURACYRATINGTYPES } from 'src/utils/constants/dashboard-kpi';

export class AccuracyRatingDashboardDto {
  @ApiProperty()
  @IsString()
  readonly fromDate?: string;

  @ApiProperty()
  @IsString()
  readonly toDate?: string;

  @ApiProperty()
  @IsString()
  readonly countryId?: number;

  @ApiProperty({ enum: ACCURACYRATINGTYPES })
  @IsString()
  readonly accuracyType?: string;
}
