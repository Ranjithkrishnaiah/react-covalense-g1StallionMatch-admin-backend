import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CreatePreferedNotificationDto } from './dto/create-prefered-notification.dto';
import { PreferedNotificationResponseDto } from './dto/prefered-notification-response.dto';
import { PreferedNotificationService } from './prefered-notifications.service';

@ApiTags('Prefered Notifications')
@Controller({
  path: 'prefered-notifications',
  version: '1',
})
export class PreferedNotificationsController {
  constructor(
    private readonly preferedNotificationService: PreferedNotificationService,
  ) {}

  @ApiOperation({ summary: 'Create Prefered Notification' })
  @ApiCreatedResponse({
    description: 'Prefered Notification created Successfully.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post()
  create(@Body() createPreferedNotificationDto: CreatePreferedNotificationDto) {
    return this.preferedNotificationService.create(
      createPreferedNotificationDto,
    );
  }

  @ApiOperation({ summary: 'Get All Prefered Notifications' })
  @ApiOkResponse({
    description: '',
    type: PreferedNotificationResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  getAll(): Promise<PreferedNotificationResponseDto[]> {
    return this.preferedNotificationService.getAll();
  }
}
