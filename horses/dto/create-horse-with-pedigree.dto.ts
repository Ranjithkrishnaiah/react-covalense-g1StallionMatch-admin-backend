import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateHorseWithPedigreeDto {
  @ApiProperty({ example: 'AETHELSTAN' })
  @IsNotEmpty()
  horseName: string;

  @ApiProperty({ example: 'M' })
  @IsNotEmpty()
  @MaxLength(1)
  sex: string;

  @ApiProperty({ example: 1990 })
  @IsNotEmpty()
  @IsNumber()
  yob: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  colourId: number;

  @ApiProperty({ example: false })
  @IsOptional()
  gelding: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isLocked: boolean;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  horseTypeId: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dob: Date;

  @ApiProperty({ example: 1 })
  @IsOptional()
  currencyId?: number;

  @ApiProperty({ example: 250000 })
  @IsOptional()
  @IsNumber()
  totalPrizeMoneyEarned: number;

  @ApiProperty({ example: false })
  isFormDataModified?: boolean | null;

  @ApiProperty({ example: '220E4FA5-AFB4-EC11-B7F8-F4EE08D04E43' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  createdBy?: number | null;

  verifiedBy?: number | null;
}
