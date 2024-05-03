import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Orientation } from '../carousal-orientation.enum';

export class CreateCarouselDto {
  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsUUID()
  marketingPageSectionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buttonText?: string;

  @ApiProperty()
  @IsOptional()
  // @IsNotEmpty()
  @IsString()
  buttonUrl?: string;

  @ApiProperty({ default: 'right' })
  @IsNotEmpty()
  @IsString()
  orientation: Orientation;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsOptional()
  fileuuid?: string;
}
