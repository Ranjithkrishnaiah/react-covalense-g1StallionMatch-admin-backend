import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject, IsObject, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateMarketingPageHomeDto } from './create-marketing-page-home.dto';
import { Banner2Dto } from './banner2.dto';
import { StallioFarmMainHeadingDto } from './stallion-farm-main-heading.dto';

export class UpdateMarketingStallionFarmDto extends PartialType(
  CreateMarketingPageHomeDto,
) {
  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  mainHeading?: StallioFarmMainHeadingDto;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  banner1?: Banner2Dto;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  banner2?: Banner2Dto;
}
