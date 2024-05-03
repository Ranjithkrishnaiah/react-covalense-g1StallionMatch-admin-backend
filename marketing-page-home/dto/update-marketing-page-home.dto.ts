import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject, IsObject, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateMarketingPageHomeDto } from './create-marketing-page-home.dto';
import { MainHeadingDto } from './main-heading.dto';
import { HeroImageDto } from './hero-image.dto';
import { Banner1Dto } from './banner1.dto';
import { Banner2Dto } from './banner2.dto';

export class UpdateMarketingPageHomeDto extends PartialType(
  CreateMarketingPageHomeDto,
) {
  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  mainHeading?: MainHeadingDto;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  heroImage?: HeroImageDto;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  banner1?: Banner1Dto;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  banner2?: Banner2Dto;
}
