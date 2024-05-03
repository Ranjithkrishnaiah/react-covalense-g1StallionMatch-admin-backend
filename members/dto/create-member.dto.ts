import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { IsNotExist } from '../../utils/validators/is-not-exists.validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'matthew.ennis@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @Validate(IsNotExist, ['Member'], {
    message: 'emailAlreadyExists',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'bWF0dGhld2Vubmlz' })
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Matthew Ennis' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  stateId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  roleId: number;

  hash?: string | null;

  createdBy?: number | null;
}
