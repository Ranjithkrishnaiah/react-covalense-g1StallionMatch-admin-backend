import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Order } from 'src/utils/constants/order';
import { ToBoolean } from 'src/utils/to-boolean';

export class HorseNameSearchDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiProperty()
  @Type(() => String)
  @MinLength(3)
  @IsString()
  readonly horseName?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isHorseNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @MaxLength(1)
  @IsOptional()
  readonly sex?: string;
}
