import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional
} from 'class-validator';

export class CreatePricingDto {
  @ApiProperty()
  @IsOptional()
  currencyId: number;

  @ApiProperty()
  @IsOptional()
  productId: number;

  @ApiProperty()
  @IsOptional()
  price: number;

  @ApiProperty()
  @IsOptional()
  tier1: number;

 @ApiProperty()
  @IsOptional()
  tier2: number;

  @ApiProperty()
  @IsOptional()
  tier3: number;

  @ApiProperty()
  @IsOptional()
  studFeeRange: string;

  @ApiProperty()
  @IsOptional()
  isActive: boolean;
}
