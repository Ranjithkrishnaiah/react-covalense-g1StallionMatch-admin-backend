import { Controller, UseGuards, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { MareRequestsService } from './mare-requests.service';

@ApiTags('Mare Request')
@Controller({
  path: 'mare-requests',
  version: '1',
})
export class MareRequestsController {
  constructor(
    private readonly mareRequestsService: MareRequestsService,
  ) {}

  @ApiOperation({
    summary: 'Get Mare Request',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':requestId')
  getMareRequest(@Param('requestId', new ParseUUIDPipe()) requestId: string) {
    return this.mareRequestsService.getMareRequest(requestId);
  }
}
