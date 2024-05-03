import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';

export class CreateUserDto {
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
  @Validate(IsNotExist, ['Member'], {
    message:
      'The email address is already in use. Please try another email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'bWF0dGhld2Vubmlz',
    minimum: 6,
    maximum: 20,
    description: 'Must contain at least one letter & one number',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty({ example: '' })
  @IsUUID()
  roleId: string;

  @ApiProperty()
  @Type(() => Array)
  @IsArray()
  permissions?: [];

  hash?: string | null;
  createdBy?: number | null;
}
