import { ApiResponseProperty } from '@nestjs/swagger';

export class ProductDetailsResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  categoryId: number;

  @ApiResponseProperty()
  productName: string;

  @ApiResponseProperty()
  price: number;

  @ApiResponseProperty()
  currencyId: number;

  @ApiResponseProperty()
  createdOn: number;

  @ApiResponseProperty()
  modifiedOn: number;
}
