import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SalesCatelogueOrderDto {
  @ApiProperty()
  @IsString()
  actionType: string;

  @ApiProperty()
  @IsOptional()
  countryId: number;

  @ApiProperty()
  @IsOptional()
  currencyId: number;

  @ApiProperty()
  @IsOptional()
  postalCode: string;

  @ApiProperty()
  @IsOptional()
  location: number;

  @ApiProperty()
  @IsOptional()
  sales: Array<number>;

  @ApiProperty()
  @IsOptional()
  lots: Array<number>;

  @ApiProperty({ nullable: true })
  @IsOptional()
  orderProductId: string;
}
