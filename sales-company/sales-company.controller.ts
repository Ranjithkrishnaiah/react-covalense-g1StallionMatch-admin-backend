import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SalesCompanyService } from './sales-company.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Sales-Company')
@Controller({
  path: 'sales-company',
  version: '1',
})
export class SalesCompanyController {
  constructor(private readonly salesCompanyService: SalesCompanyService) {}

  @ApiOperation({
    summary: 'Get All Sales-Company',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get()
  findAll() {
    return this.salesCompanyService.findAll();
  }
}
