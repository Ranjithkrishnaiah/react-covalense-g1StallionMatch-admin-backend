import { Controller, Post, Body, UseGuards, SetMetadata, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { StallionRequestsService } from './stallion-requests.service';
import { CreateStallionRequestDto } from './dto/create-stallion-request.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Stallion Request')
@Controller({
  path: 'stallion-requests',
  version: '1',
})
export class StallionRequestsController {
  constructor(
    private readonly stallionRequestsService: StallionRequestsService,
  ) {}

  @ApiOperation({
    summary: 'Get Stallion Request',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':requestId')
  getStallionRequest(@Param('requestId', new ParseUUIDPipe()) requestId: string) {
    return this.stallionRequestsService.getStallionRequest(requestId);
  }
}
