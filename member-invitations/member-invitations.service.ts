import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { MemberInvitation } from './entities/member-invitation.entity';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FarmsService } from 'src/farms/farms.service';
import { MembersService } from 'src/members/members.service';
import { MailService } from 'src/mail/mail.service';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { MemberFarmsService } from 'src/member-farms/member-farms.service';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { MemberInvitationStallionsService } from 'src/member-invitation-stallions/member-invitation-stallions.service';
import { StallionsService } from 'src/stallions/stallions.service';
import { CreateUserInvitationStallionDto } from './dto/create-member-stallion.dto';
import { CreateFarmMemberInvitationDto } from './dto/create-farmmember-invitation.dto';
import { AccessLevel } from 'src/farm-access-levels/access-levels.enum';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { PreferedNotificationService } from 'src/prefered-notification/prefered-notifications.service';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { notificationTemplates, notificationTypeList } from 'src/utils/constants/notifications';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable({ scope: Scope.REQUEST })
export class MemberInvitationsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberInvitation)
    private memberInvitationsRepository: Repository<MemberInvitation>,
    private mailService: MailService,
    private farmsService: FarmsService,
    private membersService: MembersService,
    private memberFarmsService: MemberFarmsService,
    private memberInvitationStallionsService: MemberInvitationStallionsService,
    private stallionsService: StallionsService,
    private readonly messageTemplatesService: MessageTemplatesService,
    private readonly preferedNotificationService: PreferedNotificationService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  //Get all records
  async findAll(farmId: string, searchOptionsDto: SearchOptionsDto) {
    let farmRecord = await this.farmsService.findOne(farmId);
    if (!farmRecord) {
      throw new NotFoundException('Farm not exist!');
    }
    let queryBuilder = this.memberInvitationsRepository
      .createQueryBuilder('memberinvitation')
      .select(
        'memberinvitation.id as invitationId, memberinvitation.fullName as fullName, memberinvitation.email as email, memberinvitation.farmId as farmId, memberinvitation.accessLevelId as accessLevelId, memberinvitation.isAccepted as isAccepted',
      )
      .andWhere('memberinvitation.farmId = :farmId', { farmId: farmRecord.id })
      .orderBy('memberinvitation.isAccepted', 'DESC')
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      if (sortBy.toLowerCase() === 'active') {
        queryBuilder.orderBy('memberinvitation.isAccepted', 'DESC');
      }

      if (sortBy.toLowerCase() === 'name') {
        queryBuilder.orderBy('memberinvitation.fullName', 'ASC');
      }

      if (sortBy.toLowerCase() === 'pending') {
        queryBuilder.orderBy('memberinvitation.isAccepted', 'ASC');
      }

      if (sortBy.toLowerCase() === 'access level') {
        queryBuilder.orderBy('memberinvitation.accessLevelId', 'ASC');
      }

      if (sortBy.toLowerCase() === 'email') {
        queryBuilder.orderBy('memberinvitation.email', 'ASC');
      }
    }

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  //Get a record
  findOne(fields) {
    return this.memberInvitationsRepository.findOne({
      where: fields,
    });
  }

  //Get a record by email
  async getRecordByEmail(email: string) {
    const user = await this.memberInvitationsRepository.findOne({
      email: email,
    });
    return user;
  }

  //Validate Invitation Link
  async validateInvitationLink(hash: string) {
    const record = await this.memberInvitationsRepository.findOne({
      hash,
      isAccepted: false,
    });
    if (!record) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `notFound`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else {
      if (record.expiredOn < new Date()) {
        throw new HttpException(
          {
            status: HttpStatus.GONE,
            errors: {
              hash: `link expired`,
            },
          },
          HttpStatus.GONE,
        );
      }
    }
    // Check Member Exist with this invitation Email
    const member = await this.membersService.findOne({
      email: record.email,
    });
    let isMember = false;
    if (member) {
      isMember = true;
      // Check Member Is Already Part of Invited Farm
      const memberFarmRecord = await this.memberFarmsService.findOne({
        memberId: member.id,
        farmId: record.farmId,
      });
      if (memberFarmRecord) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              hash: `Member is already part of the invited farm!`,
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
    return {
      fullName: record.fullName,
      email: record.email,
      isMember: isMember,
    };
  }

  //Add Stallions to a Member
  async addMemberStallions(invitationDto: CreateUserInvitationStallionDto) {
    const member = this.request.user;
    // Check FarmId Exist, if yes get the primaryKey using UUID
    let memberInvRecord = await this.memberInvitationsRepository.findOne(
      invitationDto.memberInvitationId,
    );
    if (!memberInvRecord) {
      throw new NotFoundException('Invited Member not exist!');
    }

    const totalResult = [];

    if (invitationDto.stallionIds.length > 0) {
      invitationDto.stallionIds.forEach(async (element) => {
        let stallion = await this.stallionsService.findOne(element);
        let invitationStallionData = {
          memberInvitationId: invitationDto.memberInvitationId,
          stallionId: stallion.id,
          isActive: true,
          createdBy: member['id'],
        };
        totalResult.push(invitationStallionData);
        const memberRecord = await this.memberInvitationStallionsService.create(
          invitationStallionData,
        );
      });
    }

    let invitationData = {
      accessLevelId: 3,
      modifiedBy: member['id'],
    };

    let invitation = await this.memberInvitationsRepository.update(
      { id: invitationDto.memberInvitationId },
      invitationData,
    );

    return invitation;
  }

  //Invite Users
  async inviteUsers(invitationDto: CreateUserInvitationDto) {
    const member = this.request.user;
    // Check email already exist before adding
    const record = await this.memberInvitationsRepository.findOne({
      email: invitationDto.email,
      fullName: invitationDto.fullName,
      isAccepted: true,
    });
    if (record) {
      throw new UnprocessableEntityException('Invitation already accepted!');
    }
    // Check email already exist in member table
    /* Can we Invite a Existing user to a Farm(using FarmAdmin Role)?
     *  If Yes what could be the flow?
     */
    // No need of checking is registered in this step
    const memberRecord = await this.membersService.findOne({
      email: invitationDto.email,
    });
    if (memberRecord) {
      throw new UnprocessableEntityException('Member is already invited !');
    }
    const hashString = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
    let invitationData = {
      ...invitationDto,
      hash: hashString,
      isAccepted: false,
      createdBy: member['id'],
    };
    let invitation = await this.memberInvitationsRepository.save(
      this.memberInvitationsRepository.create(invitationData),
    );
    this.mailService.inviteUsers({
      to: invitation.email,
      data: {
        hash: invitation.hash,
        fullName: invitation.fullName,
        //  farmName: farmRecord.farmName
      },
    });

    return invitation;
  }

  //Invite User To Farm
  async inviteUserToFarm(invitationDto: CreateFarmMemberInvitationDto) {
    const member = this.request.user;
    const { fullName } = invitationDto;
    // Check FarmId Exist, if yes get the primaryKey using UUID
    let farmRecord = await this.farmsService.getFarmByUuid(
      invitationDto.farmId,
    );
    const record = await this.memberInvitationsRepository.findOne({
      email: invitationDto.email,
      farmId: farmRecord.id,
      isAccepted: true,
    });
    if (record) {
      throw new UnprocessableEntityException('Invitation already accepted!');
    }
    //If The Assigned Access in ThirdParty, check stallionIds are valid
    if (invitationDto.accessLevelId == AccessLevel.thirdparty) {
      if (invitationDto.stallionIds.length > 0) {
        invitationDto.stallionIds.forEach(async (element) => {
          await this.stallionsService.getStallionByUuid(element.stallionId);
        });
      }
    }
    // Check email already exist in member table
    /* Can we Invite a Existing user to a Farm(using FarmAdmin Role)?
     *  If Yes what could be the flow?
     */
    // No need of checking is registered in this step
    const memberRecord = await this.membersService.findOne({
      email: invitationDto.email,
    });
    if (memberRecord) {
      invitationDto['fullName'] = memberRecord?.fullName;
      // Check Member Is Already Part of Invited Farm
      const memberFarmRecord = await this.memberFarmsService.findOne({
        memberId: memberRecord.id,
        farmId: farmRecord.id,
      });
      if (memberFarmRecord) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              hash: `Member is already part of the invited farm!`,
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
    const hashString = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
    let invitationData = {
      ...invitationDto,
      hash: hashString,
      farmId: farmRecord.id,
      isAccepted: false,
      createdBy: member['id'],
    };
    if(memberRecord){
      invitationData['memberId'] = memberRecord?.id;
      // invitationData['fullName'] = memberRecord?.fullName;
    }
    let invitation = await this.memberInvitationsRepository.save(
      this.memberInvitationsRepository.create(invitationData),
    );
    const messageTemplate =
    await this.messageTemplatesService.getMessageTemplateByUuid(
      notificationTemplates.notifyOthersForFarmInvite,
    );
      const messageText = messageTemplate.messageText.replace(
        '{userName}',
        await this.commonUtilsService.toTitleCase(invitationDto?.fullName),
      )
      .replace(
        '{farmName}',
        await this.commonUtilsService.toTitleCase(farmRecord.farmName) 
      )
      const messageTitle = messageTemplate.messageTitle;
      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationTypeList.SYSTEM_NOTIFICATIONS,
        );
      const sendNotification = await this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: member['id'],
        messageTitle,
        messageText,
        notificationType: preferedNotification?.notificationTypeId,
        isRead: false,
        farmid: farmRecord.id
      });
    if (invitation && invitationDto.accessLevelId == AccessLevel.thirdparty) {
      if (invitationDto.stallionIds.length > 0) {
        invitationDto.stallionIds.forEach(async (element) => {
          let stallion = await this.stallionsService.getStallionByUuid(
            element.stallionId,
          );
          let invitationStallionData = {
            memberInvitationId: invitation.id,
            stallionId: stallion.id,
            isActive: true,
            createdBy: member['id'],
          };
          const memberRecord =
            await this.memberInvitationStallionsService.create(
              invitationStallionData,
            );
        });
      }
    }

    if (invitation.memberId) {
      let accessLevel = 'Full Access';
     
      if (invitationDto.accessLevelId == AccessLevel.thirdparty) {
        accessLevel = 'Third Party Access';
      }
      if (invitationDto.accessLevelId == AccessLevel.viewonly) {
        accessLevel = 'View Only Access';
      }
      const inviteOtherMembersMessageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.inviteOtherMembersToAFarmUuid,
      );
      const messageText = inviteOtherMembersMessageTemplate?.messageText
        .replace('{FarmAdminUser}', await this.commonUtilsService.toTitleCase(memberRecord?.fullName))
        .replace('{FarmName}', await this.commonUtilsService.toTitleCase(farmRecord?.farmName))
        .replace('{accessLevel}', accessLevel);
      const messageTitle = inviteOtherMembersMessageTemplate.messageTitle.replace(
        '{farmName}',
        farmRecord?.farmName,
      );
      this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: inviteOtherMembersMessageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: invitation.memberId,
        messageTitle,
        messageText,
        actionUrl: hashString, // Setting hash only for the invitation that will be used for accept invitaions.
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
      });
    }

    this.mailService.inviteFarmUser({
      to: invitation.email,
      data: {
        hash: invitation.hash,
        fullName: invitation.fullName,
        farmName: farmRecord.farmName,
      },
    });
    return invitation;
  }
}
