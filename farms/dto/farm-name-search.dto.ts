import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Order } from 'src/utils/constants/order';
import { ToBoolean } from 'src/utils/to-boolean';

export class FarmNameSearchDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiProperty()
  @Type(() => String)
  @MinLength(3)
  @IsString()
  readonly farmName?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isFarmNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  readonly horseId?: string;
}
