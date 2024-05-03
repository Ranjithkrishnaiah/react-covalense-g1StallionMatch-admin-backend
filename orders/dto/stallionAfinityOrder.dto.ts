import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class StallionAfinityOrderDto {
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

  @ApiProperty({ nullable: true })
  @IsOptional()
  stallionId: string;

  @ApiProperty()
  @IsOptional()
  farms: Array<string>;

  @ApiProperty({ nullable: true })
  @IsOptional()
  orderProductId: string;
}
