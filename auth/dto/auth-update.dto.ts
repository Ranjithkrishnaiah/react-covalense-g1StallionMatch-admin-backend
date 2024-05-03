import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
export class AuthUpdateDto {
  @ApiProperty({ example: 'Matthew Ennis' })
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  fullName?: string;

  // @ApiProperty({ example: 'matthew.ennis@yopmail.com' })
  // @IsNotEmpty({ message: 'mustBeNotEmpty' })
  // @IsString()
  // email: string;

  @ApiProperty({ example: 'Street1' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 11 })
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  countryId: number;

  @ApiProperty({ example: 2 })
  @IsOptional()
  stateId?: number;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsOptional()
  @IsUUID()
  profileImageuuid?: string;
}
