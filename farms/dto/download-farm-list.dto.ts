import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ToBoolean } from 'src/utils/to-boolean';
import { FarmsStatus } from '../farms-status.enum';
import { PromotedStatus } from '../promoted-status.enum';
import { ExpiredFarms } from '../expired-farm.enum';
import { Order } from 'src/utils/constants/order';

export class SearchOptionsDownloadDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

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
  readonly farmId?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly country?: number;

  @ApiPropertyOptional({ enum: FarmsStatus })
  @IsEnum(FarmsStatus)
  @IsOptional()
  readonly Status?: FarmsStatus;

  @ApiPropertyOptional({ enum: PromotedStatus })
  @IsEnum(PromotedStatus)
  @IsOptional()
  readonly PromotedStatus?: PromotedStatus;

  @ApiPropertyOptional({ enum: ExpiredFarms })
  @IsEnum(ExpiredFarms)
  @IsOptional()
  readonly expiredStallion?: ExpiredFarms;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly RequiresVerification?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly activePeriod?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sortBy?: string;

  @ApiPropertyOptional()
  isFarmNameEntireSearch?: string;
}
