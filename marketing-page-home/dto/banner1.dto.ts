import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Banner1Dto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bannerDescription1: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bannerDescription2: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bannerDescription3: string;
}
