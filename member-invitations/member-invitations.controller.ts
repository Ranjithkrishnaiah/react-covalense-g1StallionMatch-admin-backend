import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  UseGuards,
  Param,
  Query,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { CreateUserInvitationStallionDto } from './dto/create-member-stallion.dto';
import { InvitationLinkDto } from './dto/invitation-link.dto';
import { MemberInvitationsService } from './member-invitations.service';
import { SearchOptionsDto } from './dto/search-options.dto';
import { CreateFarmMemberInvitationDto } from './dto/create-farmmember-invitation.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('member-invitations')
@Controller({
  path: 'member-invitations',
  version: '1',
})
export class MemberInvitationsController {
  constructor(
    private readonly memberInvitationsService: MemberInvitationsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':farmId')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
    @Param('farmId') farmId: string,
  ) {
    return this.memberInvitationsService.findAll(farmId, pageOptionsDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(@Body() invitationDto: CreateUserInvitationDto) {
    return this.memberInvitationsService.inviteUsers(invitationDto);
  }

  @Post('validate-link')
  @HttpCode(HttpStatus.OK)
  async validateInvitationLink(@Body() invitationLink: InvitationLinkDto) {
    return this.memberInvitationsService.validateInvitationLink(
      invitationLink.hash,
    );
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_INVITE_A_NEW_FARM_USER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('invite-stallion')
  @HttpCode(HttpStatus.CREATED)
  async addMemberStallions(
    @Body() stallionInvitationDto: CreateUserInvitationStallionDto,
  ) {
    return this.memberInvitationsService.addMemberStallions(
      stallionInvitationDto,
    );
  }

  @ApiOperation({
    summary: 'Invite a member to Farm',
  })
  @ApiCreatedResponse({ description: 'Invited successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['FARM_ADMIN_INVITE_A_NEW_FARM_USER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('invite-farmuser')
  @HttpCode(HttpStatus.CREATED)
  async inviteUserToFarm(@Body() invitationDto: CreateFarmMemberInvitationDto) {
    return this.memberInvitationsService.inviteUserToFarm(invitationDto);
  }
}
