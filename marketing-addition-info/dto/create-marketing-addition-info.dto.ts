import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { UploadImageDto } from './upload-image.dto';

export class CreateMarketingAdditonInfoDto {
  @ApiProperty()
  @IsNumber()
  marketingPageId: number;

  @ApiProperty()
  @IsNumber()
  marketingPageSectionId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  marketingPageAdditionInfoName: string;

  @ApiProperty()
  @IsString()
  marketingPageAdditionInfoDescription: string;

  @ApiProperty()
  @IsString()
  marketingPageAdditionInfoCompany: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  marketingPageAdditionInfoCompanyUrl?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  fileInfo?: UploadImageDto;
}
