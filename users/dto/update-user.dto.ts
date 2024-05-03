import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength
} from 'class-validator';
import { ToBoolean } from 'src/utils/to-boolean';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId: number;

  @ApiPropertyOptional({ example: 10 })
  stateId: number;

  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsEmail()
  email: string;

  @ApiProperty()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  isResetPassword: boolean;

  @ApiProperty({
    example: 'bWF0dGhld2Vubmlz',
    minimum: 8,
    maximum: 20,
    description: 'Must contain at least one letter & one number',
  })
  // @IsNotEmpty()
  @IsString()
  // @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({ example: '' })
  @IsUUID()
  roleId: string;

  @ApiProperty()
  @Type(() => Array)
  @IsArray()
  permissions?: [];

  updatedBy?: number | null;
}
