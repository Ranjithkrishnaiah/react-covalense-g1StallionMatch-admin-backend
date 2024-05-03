import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  Validate,
} from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Matthew Ennis' })
  @IsOptional()
  @IsNotEmpty()
  fullName?: string;

  @ApiProperty({ example: 'matthew.ennis@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsOptional()
  @IsNotEmpty()
  @Validate(IsNotExist, ['Member'], {
    message: 'emailAlreadyExists',
  })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'bWF0dGhld2Vubmlz' })
  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  countryId?: number;

  @ApiProperty({ example: 15 })
  @IsOptional()
  @IsNumber()
  stateId?: number;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsOptional()
  @IsUUID()
  profileImageuuid?: string;

  hash?: string | null;

  modifiedBy?: number | null;
}
