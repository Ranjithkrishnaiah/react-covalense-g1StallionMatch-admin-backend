import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SalesRequestDto {
  @ApiProperty()
  @ApiProperty()
  @IsString()
  salescompanyName: string | null;

  @ApiProperty()
  @IsNumber()
  countryId: number;

  @ApiProperty()
  @IsString()
  salescompanyAddress: string;

  @ApiProperty()
  @IsString()
  salescompanyWebsite: string;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly limit?: number = 20;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
