import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Order } from 'src/utils/constants/order';

export class TrackedStallionSearchDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional()
  @IsOptional()
  readonly stallionName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly farmName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly damSireName?: string;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  farmIds: Array<string>;

  @IsOptional()
  @ApiPropertyOptional({ example: [] })
  countries: Array<number>;
}
