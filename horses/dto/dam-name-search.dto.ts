import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Order } from 'src/utils/constants/order';
import { ToBoolean } from 'src/utils/to-boolean';

export class DamNameSearchDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiProperty()
  @Type(() => String)
  @MinLength(3)
  @IsString()
  readonly damName?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isDamNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  damCob?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  yob?: Number;
}
