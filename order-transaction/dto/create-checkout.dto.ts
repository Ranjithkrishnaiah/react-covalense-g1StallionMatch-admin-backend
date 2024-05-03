import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({
    example: `
        [ {
            "cartId":"",
            "productId": 1,
            "quantity": 5
          },
          {
            "cartId":"",
            "productId": 2,
            "quantity": 2
          }]
        `,
  })
  @IsArray()
  items: Array<{ productId: number; quantity: number; cartId: string }>;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNumber()
  subTotal: number;

  @ApiProperty()
  @IsNumber()
  couponId: number;

  @ApiProperty()
  @IsNumber()
  discount: number;
}
