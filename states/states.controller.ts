import {
  Controller,
  Get,
  Param,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { StatesService } from './states.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('States')
@Controller({
  path: 'states',
  version: '1',
})
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @ApiOperation({
    summary: 'Get All States',
  })
  @Get()
  findAll() {
    return this.statesService.findAll();
  }

  @ApiOperation({
    summary: 'Get States by Country Id',
  })
  @Get('by-country/:id')
  findAllByCountryId(@Param('id') id: string) {
    return this.statesService.findAllByCountryId(id);
  }
}
