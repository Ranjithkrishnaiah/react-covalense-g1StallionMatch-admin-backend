import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserInvitationDto {
  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
