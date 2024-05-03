import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { FarmGalleryImageDto } from 'src/farm-gallery-images/dto/farm-gallery-image.dto';
import { CreateMediaDto } from 'src/farm-media-info/dto/create-media.dto';
import { UpdateFarmDto } from 'src/farms/dto/update-farm.dto';

export class UpdateMarketingFarmDto {
  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  profile?: UpdateFarmDto;

  @ApiProperty({
    type: [FarmGalleryImageDto],
  })
  @IsOptional()
  @IsNotEmpty()
  galleryImages?: FarmGalleryImageDto[];

  @ApiProperty({ example: 'Sample Overview' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiProperty({
    type: [CreateMediaDto],
  })
  @IsOptional()
  @IsNotEmpty()
  mediaInfos?: CreateMediaDto[];
}
