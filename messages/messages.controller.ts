import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { MessageBoostRequestDto } from './dto/messages-boost-request.dto';
import { MessageBroadcastRequestDto } from './dto/messages-broadcast-request.dto';
import { MessagesByFarmResponseDto } from './dto/messages-by-farm-response.dto';
import { MessageExtendedBoostRequestDto } from './dto/messages-extendedboost-request.dto';
import { MessageRequestDto } from './dto/messages-request.dto';
import { MessageResponseDto } from './dto/messages-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SearchedFarmsStallionsDto } from './dto/searched-farms-stallions.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@Controller({
  path: 'messages',
  version: '1',
})
export class MessageController {
  constructor(private readonly messagesService: MessagesService) {}

  @ApiOperation({
    summary: 'Get All Message',
  })
  @ApiOkResponse({
    description: '',
    type: MessageResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_READ_ONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<MessageResponseDto[]> {
    return this.messagesService.findAll(pageOptionsDto);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_SEND_NEW_MESSAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() messageDto: MessageRequestDto) {
    return this.messagesService.create(messageDto);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_VIEW_EDIT_CONVERSATIONS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch()
  update(@Body() updateDto: UpdateMessageDto): Promise<any> {
    return this.messagesService.update(updateDto);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_DELETE_A_CONVERSATION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete()
  deleteNominationRequest(@Body() deleteMessageDto: DeleteMessageDto) {
    return this.messagesService.delete(deleteMessageDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard')
  getDashboradData(@Query() optionsDto: DashboardDto) {
    return this.messagesService.getMessagesDashboardData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Unread Message Count',
  })
  @ApiOkResponse({
    description: 'Get Unread Message Count',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getMsgCount() {
    return this.messagesService.getMsgCount();
  }

  @ApiOperation({
    summary: 'Creat Broadcast Message',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_SEND_NEW_MESSAGE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('broadcast')
  createBroadcast(@Body() messageDto: MessageBroadcastRequestDto) {
    return this.messagesService.createBroadcast(messageDto);
  }

  @ApiOperation({
    summary: 'Creat Boost Message',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_SEND_NEW_BOOST'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('local-boost')
  createBoost(@Body() messageDto: MessageBoostRequestDto) {
    return this.messagesService.createBoost(messageDto);
  }

  @ApiOperation({
    summary: 'Create extended boost messages',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_SEND_NEW_BOOST'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('extended-boost')
  createExtendedBoost(@Body() messageDto: MessageExtendedBoostRequestDto) {
    return this.messagesService.createExtendedBoost(messageDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Report',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_DASHBOARD_EXPORT_FUNCTION'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.messagesService.getDashboradReportData(optionsDto);
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="sample.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Recipients and Countries count',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_SEND_NEW_BOOST'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('local-boost/recipients-countries')
  getLocalBoostRecipientsCountries(
    @Body() searchedFarmsStallionsDto: SearchedFarmsStallionsDto,
  ) {
    return this.messagesService.getBoostProfileRecipientsCountriesCount(
      searchedFarmsStallionsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/msg-count-graph')
  getCountGraphData(@Query() optionsDto: DashboardDto) {
    return this.messagesService.getCountGraphData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/most-mentioned-stallions')
  getMostMentionedStallionsData(@Query() optionsDto: DashboardDto) {
    return this.messagesService.getMostMentionedStallionsData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/most-engaged-users')
  getMostEngagedUsersData(@Query() optionsDto: DashboardDto) {
    return this.messagesService.getMostEngagedUsersData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_DASHBOARD_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/conversation-breakdown')
  getConversationBreakdownData(@Query() optionsDto: DashboardDto) {
    return this.messagesService.getConversationBreakdownData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Messages list for download',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_EXPORT_LISTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/download')
  getDownloadList(@Query() optionsDto: SearchOptionsDto) {
    return this.messagesService.getDownloadList(optionsDto);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_VIEW_EDIT_CONVERSATIONS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':channelId')
  @HttpCode(HttpStatus.OK)
  async findMsgHistory(
    @Param('channelId', new ParseUUIDPipe()) channelId: string,
  ): Promise<MessagesByFarmResponseDto[]> {
    return this.messagesService.findMsgHistory(channelId);
  }

  @ApiOperation({
    summary: 'Message Update - Mark As Read',
  })
  @ApiOkResponse({
    description: 'Message updated successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_VIEW_EDIT_CONVERSATIONS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('read/:channelId')
  @HttpCode(HttpStatus.CREATED)
  async patch(@Param('channelId', new ParseUUIDPipe()) channelId: string) {
    return this.messagesService.readMsgs(channelId);
  }
}
