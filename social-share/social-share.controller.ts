import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SocialShareService } from './social-share.service';
import { RoleGuard } from 'src/role/role.gaurd';
import { shareData } from './dto/report-share.dto';
@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('social-share')
@Controller({
  path: 'social-share',
  version: '1',
})
export class SocialShareController {
  constructor(private readonly socialShareService: SocialShareService) {}

  @ApiOperation({
    summary: 'Capture stallion report share data',
  })
  @ApiOkResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post('save-share-report')
  async shareData(@Body() data: shareData) {
     return this.socialShareService.create(data);
  }
}
