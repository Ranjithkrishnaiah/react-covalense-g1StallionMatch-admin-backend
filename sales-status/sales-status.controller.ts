import {
  Controller,
  Get,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SalesStatusService } from './sales-status.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Sales-Status')
@Controller({
  path: 'sales-status',
  version: '1',
})
export class SalesStatusController {
  constructor(private readonly salesStatusService: SalesStatusService) {}

  @ApiOperation({
    summary: 'Get All Sales-Status',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get()
  findAll() {
    return this.salesStatusService.findAll();
  }
}
