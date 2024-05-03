import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Order } from 'src/utils/constants/order';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.DESC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.DESC;

  @ApiPropertyOptional({ example: '2020-01-15' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly fromDate?: string;

  @ApiPropertyOptional({ example: '2022-10-18' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly toData?: string;
}
