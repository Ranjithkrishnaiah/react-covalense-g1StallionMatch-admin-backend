import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationTypeService } from './notification-types.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiTags('Notification Types')
@Controller({
  path: 'notification-types',
  version: '1',
})
export class NotificationTypesController {
  constructor(
    private readonly NotificationTypeService: NotificationTypeService,
  ) { }
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findAll() {
    return this.NotificationTypeService.findAll();
  }
}
