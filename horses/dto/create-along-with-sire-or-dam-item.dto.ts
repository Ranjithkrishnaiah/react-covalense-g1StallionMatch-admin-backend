import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID
} from 'class-validator';

export class CreateAlongWithSireOrDamItemDto {
  @ApiProperty({ example: 'AETHELSTAN' })
  @IsNotEmpty()
  horseName: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 1990 })
  @IsOptional()
  @IsNumber()
  yob: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dob: Date;

  @ApiProperty({ example: 'M' })
  @IsOptional()
  sex: string;

  @ApiProperty({ example: false })
  @IsOptional()
  gelding: boolean;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  colourId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  horseTypeId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  currencyId?: number;

  @ApiProperty({ example: 250000 })
  @IsOptional()
  @IsNumber()
  totalPrizeMoneyEarned: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  isLocked: boolean;
  
  @ApiProperty({ example: '220E4FA5-AFB4-EC11-B7F8-F4EE08D04E43' })
  @IsOptional()
  @IsUUID()
  horseId?: string;

  createdBy?: number | null;

  verifiedBy?: number | null;
}
