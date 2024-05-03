import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Currencies')
@Controller({
  path: 'currencies',
  version: '1',
})
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}
  @ApiOperation({
    summary: 'Get All Currencies',
  })
  @Get()
  findAll() {
    return this.currenciesService.findAll();
  }

  @ApiOperation({
    summary: 'Search Currency By Id',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.currenciesService.findOne(+id);
  }
}
