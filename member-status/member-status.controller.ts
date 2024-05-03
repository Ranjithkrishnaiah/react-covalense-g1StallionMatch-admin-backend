import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MemberStatusService } from './member-status.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Member Status')
@Controller({
  path: 'member-status',
  version: '1',
})
export class MemberStatusController {
  constructor(private readonly MemberStatusService: MemberStatusService) {}
  @Get()
  findAll() {
    return this.MemberStatusService.findAll();
  }
}
