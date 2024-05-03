import { ApiResponseProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ProductResDto {
  @ApiResponseProperty()
  @IsNumber()
  id: number;

  @ApiResponseProperty()
  @IsNumber()
  categoryId: number;

  @ApiResponseProperty()
  @IsNumber()
  price: number;

  @ApiResponseProperty()
  @IsNumber()
  currencyId: number;

  @ApiResponseProperty()
  @IsString()
  productName: string;
}
