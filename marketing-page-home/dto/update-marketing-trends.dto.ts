import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateMarketingPageHomeDto } from './create-marketing-page-home.dto';
import { FooterBannerDto } from './footer-banner.dto';
import { HeaderBannerDto } from './header-banner.dto';
import { UpdatTilePermissionsDto } from './update-tile-permissions.dto';
import { HeaderBannerRegisteredDto } from './header-banner-registered.dto';
import { FooterBannerRegisteredDto } from './footer-banner-registered.dto';

export class UpdateMarketingTrendsDto extends PartialType(
  CreateMarketingPageHomeDto,
) {
  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  headerBanner?: HeaderBannerDto;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  headerBannerRegistered?: HeaderBannerRegisteredDto;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  footerBanner?: FooterBannerDto;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  footerBannerRegistered?: FooterBannerRegisteredDto;

  @ApiProperty({
    isArray: true,
    type: UpdatTilePermissionsDto,
  })
  @IsOptional()
  @IsNotEmpty()
  tilePermissions?: UpdatTilePermissionsDto[];
}
