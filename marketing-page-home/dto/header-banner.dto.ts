import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class HeaderBannerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buttonText: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buttonUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isAnonymous: boolean;
}
