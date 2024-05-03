import { Controller } from '@nestjs/common';
import { FarmGalleryImageService } from './farm-gallery-image.service';

@Controller({
  path: 'farm-gallery-images',
  version: '1',
})
export class FarmGalleryImageController {
  constructor(
    private readonly farmGalleryImageService: FarmGalleryImageService,
  ) {}
}
