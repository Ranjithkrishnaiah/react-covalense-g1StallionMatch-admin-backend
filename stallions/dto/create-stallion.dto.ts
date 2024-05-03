import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsUrl,
  Max,
  Min
} from 'class-validator';

export class CreateStallionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  horseId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  farmId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  countryId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  stateId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  fee: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  feeYear: number;

  @ApiProperty({ example: 15.8 })
  @IsNotEmpty()
  height: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  reasonId: number;

  @ApiProperty({
    example:
      'https://www.smportal.com/stallion/4cf0a2ee-6a3f-41e1-ba31-81df1fc4853b',
  })
  @IsOptional()
  @IsUrl()
  url: string;

  @ApiProperty({ example: 2001 })
  @IsOptional()
  yearToStud: number;

  @ApiPropertyOptional({ example: 2015 })
  @IsOptional()
  yearToRetired: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPrivateFee: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsOptional()
  @IsUUID()
  profileImageuuid: string; //If Profile image not uploaded this will be empty

  createdBy?: number | null;

  @ApiProperty({ example: '2022-06-14' })
  @IsOptional()
  startDate: Date;

  endDate?: Date | null;

  @ApiProperty({ example: false })
  @IsBoolean()
  forceCreateNew: boolean;
}
