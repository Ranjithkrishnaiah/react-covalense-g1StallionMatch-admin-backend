import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional
} from 'class-validator';
import { DiscountType } from '../discount-type.enum';
import { DurationType } from '../duration-type.enum';
import { Duration } from '../duration.enum';

export class CreatePromoCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  promoCode: string;

  @ApiProperty()
  @IsNotEmpty()
  promoCodeName: string;

  @ApiProperty()
  @IsOptional()
  inputProductIds: Array<number>;

  @ApiProperty()
  @IsOptional()
  memberId: number;

  @ApiPropertyOptional({ enum: Duration })
  @IsOptional()
  duration: Duration;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsEnum(DiscountType)
  readonly discountType: DiscountType;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsOptional()
  currencyId: number;

  @ApiProperty()
  @IsOptional()
  durationNo: number;

  @ApiProperty()
  @IsOptional()
  redemtions: number;

  @ApiProperty()
  @IsOptional()
  startDate: Date;

  @ApiProperty()
  @IsOptional()
  endDate: Date;

  @ApiPropertyOptional({ enum: DurationType })
  @IsOptional()
  durationType?: DurationType;

  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;

  createdBy?: number | null;

  @ApiProperty()
  @IsOptional()
  inputUserIds: Array<string>;

  userIds?: string | null;
  productids?: string | null;
}
