import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CountryPayload } from './interface/country-payload.interface';
import { CountryService } from './service/country.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Countries')
@Controller({
  path: 'countries',
  version: '1',
})
export class CountryController {
  constructor(private countryService: CountryService) {}
  @ApiOperation({
    summary: 'Get all countries',
  })
  @Get()
  getAllCountries(): Promise<CountryPayload[]> {
    return this.countryService.getAllCountries();
  }

  @ApiOperation({
    summary: 'Get all countries with respective states',
  })
  @Get('with-states')
  getAllCountriesWithStates() {
    return this.countryService.getAllCountriesWithStates();
  }
}
