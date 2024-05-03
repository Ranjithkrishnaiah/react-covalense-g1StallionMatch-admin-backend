import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  SetMetadata,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { PageDto } from 'src/utils/dtos/page.dto';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { SearchOptionsDto } from './dto/search-options.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { TitleResponseDto } from './dto/title-response.dto';
import { linkTypeResponseDto } from './dto/link-type-response.dto';
import { NotificationRequestDto } from './dto/notification-request.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Notifications')
@Controller({
  path: 'notifications',
  version: '1',
})
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @ApiOperation({
    summary: 'Create Notification',
  })
  @ApiPaginatedResponse(NotificationResponseDto)
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATIONS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() notificationRequestDto: NotificationRequestDto) {
    return this.notificationsService.requestNotification(
      notificationRequestDto,
    );
  }

  @ApiOperation({
    summary: 'Get All Notification by Search',
  })
  @ApiPaginatedResponse(NotificationResponseDto)
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'NOTIFICATIONS_ADMIN_READ_ONLY',
      'NOTIFICATIONS_ADMIN_EXPORT_LISTS',
      'NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATIONS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<NotificationResponseDto[]>> {
    return this.notificationsService.findAll(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Notification - By Id',
  })
  @ApiOkResponse({
    description: '',
    type: NotificationResponseDto,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'NOTIFICATIONS_ADMIN_READ_ONLY',
      'NOTIFICATIONS_ADMIN_EXPORT_LISTS',
      'NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATIONS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':notificationId')
  findOne(
    @Param('notificationId', new ParseUUIDPipe()) notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.findOneById(notificationId);
  }

  @ApiOperation({
    summary: 'Delete Notification - By Id',
  })
  @ApiOkResponse({
    description: 'Notification deleted successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATIONS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete(':notificationId')
  deleteNotification(
    @Param('notificationId', new ParseUUIDPipe()) notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(notificationId);
  }

  @ApiOperation({
    summary: 'Update Notification - Mark as read/Unread',
  })
  @ApiOkResponse({
    description: 'Notification updated successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATIONS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':notificationId')
  patch(
    @Param('notificationId', new ParseUUIDPipe()) notificationId: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.updateNotification(
      notificationId,
      updateNotificationDto,
    );
  }


  @ApiOperation({
    summary: 'Get Notification Titles',
  })
  @ApiOkResponse({
    description: '',
    type: TitleResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'NOTIFICATIONS_ADMIN_READ_ONLY',
      'NOTIFICATIONS_ADMIN_EXPORT_LISTS',
      'NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATIONS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/titles')
  findTitles(): Promise<TitleResponseDto[]> {
    return this.notificationsService.findTitles();
  }

  @ApiOperation({
    summary: 'Get Link Type',
  })
  @ApiOkResponse({
    description: '',
    type: linkTypeResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'NOTIFICATIONS_ADMIN_READ_ONLY',
      'NOTIFICATIONS_ADMIN_EXPORT_LISTS',
      'NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATIONS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/link-type')
  findLinkTypes(): Promise<linkTypeResponseDto[]> {
    return this.notificationsService.findLinkTypes();
  }

  @ApiOperation({
    summary: 'Get Unread Notification Count',
  })
  @ApiOkResponse({ description: '' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('my/unread-count')
  getMsgCount() {
    return this.notificationsService.getMsgCount();
  }

  @ApiOperation({
    summary: 'Download Notifications List',
  })
  @ApiOkResponse({ description: 'Download Notifications List' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: [
      'NOTIFICATIONS_ADMIN_EXPORT_LISTS',
      'NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATIONS',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/download')
  async download(@Query() searchOptionsDownloadDto: SearchOptionsDto) {
    return this.notificationsService.getDownloadData(searchOptionsDownloadDto);
  }
}
