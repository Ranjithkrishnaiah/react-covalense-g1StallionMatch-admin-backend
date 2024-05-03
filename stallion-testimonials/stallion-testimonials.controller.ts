import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StallionTestimonialsService } from './stallion-testimonials.service';

@ApiTags('Stallion Testimonials')
@Controller({
  path: 'stallion-testimonials',
  version: '1',
})
export class StallionTestimonialsController {
  constructor(
    private readonly stallionTestimonialsService: StallionTestimonialsService,
  ) {}

  
}
