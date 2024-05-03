import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateHorseDto {
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

  @ApiProperty({ example: '220E4FA5-AFB4-EC11-B7F8-F4EE08D04E43' })
  @IsOptional()
  @IsUUID()
  progenyId: string;

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

  @ApiProperty({ example: 'S' })
  @IsOptional()
  @IsString()
  tag: string;

  @ApiProperty({ example: '220E4FA5-AFB4-EC11-B7F8-F4EE08D04E43' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  createdBy?: number | null;

  verifiedBy?: number | null;
}
