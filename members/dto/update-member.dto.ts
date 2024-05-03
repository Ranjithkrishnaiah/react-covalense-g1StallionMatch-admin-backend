import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateMemberDto {
  @ApiProperty({ example: 'bWF0dGhld2Vubmlz' })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Matthew Ennis' })
  @IsNotEmpty()
  fullName?: string;

  @ApiProperty({ example: 'Street1' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId?: number;

  @ApiProperty({ example: 2 })
  @IsOptional()
  stateId?: number;

  hash?: string | null;

  modifiedBy?: number | null;
}
