import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { Order } from 'src/utils/constants/order';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sortBy?: string;
}
