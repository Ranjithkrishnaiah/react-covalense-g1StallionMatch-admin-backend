import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StallionGalleryImageService } from './stallion-gallery-image.service';

@ApiTags('Stallion Gallery Images')
@Controller({
  path: 'stallion-gallery-images',
  version: '1',
})
export class StallionGalleryImageController {
  constructor(
    private readonly stallionGalleryImageServiceService: StallionGalleryImageService,
  ) {}

  /* @ApiBearerAuth()
  @Roles(RoleEnum.farmadmin)
  @UseGuards(JwtAuthenticationGuard, RolesGuard)
  @Post()
  create(@Request() req) {
    return
  } */
}
