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

export class studfeeChartDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly date?: string;
}
