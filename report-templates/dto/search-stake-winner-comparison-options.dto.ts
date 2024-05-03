import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { StakesWinnerComparisionSort } from 'src/utils/constants/stallions';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchStakeWinnerComparisonOptionsDto extends PageOptionsDto {
  @ApiProperty()
  @IsNumber()
  readonly stallionId?: number;

  @ApiProperty()
  @IsNumber()
  readonly mareId?: number;

  @ApiPropertyOptional({
    enum: StakesWinnerComparisionSort,
    default: StakesWinnerComparisionSort.SIMILARITYSCORE,
  })
  @IsEnum(StakesWinnerComparisionSort)
  @IsOptional()
  readonly sortBy?: StakesWinnerComparisionSort =
    StakesWinnerComparisionSort.SIMILARITYSCORE;
}
