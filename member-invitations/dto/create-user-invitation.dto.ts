import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserInvitationDto {
  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsNumber()
  accessLevelId: number;

  /* Stallions list will be added when user access level is 3rd party*/

  hash?: string | null;
}
