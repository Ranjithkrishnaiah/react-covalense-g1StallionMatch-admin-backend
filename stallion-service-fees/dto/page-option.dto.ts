import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ToBoolean } from 'src/utils/to-boolean';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { Order } from 'src/utils/constants/order';

export class pageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  date?: string;

  //   @ApiPropertyOptional()
  //   @Type(() => Boolean)
  //   @IsBoolean()
  //   @ToBoolean()
  //   @IsOptional()
  //   readonly isFarmNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sortBy?: string;
}
