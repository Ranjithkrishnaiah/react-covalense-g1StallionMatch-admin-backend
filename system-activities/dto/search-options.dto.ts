import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { ActivityModule, Result } from 'src/utils/constants/system-activity';
import { SystemActivitySort } from 'src/utils/constants/system-activity-sort';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ToBoolean } from 'src/utils/to-boolean';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: SystemActivitySort,
    default: SystemActivitySort.DATE,
  })
  @IsEnum(SystemActivitySort)
  @IsString()
  @IsOptional()
  readonly sortBy?: SystemActivitySort = SystemActivitySort.DATE;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly horseName?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly farmName?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly activity?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly countryId?: number;

  @ApiPropertyOptional({ example: 'YYYY-MM-DD' })
  @IsOptional()
  readonly fromDate?: string;

  @ApiPropertyOptional({ example: 'YYYY-MM-DD' })
  @IsOptional()
  readonly toDate?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isRequiredApproval?: boolean;

  @ApiPropertyOptional({ enum: Result })
  @IsOptional()
  @IsString()
  readonly result?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly reportType?: number;

  @ApiPropertyOptional({ enum: ActivityModule })
  @IsOptional()
  activityModule?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  readonly isRedirect?: boolean;

}
