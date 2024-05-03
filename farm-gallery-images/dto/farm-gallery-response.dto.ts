import { ApiResponseProperty } from '@nestjs/swagger';

export class FarmGalleryResponseDto {
  @ApiResponseProperty()
  mediauuid: string;

  @ApiResponseProperty()
  fileName: string;

  @ApiResponseProperty()
  mediaUrl: string;

  @ApiResponseProperty()
  mediaThumbnailUrl: string;

  @ApiResponseProperty()
  mediaShortenUrl: string;
}
