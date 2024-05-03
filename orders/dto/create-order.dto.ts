import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: `
    [ ]
    `,
  })
  @IsArray()
  items: Array<{
    stallionId: number;
    farmId: number;
    mareId: number;
    stallionPromotionId: number;
    lotId: number;
    stallionNominationId: number;
    commonList: number;
    sales: number;
  }>;

  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsNumber()
  countryId: number;

  @ApiProperty()
  @IsString()
  postalCode: string;

  memberId?: number | null;
  createdBy?: number | null;
  sessionId?: string | null;
}
