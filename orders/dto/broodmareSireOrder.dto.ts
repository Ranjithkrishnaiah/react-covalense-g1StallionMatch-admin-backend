import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
} from 'class-validator';

export class BroodmareSireOrderDto {
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

  @ApiProperty({ example: [10, 11] })
  @IsOptional()
  locations: Array<number>;

  @ApiProperty({ nullable: true })
  @IsOptional()
  mareId: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  orderProductId: string;
}
