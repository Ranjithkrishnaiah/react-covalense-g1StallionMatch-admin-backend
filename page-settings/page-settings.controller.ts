import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { HorsePageSettingsDto } from './dto/horse-page-settings.dto';
import { MarketingPageSettingsDto } from './dto/marketing-page-settings.dto';
import { MemberPageSettingsDto } from './dto/member-page-settings.dto';
import { MessagesPageSettingsDto } from './dto/messages-page-settings.dto';
import { RacePageSettingsDto } from './dto/race-page-settings.dto';
import { ReportPageSettingsDto } from './dto/reports-page-settings.dto';
import { RunnerPageSettingsDto } from './dto/runner-page-settings.dto';
import { UpdatePageSettingsDto } from './dto/update-page-settings.dto';
import { PageSettingsService } from './page-settings.service';

@ApiBearerAuth()
@ApiTags('Page Settings')
@Controller({
  path: 'page-settings',
  version: '1',
})
export class PageSettingsController {
  constructor(private readonly pageSettingsService: PageSettingsService) {}

  @ApiOperation({
    summary: 'Update Stallion Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Stallion Settings',
  })
  @SetMetadata('api', {
    permissions: ['STALLION_ADMIN_MANAGE_STALLION_ADMIN_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Put()
  updatePageSettings(@Body() updatePageSettingsDto: UpdatePageSettingsDto) {
    return this.pageSettingsService.updatePageSettings(updatePageSettingsDto);
  }

  @ApiOperation({
    summary: 'Update Horse Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Horse Settings',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_MANAGE_HORSE_DETAILS_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('horse')
  updateHorseSettings(@Body() horsePageSettingsDto: HorsePageSettingsDto) {
    return this.pageSettingsService.updateHorseSettings(horsePageSettingsDto);
  }

  @ApiOperation({
    summary: 'Update Member Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Member Settings',
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_MANAGE_MEMBER_ADMIN_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('member')
  updateMemberSettings(@Body() memberPageSettingsDto: MemberPageSettingsDto) {
    return this.pageSettingsService.updateMemberSettings(memberPageSettingsDto);
  }

  @ApiOperation({
    summary: 'Update Farm Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Farm Settings',
  })
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_MANAGE_FARM_ADMIN_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('farm')
  updateFarmSettings(@Body() farmPageSettingsDto: MemberPageSettingsDto) {
    return this.pageSettingsService.updateFarmSettings(farmPageSettingsDto);
  }

  @ApiOperation({
    summary: 'Update Messages Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Messages Settings',
  })
  @SetMetadata('api', {
    permissions: ['MESSAGING_ADMIN_MANAGE_MESSAGE_ADMIN_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('messages')
  updateMessagesSettings(
    @Body() messagesPageSettingsDto: MessagesPageSettingsDto,
  ) {
    return this.pageSettingsService.updateMessagesSettings(
      messagesPageSettingsDto,
    );
  }

  @ApiOperation({
    summary: 'Update Marketing Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Marketing Settings',
  })
  @SetMetadata('api', {
    permissions: [
      'MARKETING_LANDING_PAGE',
      'MARKETING_HOME_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
      'MARKETING_TRENDS_PAGE',
      'MARKETING_REPORTS_OVERVIEW_PAGE',
      'MARKETING_FARM_PAGE_PROMOTED',
      'MARKETING_STALLION_PAGE_PROMOTED',
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('marketing')
  updateMarketingSettings(
    @Body() marketingPageSettingsDto: MarketingPageSettingsDto,
  ) {
    return this.pageSettingsService.updateMarketingSettings(
      marketingPageSettingsDto,
    );
  }

  @ApiOperation({
    summary: 'Update Race Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Race Settings',
  })
  @SetMetadata('api', {
    permissions: ['RACE_ADMIN_MANAGE_RACE_PAGE_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('race')
  updateRaceSettings(@Body() racePageSettingsDto: RacePageSettingsDto) {
    return this.pageSettingsService.updateRaceSettings(racePageSettingsDto);
  }

  @ApiOperation({
    summary: 'Update Runner Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Runner Settings',
  })
  @SetMetadata('api', {
    permissions: ['RUNNER_ADMIN_MANAGE_RUNNER_PAGE_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('runner')
  updateRunnerSettings(@Body() runnerPageSettingsDto: RunnerPageSettingsDto) {
    return this.pageSettingsService.updateRunnerSettings(runnerPageSettingsDto);
  }

  @ApiOperation({
    summary: 'Update Notification Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Notification Settings',
  })
  @SetMetadata('api', {
    permissions: ['NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATION_ADMIN_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('notification')
  updateNotificationsSettings(
    @Body() notificationPageSettingsDto: MemberPageSettingsDto,
  ) {
    return this.pageSettingsService.updateNotificationsSettings(
      notificationPageSettingsDto,
    );
  }

  @ApiOperation({
    summary: 'Update Reports Settings',
  })
  @ApiCreatedResponse({
    description: 'Update Reports Settings',
  })
  @SetMetadata('api', {
    permissions: ['REPORTS_ADMIN_MANAGE_REPORT_ADMIN_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('report')
  updateReportsSettings(@Body() reportPageSettingsDto: ReportPageSettingsDto) {
    return this.pageSettingsService.updateReportsSettings(
      reportPageSettingsDto,
    );
  }

  @ApiOperation({
    summary: 'Get Page Settings',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: [
      'HORSE_ADMIN_MANAGE_HORSE_DETAILS_SETTINGS',
      'STALLION_ADMIN_MANAGE_STALLION_ADMIN_SETTINGS',
      'FARM_ADMIN_MANAGE_FARM_ADMIN_SETTINGS',
      'MEMBER_ADMIN_MANAGE_MEMBER_ADMIN_SETTINGS',
      'RACE_ADMIN_MANAGE_RACE_PAGE_SETTINGS',
      'MESSAGING_ADMIN_MANAGE_MESSAGE_ADMIN_SETTINGS',
      'REPORTS_ADMIN_MANAGE_REPORT_ADMIN_SETTINGS',
      'NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATION_ADMIN_SETTINGS',
      'RUNNER_ADMIN_MANAGE_RUNNER_PAGE_SETTINGS',
      'MARKETING_LANDING_PAGE',
      'MARKETING_HOME_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
      'MARKETING_TRENDS_PAGE',
      'MARKETING_REPORTS_OVERVIEW_PAGE',
      'MARKETING_FARM_PAGE_PROMOTED',
      'MARKETING_STALLION_PAGE_PROMOTED',
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll() {
    return this.pageSettingsService.findAll();
  }

  @ApiOperation({
    summary: 'Get Single Page Settings',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: [
      'HORSE_ADMIN_MANAGE_HORSE_DETAILS_SETTINGS',
      'STALLION_ADMIN_MANAGE_STALLION_ADMIN_SETTINGS',
      'FARM_ADMIN_MANAGE_FARM_ADMIN_SETTINGS',
      'MEMBER_ADMIN_MANAGE_MEMBER_ADMIN_SETTINGS',
      'RACE_ADMIN_MANAGE_RACE_PAGE_SETTINGS',
      'MESSAGING_ADMIN_MANAGE_MESSAGE_ADMIN_SETTINGS',
      'REPORTS_ADMIN_MANAGE_REPORT_ADMIN_SETTINGS',
      'NOTIFICATIONS_ADMIN_MANAGE_NOTIFICATION_ADMIN_SETTINGS',
      'RUNNER_ADMIN_MANAGE_RUNNER_PAGE_SETTINGS',
      'MARKETING_LANDING_PAGE',
      'MARKETING_HOME_PAGE',
      'MARKETING_STALLION_MATCH_PAGE_FOR_FARMS',
      'MARKETING_TRENDS_PAGE',
      'MARKETING_REPORTS_OVERVIEW_PAGE',
      'MARKETING_FARM_PAGE_PROMOTED',
      'MARKETING_STALLION_PAGE_PROMOTED',
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':moduleId')
  findOne(@Param('moduleId') moduleId: string) {
    return this.pageSettingsService.findOne({ moduleId: moduleId });
  }
}
