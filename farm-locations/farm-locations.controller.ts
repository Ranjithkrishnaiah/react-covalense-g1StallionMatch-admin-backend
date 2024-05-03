import { Controller } from '@nestjs/common';
import { FarmLocationsService } from './farm-locations.service';

@Controller('farm-locations')
export class FarmLocationsController {
  constructor(private readonly farmLocationsService: FarmLocationsService) {}
}
