import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Order } from 'src/utils/constants/order';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ToBoolean } from 'src/utils/to-boolean';
import { eligibilityEnum } from '../eligible.enum';

export class SearchOptionsDto extends PageOptionsDto {
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

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly winner?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly stakes?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsUUID()
  @IsOptional()
  readonly raceId?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sortBy?: string;
}
