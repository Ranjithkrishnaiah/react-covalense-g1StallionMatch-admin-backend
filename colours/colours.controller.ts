import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ColoursService } from './colours.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Colours')
@Controller({
  path: 'colours',
  version: '1',
})
export class ColoursController {
  constructor(private readonly coloursService: ColoursService) {}

  @ApiOperation({
    summary: 'Get All Colours',
  })
  @Get()
  findAll() {
    return this.coloursService.findAll();
  }

  @ApiOperation({
    summary: 'Get Colour By Id',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coloursService.findOne(+id);
  }
}
