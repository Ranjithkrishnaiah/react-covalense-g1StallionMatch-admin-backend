import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AuthChangePasswordDto {
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
}
