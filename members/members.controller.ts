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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { AdminUpdateDto } from './dto/admin-update.dto';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { MemberDashboardDto } from './dto/member-dashboard.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SearchEmailDto } from './dto/search-email.dto';
import { SearchNameDto } from './dto/search-name.dto';
import { SearchOptionsDownloadDto } from './dto/search-options-download.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Member } from './entities/member.entity';
import { MembersService } from './members.service';

@ApiBearerAuth()
@ApiTags('Members')
@Controller({
  path: 'members',
  version: '1',
})
export class MembersController {
  constructor(private readonly membersService: MembersService) {}
  @ApiOperation({
    summary: 'Get all members by filters',
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_READ_ONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  async findAll(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Member>> {
    return this.membersService.findAll(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get All Member Locations',
  })
  @Get('locations')
  @UseGuards(JwtAuthenticationGuard)
  async getAllMemberLocations() {
    return await this.membersService.getAllMemberLocations();
  }

  @ApiOperation({
    summary: 'Get email array',
  })
  @Get('get-data-arrays')
  async getEmails(): Promise<PageDto<Member>> {
    return this.membersService.findEmails();
  }

  @ApiOperation({
    summary: 'Update member details',
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_EDIT_MEMBER_DETAILS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMemberDto: AdminUpdateDto,
  ) {
    const member = await this.membersService.findOne({
      memberuuid: id,
    });
    return this.membersService.adminUpdate(member, updateMemberDto);
  }

  @ApiOperation({
    summary: 'Find member by fullName',
  })
  @Get('byName/:fullName')
  findByName(
    @Param('fullName') fullName: string,
    @Query() searchNameDto: SearchNameDto,
  ) {
    return this.membersService.findByName(fullName, searchNameDto);
  }

  @ApiOperation({
    summary: 'Find member by email',
  })
  @Get('byEmail/:email')
  findByEmail(
    @Param('email') email: string,
    @Query() searchNameDto: SearchEmailDto,
  ) {
    return this.membersService.findByEmail(email, searchNameDto);
  }

  @ApiOperation({
    summary: 'Update Member Profile',
  })
  @Patch('profile/:id')
  async createNewMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const member = await this.membersService.findOne({
      memberuuid: id,
    });
    return this.membersService.updateProfile(member, updateProfileDto);
  }

  @ApiOperation({
    summary: 'Upload Profile Image',
  })
  @Post('upload-image')
  async imageUpload(@Body() fileInfo: FileUploadUrlDto) {
    return this.membersService.profileImageUpload(fileInfo);
  }
  @ApiOperation({
    summary: 'Get list of linked farms',
  })
  @Get('linkdFarms/:id')
  getLinkedFarms(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membersService.getLinkedFarms(id);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_VIEW_MEMBER_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard')
  getDashboradData(@Query() optionsDto: MemberDashboardDto) {
    return this.membersService.getMemberDashboardData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Sessions Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_VIEW_MEMBER_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-sessions')
  getDashboradSessionsData(@Query() optionsDto: MemberDashboardDto) {
    return this.membersService.getDashboradSessionsData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Report',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_EXPORT_LISTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-report')
  async getDashboradReportData(
    @Query() optionsDto: DashboardReportDto,
    @Res() res: Response,
  ) {
    let file = await this.membersService.getDashboradReportData(optionsDto);
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="report.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Get Dashboard - Visitors Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_VIEW_MEMBER_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-visitors')
  getDashboradVisitorData(@Query() optionsDto: MemberDashboardDto) {
    return this.membersService.getDashboradVisitorData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard - Visitors Avg Data',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_VIEW_MEMBER_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard-avg-visitors')
  getDashboradVisitorAvgData(@Query() optionsDto: MemberDashboardDto) {
    return this.membersService.getDashboradVisitorAvgData(optionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard - Registations by country',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_VIEW_MEMBER_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/registations-by-country')
  getMemberRegistrationsByCountryData(@Query() optionsDto: MemberDashboardDto) {
    return this.membersService.getMemberRegistrationsByCountryData(optionsDto);
  }

  @Get('all/lists')
  async memeberList(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Member>> {
    return this.membersService.memeberList(pageOptionsDto);
  }
  @Delete('list/:id')
  async memeberRemove(@Param('id') id: string) {
    return this.membersService.memeberRemove(id);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.membersService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }
  @Get('listing/members')
  async members() {
    return this.membersService.members();
  }

  @Get('listing/members-without-admins')
  async membersWithOutAdmins() {
    return this.membersService.membersWithOutAdmins();
  }

  @ApiOperation({
    summary: 'Invite a member',
  })
  @ApiCreatedResponse({ description: 'Invited successfully.' })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_INVITE_A_NEW_USER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('invite-member')
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(@Body() invitationDto: CreateUserInvitationDto) {
    return this.membersService.inviteUser(invitationDto);
  }
  @ApiOperation({
    summary: 'Get member details',
  })
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.membersService.findMember(id);
  }

  @ApiOperation({
    summary: 'Get member details',
  })
  @Get('latest-orders/:id')
  async getLatestOrders(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.membersService.getLatestOrders(id, pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Get Dashboard Data - Registration Rate',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_VIEW_MEMBER_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/registration-rate')
  getAverageDistanceGraph(@Query() optionsDto: MemberDashboardDto) {
    return this.membersService.getRegistrationRateGraph(optionsDto);
  }

  @ApiOperation({
    summary: 'Get World Reach Members',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_VIEW_MEMBER_DASHBOARD'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('dashboard/world-reach-members')
  getWorldReachStallions(@Query() optionsDto: MemberDashboardDto) {
    return this.membersService.getWorldReachMembers(optionsDto);
  }

  @ApiOperation({
    summary: 'Download Members-list ',
  })
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_EXPORT_LISTS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('list/download-list')
  async download(
    @Query() searchOptionsDto: SearchOptionsDownloadDto,
  ): Promise<Member> {
    return this.membersService.download(searchOptionsDto);
  }
}
