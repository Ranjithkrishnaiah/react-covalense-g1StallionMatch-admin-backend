import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Orientation } from '../carousal-orientation.enum';

export class UpdateCarouselInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  buttonUrl?: string;

  @ApiProperty()
  @IsString()
  buttonText: string;

  @ApiProperty({ example: 'right' })
  @IsString()
  orientation: Orientation;

  @ApiProperty({ default: false })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsOptional()
  fileuuid?: string;
}
