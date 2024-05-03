import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { ToBoolean } from 'src/utils/to-boolean';

export class SearchOptionsDownloadDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly stallionName?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isStallionNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly farmName?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isFarmNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly stallionId?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly farmId?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly country?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly state?: number;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly priceRange?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly colour?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly currency?: number;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly promoted?: boolean;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly fee?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly feeYear?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly feeStatus?: number;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sireName?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly GrandSireName?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly keyAncestor?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sortBy?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly includePrivateFee?: boolean;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly feeUpdatedBy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly startDate?: string;
}
