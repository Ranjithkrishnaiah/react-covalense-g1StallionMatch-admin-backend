import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { VenueSearchDto } from './dto/search-options.dto';
import { VenueService } from './venue.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Race-Venues')
@Controller({
  path: 'race-venue',
  version: '1',
})
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get()
  findAll(@Query() searchOptions: VenueSearchDto) {
    return this.venueService.findAll(searchOptions);
  }
}
