import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { UpdateStallionProfileDto } from 'src/stallions/dto/update-stallion-profile.dto';
import { StallionGalleryImageDto } from 'src/stallion-gallery-images/dto/stallion-gallery-image.dto';

export class UpdateMarketingStallionDto {
  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  profile?: UpdateStallionProfileDto;

  @ApiProperty({
    type: [StallionGalleryImageDto],
  })
  @IsOptional()
  @IsNotEmpty()
  galleryImages?: StallionGalleryImageDto[];

  @ApiProperty({ example: 'Sample Overview' })
  @IsOptional()
  @IsString()
  overview?: string;
}
