import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ToBoolean } from 'src/utils/to-boolean';
import { Order } from 'src/utils/constants/order';
import { eligibilityEnum } from '../eligible.enum';

export class SearchOptionsDownloadDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly displayName?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isDisplayNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly countryId?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly class?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly venue?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly trackType?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly trackCondition?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly status?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly racetype?: number;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly distanceRange?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly fieldSize?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly date?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly includeEmptyField?: boolean;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly includeEmptyFieldSize?: boolean;

  @ApiPropertyOptional({ enum: eligibilityEnum })
  @IsEnum(eligibilityEnum)
  @IsOptional()
  readonly isEligible?: eligibilityEnum;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsUUID()
  @IsOptional()
  readonly horseId?: string;
}
