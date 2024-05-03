import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SocialLinksService } from './social-links.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Social Links')
@Controller({
  path: 'social-links',
  version: '1',
})
export class SocialLiksController {
  constructor(private readonly SocialLinksService: SocialLinksService) {}
  @Get()
  findAll() {
    return this.SocialLinksService.findAll();
  }
}
