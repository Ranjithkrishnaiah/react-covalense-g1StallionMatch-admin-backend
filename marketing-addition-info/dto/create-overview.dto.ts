import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateReportsOverviewDto {
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
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsOptional()
  fileuuid?: string;

  @ApiProperty()
  @IsOptional()
  pdfuuid?: string;

  @ApiProperty()
  @IsOptional()
  productCode?: string;
}
