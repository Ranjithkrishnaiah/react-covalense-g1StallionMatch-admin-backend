import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsOptional()
  categoryId: number;

  @ApiProperty()
  @IsOptional()
  productName: string;

  @ApiProperty()
  @IsOptional()
  price: number;

  @ApiProperty()
  @IsOptional()
  currencyId: number;

  @ApiProperty()
  @IsOptional()
  isActive: boolean;

  @ApiProperty({
    example: [
      { currencyId: 1, price: 500, isActive: true },
      { currencyId: 2, price: 400, isActive: true },
    ],
  })
  @IsOptional()
  @IsArray()
  pricingTable?: ArrayBuffer;

  createdBy?: number | null;
}
