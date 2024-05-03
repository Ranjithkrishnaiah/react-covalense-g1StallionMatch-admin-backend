import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class HeroImageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;
}
