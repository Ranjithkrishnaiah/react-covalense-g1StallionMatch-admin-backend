import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SocialShareTypeService } from './social-share-type.service';
@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('social-share-type')
@Controller({
  path: 'social-share-type',
  version: '1',
})
export class SocialShareTypeController {
  constructor(private readonly SocialShareService: SocialShareTypeService) {}
  @Get()
  findAll() {
    return this.SocialShareService.findAll();
  }
}
