import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SourceService } from './source.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Source')
@Controller({
  path: 'source',
  version: '1',
})
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Get()
  findAll() {
    return this.sourceService.findAll();
  }
}
