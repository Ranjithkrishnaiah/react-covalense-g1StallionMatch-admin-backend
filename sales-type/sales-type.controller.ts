import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SalesTypeService } from './sales-type.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Sales-Type')
@Controller({
  path: 'sales-type',
  version: '1',
})
export class SalesTypeController {
  constructor(private readonly salesTypeService: SalesTypeService) {}

  @ApiOperation({
    summary: 'Get All Sales-Type',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get()
  findAll() {
    return this.salesTypeService.findAll();
  }
}
