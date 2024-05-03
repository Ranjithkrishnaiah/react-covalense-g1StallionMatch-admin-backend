import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateTestimonialDto } from './create-testimonial.dto';

export class UpdateMarketingAdditonInfoDto extends PartialType(
  CreateTestimonialDto,
) {
  @ApiProperty()
  @IsUUID()
  marketingPageSectionUuid: string;

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
}
