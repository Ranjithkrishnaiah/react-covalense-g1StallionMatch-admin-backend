import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ShortlistStallionOrderDto {
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
  mareId: string;

  @ApiProperty()
  @IsOptional()
  stallions: Array<string>;

  @ApiProperty({ nullable: true })
  @IsOptional()
  orderProductId: string;
}
