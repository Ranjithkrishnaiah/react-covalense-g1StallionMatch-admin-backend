import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SalesLotInfoTempService } from './sales-lot-info-temp.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('sales-lot-info-temp')
@Controller({
  path: 'sales-lot-info-temp',
  version: '1',
})
export class SalesLotInfoTempController {
  constructor(
    private readonly salesLotInfoTempService: SalesLotInfoTempService,
  ) {}

  @ApiOperation({
    summary: 'Get All Imported Data ',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get(':id')
  find(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.salesLotInfoTempService.find(id);
  }
}
