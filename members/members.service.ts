import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { differenceInDays } from 'date-fns';
import { Request } from 'express';
import { AuthChangePasswordDto } from 'src/auth/dto/auth-change-password.dto';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ExcelService } from 'src/excel/excel.service';
import { Farm } from 'src/farms/entities/farm.entity';
import { FavouriteBroodmareSireService } from 'src/favourite-broodmare-sires/favourite-broodmare-sires.service';
import { FavouriteFarmsService } from 'src/favourite-farms/favourite-farms.service';
import { FavouriteStallionsService } from 'src/favourite-stallions/favourite-stallions.service';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { ForgotService } from 'src/forgot/forgot.service';
import { GoogleAnalyticsService } from 'src/google-analytics/google-analytics.service';
import { MailService } from 'src/mail/mail.service';
import { MediaService } from 'src/media/media.service';
import { CreateMemberAddressDto } from 'src/member-address/dto/create-member-address.dto';
import { UpdateMemberAddressDto } from 'src/member-address/dto/update-member-address.dto';
import { MemberAddressService } from 'src/member-address/member-address.service';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { MemberFarmsService } from 'src/member-farms/member-farms.service';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';
import { MemberMaresService } from 'src/member-mares/member-mares.service';
import { MemberProfileImage } from 'src/member-profile-image/entities/member-profile-image.entity';
import { MemberProfileImageService } from 'src/member-profile-image/member-profile-image.service';
import { RoleEnum } from 'src/member-roles/roles.enum';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { OrderStatusService } from 'src/order-status/order-status.service';
import { Order } from 'src/orders/entities/order.entity';
import { PreferedNotification } from 'src/prefered-notification/entities/prefered-notification.entity';
import { PreferedNotificationService } from 'src/prefered-notification/prefered-notifications.service';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { MEMBERDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import {
  notificationTemplates,
  notificationTypeList,
} from 'src/utils/constants/notifications';
import { ordersStatusList } from 'src/utils/constants/orders-status';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Brackets, Repository, getRepository } from 'typeorm';
import { AdminUpdateDto } from './dto/admin-update.dto';
import { UpdateMemberProfileImageDto } from './dto/create-member-profile-image.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { MemberDashboardDto } from './dto/member-dashboard.dto';
import { SearchEmailDto } from './dto/search-email.dto';
import { SearchNameDto } from './dto/search-name.dto';
import { SearchOptionsDownloadDto } from './dto/search-options-download.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Member } from './entities/member.entity';
import { PRODUCT } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class MembersService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
    @InjectRepository(MemberInvitation)
    private memberInvitationsRepository: Repository<MemberInvitation>,
    private memberAddressService: MemberAddressService,
    private mailService: MailService,
    private readonly favouriteStallionService: FavouriteStallionsService,
    private readonly favouriteBroodMareSireService: FavouriteBroodmareSireService,
    private readonly favouriteFarmsService: FavouriteFarmsService,
    private readonly memberFarmsService: MemberFarmsService,
    private readonly mediaService: MediaService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly fileUploadsService: FileUploadsService,
    private readonly configService: ConfigService,
    private readonly memberProfileImageService: MemberProfileImageService,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    private preferedNotificationsService: PreferedNotificationService,
    private forgotService: ForgotService,
    private eventEmitter: EventEmitter2,
    private excelService: ExcelService,
    private gaService: GoogleAnalyticsService,
    private orderStatusService: OrderStatusService,
    private readonly memberMaresService: MemberMaresService,
  ) {}

  //Create a record
  async create(createProfileDto: CreateMemberDto) {
    const user = this.request.user;
    createProfileDto.createdBy = user['id'];
    let member = await this.membersRepository.save(
      this.membersRepository.create(createProfileDto),
    );

    let addressData = new CreateMemberAddressDto();
    addressData.createdBy = user['id'];
    addressData.countryId = createProfileDto.countryId;
    addressData.address = createProfileDto.address
      ? createProfileDto.address
      : null;
    await this.memberAddressService.create(member, addressData);

    return member;
  }

  //Get all with paging
  findManyWithPagination(paginationOptions: IPaginationOptions) {
    return this.membersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  //Get a record
  async findOne(fields) {
    let result = await this.membersRepository.findOne({
      where: fields,
    });
    if (result) {
      const profilePicData = await this.getMemberProfileImage(result);
      result.memberprofileimages = profilePicData?.profilePic
        ? profilePicData?.profilePic
        : '';
      const memberAddress = await this.memberAddressService.findOne(result);
      result['addresses'] = '';
      result['stateId'] = '';
      result['countryId'] = '';
      if (memberAddress) {
        result['addresses'] = memberAddress.address;
        result['stateId'] = memberAddress.stateId;
        result['countryId'] = memberAddress.countryId;
      }
    }
    return result;
  }

  //Get a Member ProfileImage
  async getMemberProfileImage(member) {
    let queryBuilder = getRepository(MemberProfileImage)
      .createQueryBuilder('mpi')
      .select('media.mediaUrl as profilePic')
      .innerJoin(
        'mpi.media',
        'media',
        'media.id=mpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .andWhere('mpi.memberId = :memberId', { memberId: member['id'] });
    return await queryBuilder.getRawOne();
  }

  //Get a Member
  async findMember(uuid: string) {
    const member = await this.membersRepository.findOne({ memberuuid: uuid });
    const preferedCenterBuilder = await getRepository(PreferedNotification)
      .createQueryBuilder('center')
      .select(' DISTINCT center.notificationTypeId as notificationTypeId')
      .andWhere('center.memberId = :memberId', { memberId: member.id });
    const centers = await preferedCenterBuilder.getRawMany();

    const accessLeveleBuilder = getRepository(MemberFarm)
      .createQueryBuilder('memberfarms')
      .select(
        'MAX(memberfarms.accessLevelId) as accessLevel,memberfarms.memberId',
      )
      .groupBy('memberfarms.memberId');

    const queryBuilder = this.membersRepository
      .createQueryBuilder('member')
      .select(
        'member.id as id,member.memberuuid as memberUuid , member.fullName , member.email as email,member.isActive as isActive,member.paymentMethodId as paymentMethodId, CASE WHEN member.statusId = 3 THEN 1 ELSE member.statusId END AS statusId,member.roleId as roleId,member.sso as sso,member.provider as provider,member.socialId as socialId,member.socialLinkId as socialLinkId,member.hashedRefreshToken as hashedRefreshToken, member.createdOn as createdOn, member.modifiedOn as modifiedOn, member.isVerified as isVerified ,member.deletedOn as deletedOn,member.lastActive as lastActive',
      )
      .addSelect('media.mediaUrl as profilePic')
      .addSelect('country.countryCode as countryCode')
      .addSelect(
        'memberaddress.countryId as countryId,memberaddress.address as address',
      )
      .addSelect('memberrole.roleName as roleName')
      .addSelect('memberStatus.statusName as status')
      .addSelect('access.accessLevel as accessLevel')
      .leftJoin('member.memberStatus', 'memberStatus')
      .leftJoin('member.memberaddresses', 'memberaddress')
      .leftJoin('memberaddress.country', 'country')
      .leftJoin('member.roles', 'memberrole')
      .leftJoin('member.memberprofileimages', 'memberprofileimages')
      .leftJoin(
        'memberprofileimages.media',
        'media',
        'media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .leftJoin(
        '(' + accessLeveleBuilder.getQuery() + ')',
        'access',
        'access.memberId=member.id',
      )
      .andWhere('member.memberuuid = :memberuuid', { memberuuid: uuid });
    const entities = await queryBuilder.getRawOne();
    const finalEntities = {
      ...entities,
      preferedCenter: centers,
    };

    return finalEntities;
  }

  //Update a member
  async update(member: Member, updateProfileDto: UpdateMemberDto) {
    const user = this.request.user;
    updateProfileDto.modifiedBy = user['id'];
    let addressData;
    let address = await this.memberAddressService.findOne(member);
    if (address) {
      addressData = new UpdateMemberAddressDto();
    } else {
      addressData = new CreateMemberAddressDto();
    }
    addressData.countryId = updateProfileDto.countryId;
    if (updateProfileDto.stateId) {
      addressData.stateId = updateProfileDto.stateId;
    }
    if (updateProfileDto.address) {
      addressData.address = updateProfileDto.address;
    }
    addressData.modifiedBy = user['id'];

    if (address) {
      await this.memberAddressService.update(member, addressData);
    } else {
      await this.memberAddressService.create(member, addressData);
    }

    return this.membersRepository.save(
      this.membersRepository.create({
        id: member.id,
        ...updateProfileDto,
      }),
    );
  }

  //Update Members from Admin
  async adminUpdate(member: Member, adminUpdateDto: AdminUpdateDto) {
    const user = this.request.user;
    adminUpdateDto.modifiedBy = user['id'];
    let addressData = new UpdateMemberAddressDto();
    addressData.address = adminUpdateDto.address;
    addressData.countryId = adminUpdateDto.countryId;
    addressData.modifiedBy = user['id'];
    await this.memberAddressService.update(member, addressData);

    let menber = this.membersRepository.save(
      this.membersRepository.create({
        id: member.id,
        ...adminUpdateDto, // Spread the properties from adminUpdateDto into the new member object
        // If the current status is not suspended, and the admin wants to suspend the member OR
        // If the current status is suspended, and the admin wants to not suspend the member,
        // set the 'suspendedOn' property to null and 'failedLoginAttempts' to 0
        ...((member.statusId !== StatusEnum.suspended &&
          adminUpdateDto.statusId === StatusEnum.suspended) ||
        (member.statusId === StatusEnum.suspended &&
          adminUpdateDto.statusId !== StatusEnum.suspended)
          ? { suspendedOn: null, failedLoginAttempts: 0 }
          : {}),
      }),
    );

    this.eventEmitter.emit('updateMembers', menber);

    if (adminUpdateDto.preferenceCenter) {
      this.setPrefereceCenter(member, adminUpdateDto.preferenceCenter);
    }

    if (adminUpdateDto.stallions) {
      await this.favouriteStallionService.deleteMany(
        member,
        adminUpdateDto.stallions,
      );
    }

    if (adminUpdateDto.myMares) {
      await this.memberMaresService.deleteMany(member, adminUpdateDto.myMares);
    }

    if (adminUpdateDto.broodmareSires) {
      await this.favouriteBroodMareSireService.deleteMany(
        member,
        adminUpdateDto.broodmareSires,
      );
    }

    if (adminUpdateDto.myfarms) {
      await this.favouriteFarmsService.deleteMany(
        member,
        adminUpdateDto.myfarms,
      );
    }

    if (adminUpdateDto.linkedFarms != null) {
      await this.memberFarmsService.deleteMany(member, adminUpdateDto.linkedFarms);
    }

    return menber;
  }

  //Delete a record
  async softDelete(id: number): Promise<void> {
    await this.membersRepository.softDelete(id);
  }

  //Get all records
  async findAll(searchOptions: SearchOptionsDto): Promise<PageDto<Member>> {
    if (searchOptions.activity === 'No') {
      let results = await this.membersRepository
        .createQueryBuilder('member')
        .select('DISTINCT member.id as memberId')
        .leftJoin('member.activity', 'activity')
        .andWhere('activity.activityTypeId = :activityTypeId', {
          activityTypeId: 1,
        })
        .getRawMany();
      var memberIds = [];
      results.forEach((item) => {
        memberIds.push(item.memberId);
      });
    }
    let searchFarmRecord
    if (searchOptions.farmId) {
      searchFarmRecord = await getRepository(Farm).findOne({
        farmUuid: searchOptions.farmId,
      });
    }

    const accessLeveleBuilder = getRepository(MemberFarm)
      .createQueryBuilder('memberfarms')
      .select(
        'MIN(memberfarms.accessLevelId) as accessLevel,memberfarms.memberId',
      );
      if (searchOptions.farmId) {
        accessLeveleBuilder.andWhere('memberfarms.farmId = :farmId', {
          farmId: searchFarmRecord.id,
        });
      }
      accessLeveleBuilder.groupBy('memberfarms.memberId');

    const queryBuilder = this.membersRepository
      .createQueryBuilder('member')
      .select(
        'DISTINCT member.id as memberId,member.memberuuid as memberUuid , member.fullName , member.email as emailAddress,member.statusId as statusId, member.sso as sso, member.createdOn as memberSince, member.lastActive as lastActive, member.isVerified as isVerified,member.roleId',
      )
      .addSelect('country.countryCode as countryCode')
      .addSelect('memberaddress.countryId as countryId')
      .addSelect('access.accessLevel as accessLevel')
      .addSelect('memberrole.roleName as roleName')
      .addSelect('searchShare.socialShareTypeId as socialShareTypeId')
      .leftJoin('member.memberaddresses', 'memberaddress')
      .leftJoin('memberaddress.country', 'country')
      .leftJoin('member.roles', 'memberrole')
      .leftJoin('member.favouritefarms', 'favfarm')
      .leftJoin('member.favouritestallions', 'favStallion')
      .leftJoin('member.favouritemares', 'favMare')
      .leftJoin('member.favouritebroodmareSire', 'favBrood')
      .leftJoin(
        '(' + accessLeveleBuilder.getQuery() + ')',
        'access',
        'access.memberId=member.id',
      )

      .leftJoin('member.preferedNotification', 'pcenter')
      .leftJoin('member.orderProduct', 'product')
      .leftJoin('member.memberfarms', 'memberfarms')
      .leftJoin('member.activity', 'activity')
      .leftJoin('member.searchShare', 'searchShare')
      .andWhere('member.roleId = :roleId', { roleId: RoleEnum.Breeder });
    if (searchOptions.emailAddress) {
      if (searchOptions.isEmailAddressExactSearch) {
        queryBuilder.andWhere('member.email = :email', {
          email: searchOptions.emailAddress,
        });
      } else {
        queryBuilder.andWhere('member.email like :email', {
          email: '%' + searchOptions.emailAddress + '%',
        });
      }
    }
    if (searchOptions.name) {
      if (searchOptions.isNameExactSearch) {
        queryBuilder.andWhere('member.fullName =:fullName', {
          fullName: searchOptions.name,
        });
      } else {
        queryBuilder.andWhere('member.fullName like :fullName', {
          fullName: '%' + searchOptions.name + '%',
        });
      }
    }
    if (searchOptions.country) {
      queryBuilder.andWhere('memberaddress.countryId = :countryId', {
        countryId: searchOptions.country,
      });
    }
    if (searchOptions.verified == true) {
      queryBuilder
        .andWhere('member.isVerified = :isVerified', { isVerified: 1 })
        .andWhere('member.isVerified IS NOT NULL');
    }
    if (searchOptions.verified == false) {
      queryBuilder.andWhere(
        new Brackets((subQ) => {
          subQ
            .where('member.isVerified = :isVerified', { isVerified: 0 })
            .orWhere('member.isVerified IS NULL');
        }),
      );
    }
    if (searchOptions.paymentmethodId) {
      queryBuilder.andWhere('member.paymentMethodId = :paymentMethodId', {
        paymentMethodId: searchOptions.paymentmethodId,
      });
    }
    if (searchOptions.statusId) {
      if (searchOptions.statusId === StatusEnum.active) {
        queryBuilder.andWhere('member.statusId IN(:...statusIds)', {
          statusIds: [StatusEnum.active, StatusEnum.registered],
        });
      } else {
        queryBuilder.andWhere('member.statusId = :statusId', {
          statusId: searchOptions.statusId,
        });
      }
    }
    if (searchOptions.socialLinkId) {
      queryBuilder.andWhere('member.socialLinkId = :socialLinkId', {
        socialLinkId: searchOptions.socialLinkId,
      });
    }
    if (searchOptions.farmUser === 'Yes') {
      if (searchOptions.accessLevel) {
        queryBuilder.andWhere('access.accessLevel = :accessLevelId', {
          accessLevelId: searchOptions.accessLevel,
        });
      } else {
        queryBuilder.andWhere('access.accessLevel IS NOT NULL');
      }
    }
    if (searchOptions.farmUser === 'No') {
      queryBuilder.andWhere('access.accessLevel IS NULL');
    }
    if (searchOptions.PreferedNotifications) {
      if (searchOptions.PreferedNotifications === 'Messaging') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 1 },
        );
      } else if (
        searchOptions.PreferedNotifications === 'Stallion Nominations'
      ) {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 2 },
        );
      } else if (searchOptions.PreferedNotifications === 'Promotional') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 3 },
        );
      } else if (searchOptions.PreferedNotifications === 'Membership Updates') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 4 },
        );
      } else if (searchOptions.PreferedNotifications === 'Technical Updates') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 5 },
        );
      } else if (searchOptions.PreferedNotifications === 'SM Announcements') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 6 },
        );
      } else if (
        searchOptions.PreferedNotifications === 'System Notifications'
      ) {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 7 },
        );
      }
    }
    if (searchOptions.horseTracking) {
      if (searchOptions.horseTracking === 'Stallions') {
        queryBuilder.andWhere('favStallion.memberId Is NOT NULL');
      } else if (searchOptions.horseTracking === 'Broodmare') {
        queryBuilder.andWhere('favMare.memberId Is NOT NULL');
      } else if (searchOptions.horseTracking === 'Broodmare Sires') {
        queryBuilder.andWhere('favBrood.memberId Is NOT NULL');
      } else if (searchOptions.horseTracking === 'Farms') {
        queryBuilder.andWhere('favfarm.memberId Is NOT NULL');
      }
    }
    if (searchOptions.PrevOrders) {
      if (searchOptions.PrevOrders === 'My Shortlist Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.SHORTLIST_STALLION_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Stallion Match PRO Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.STALLION_MATCH_PRO_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Broodmare Affinity Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.BROODMARE_AFFINITY_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Stallion Match Sales Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.STALLION_MATCH_SALES_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Stallion Affinity Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.STALLION_AFFINITY_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Broodmare Sire Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.BROODMARE_SIRE_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Local Boost') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.LOCAL_BOOST,
        });
      } else if (searchOptions.PrevOrders === 'Extended Boost') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.EXTENDED_BOOST,
        });
      } else if (searchOptions.PrevOrders === 'Promoted Stallion') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.PROMOTED_STALLION,
        });
      } else if (searchOptions.PrevOrders === 'Nomination Acceptance') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.NOMINATION_ACCEPTANCE,
        });
      }
    }
    if (searchOptions.activePeriod) {
      const activePeriod = searchOptions.activePeriod;
      let dateList = activePeriod.split('/');
      if (dateList.length === 2) {
        var minDate = await this.commonUtilsService.setHoursZero(dateList[0]);
        var maxDate = await this.commonUtilsService.setToMidNight(dateList[1]);
      }
      // queryBuilder.andWhere(
      //   'member.lastActive >= CONVERT(date, :minDate) AND member.lastActive <= CONVERT(date, :maxDate)',
      //   {
      //     minDate,
      //     maxDate,
      //   },
      // )
      queryBuilder.andWhere('member.lastActive BETWEEN :minDate AND :maxDate', {
        minDate,
        maxDate,
      });
    }
    if (searchOptions.farmId) {
      queryBuilder.andWhere('memberfarms.farmId = :farmId', {
        farmId: searchFarmRecord.id,
      });
    }
    if (searchOptions.horseId) {
      if (searchOptions.favourite == 'favStallions') {
        queryBuilder
          .innerJoin('favStallion.stallion', 'stallion')
          .innerJoin('stallion.horse', 'horse')
          .andWhere('horse.horseUuid =:horseUuid', {
            horseUuid: searchOptions.horseId,
          });
      }
      if (searchOptions.favourite == 'favMare') {
        queryBuilder
          .innerJoin(
            'favMare.horse',
            'horse',
            'horse.isVerified=1 AND horse.isActive=1',
          )
          .andWhere('horse.horseUuid =:horseUuid', {
            horseUuid: searchOptions.horseId,
          });
      }
      if (searchOptions.favourite == 'favBroodMare') {
        queryBuilder
          .innerJoin(
            'favBrood.horse',
            'horse',
            'horse.isVerified=1 AND horse.isActive=1',
          )
          .andWhere('horse.horseUuid =:horseUuid', {
            horseUuid: searchOptions.horseId,
          });
      }
    }
    if (searchOptions.activity === 'Yes') {
      queryBuilder.andWhere('activity.activityTypeId = :activityTypeId', {
        activityTypeId: 1,
      });
    }
    if (searchOptions.activity === 'No') {
      if (memberIds.length > 0)
        queryBuilder.andWhere('member.id NOT IN(:...memberIds)', {
          memberIds: memberIds,
        });
    }
    if (searchOptions.socialShare) {
      queryBuilder.andWhere(
        'searchShare.socialShareTypeId = :socialShareTypeId',
        { socialShareTypeId: searchOptions.socialShare },
      );
    }
    queryBuilder;
    if (searchOptions.sortBy) {
      const sortBy = searchOptions.sortBy;
      const byOrder = searchOptions.order;
      if (sortBy.toLowerCase() === 'emailaddress') {
        queryBuilder.orderBy('member.email', byOrder);
      }
      if (sortBy.toLowerCase() === 'fullname') {
        queryBuilder.orderBy('member.fullName', byOrder);
      }
      if (sortBy.toLowerCase() === 'countryid') {
        queryBuilder.orderBy('memberaddress.countryId', byOrder);
      }
      if (sortBy.toLowerCase() === 'isverified') {
        queryBuilder.orderBy('member.isVerified', byOrder);
      }
      if (sortBy.toLowerCase() === 'memberid') {
        queryBuilder.orderBy('member.id', byOrder);
      }
      if (sortBy.toLowerCase() === 'membersince') {
        queryBuilder.orderBy('member.createdOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'lastactive') {
        queryBuilder.orderBy('member.lastActive', byOrder);
      }
      if (sortBy.toLowerCase() === 'countrycode') {
        queryBuilder.orderBy('country.countryCode', byOrder);
      }
      if (sortBy.toLowerCase() === 'rolename') {
        queryBuilder.orderBy('access.accessLevel', byOrder);
      }
    }

    const entities = await queryBuilder.getRawMany();
    const keys = ['memberId'];
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    const itemCount = filtered.length;

    let result = filtered.slice(
      searchOptions.skip,
      searchOptions.skip + searchOptions.limit,
    );

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptions,
    });
    return new PageDto(result, pageMetaDto);
  }

  //Set Current RefreshToken
  async setCurrentRefreshToken(userId: number, refreshToken: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    return await this.membersRepository.update(
      { id: userId },
      {
        hashedRefreshToken: currentHashedRefreshToken,
      },
    );
  }

  //Remove RefreshToken
  async removeRefreshToken(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.membersRepository.update(
      { email },
      {
        hashedRefreshToken: null,
      },
    );
  }

  //Get User By Email
  async getUserByEmail(email: string) {
    const user = await this.membersRepository.findOne({ email: email });
    return user;
  }

  //Get all member emails
  async findEmails(): Promise<PageDto<Member>> {
    const queryBuilder = this.membersRepository
      .createQueryBuilder('member')
      .select('member.email, member.fullName');

    queryBuilder.orderBy('member.fullName', 'ASC');

    const entities = await queryBuilder.getRawMany();
    let emailArr = [];
    let fullnameArr = [];
    entities.forEach((element) => {
      emailArr.push(element.email);
      fullnameArr.push(element.fullName);
    });
    return new PageDto(
      Object({ emailsArray: emailArr, fullNameArray: fullnameArr }),
      null,
    );
  }

  //Get Member By Name
  async findByName(fullName: string, searchNameDto: SearchNameDto) {
    const queryBuilder = await this.membersRepository
      .createQueryBuilder('member')
      .select('member.memberuuid as id ,member.email, member.fullName');
    if (searchNameDto?.isNameExactSearch) {
      queryBuilder.andWhere('member.fullName =:fullName', {
        fullName: fullName,
      });
    } else {
      queryBuilder.andWhere('member.fullName like :fullName', {
        fullName: '%' + fullName + '%',
      });
    }
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Get member By Email
  async findByEmail(email: string, searchNameDto: SearchEmailDto) {
    const queryBuilder = await this.membersRepository
      .createQueryBuilder('member')
      .select('member.id ,member.email, member.fullName');

    if (searchNameDto?.isEmailAddressExactSearch) {
      queryBuilder.andWhere('member.email =:email', { email: email });
    } else {
      queryBuilder.andWhere('member.email like :email', {
        email: '%' + email + '%',
      });
    }
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Update Member Profile
  async updateProfile(member: Member, updateProfileDto: UpdateProfileDto) {
    if (updateProfileDto?.password && member?.roleId == RoleEnum.superadmin) {
      throw new HttpException(
        'Super Admin not allow to change his/her password',
        HttpStatus.NOT_FOUND,
      );
    }
    const user = this.request.user;
    updateProfileDto.modifiedBy = user['id'];

    let addressData = new UpdateMemberAddressDto();
    addressData.countryId = updateProfileDto.countryId;
    addressData.stateId = updateProfileDto.stateId;
    addressData.address = updateProfileDto.address;
    addressData.modifiedBy = user['id'];
    await this.memberAddressService.update(member, addressData);
    if (updateProfileDto?.profileImageuuid) {
      this.setProfileImages(member, updateProfileDto.profileImageuuid);
    }

    if (updateProfileDto?.password) {
      this.addNotification(member);
    }

    return this.membersRepository.save(
      this.membersRepository.create({
        id: member.id,
        ...updateProfileDto,
      }),
    );
  }

  //Add a Notification
  async addNotification(member: Member) {
    const user = this.request.user;
    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.passwordChangedConfirmation,
      );
    const messageText = messageTemplate.messageText;
    const messageTitle = messageTemplate.messageTitle;
    this.notificationsService.create({
      createdBy: user['id'],
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: member['id'],
      messageTitle,
      messageText,
      isRead: false,
    });
  }

  //Get Linked farms by Id
  async getLinkedFarms(id: string) {
    return this.memberFarmsService.getMemberFarmsByMemberId(id);
  }

  //Get a Presigned Url for a ProfileImage
  async profileImageUpload(fileInfo: FileUploadUrlDto) {
    const member = this.request.user;
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirMemberProfileImage',
    )}/${member['id']}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Profile Image Update
  async profileImageUpdate(data: UpdateMemberProfileImageDto) {
    const member = this.request.user;
    const memberInfo = await this.findOne({
      id: member['id'],
      roleId: RoleEnum.superadmin,
    });

    //Validate and Set profileImage
    if (data?.profileImageuuid) {
      await this.setProfileImages(memberInfo, data.profileImageuuid);
    }
    return;
  }

  //Set Profile Image
  async setProfileImages(member: Member, fileUuid: string) {
    // Check Profile pic already exist, if yes delete it from S3

    let profileImageData = await this.memberProfileImageService.findByMemberId(
      member['id'],
    );
    if (profileImageData) {
      //Mark for Deletion - previous profile image
      await this.mediaService.markForDeletion(profileImageData.mediaId);
    }
    // Set Stallion Profile Image
    let mediaRecord = await this.mediaService.create(fileUuid);
    await this.memberProfileImageService.create(member, mediaRecord.id);
  }

  //Set Preferece Center
  async setPrefereceCenter(member: Member, preferenceCenter) {
    const preferedNotification =
      await this.preferedNotificationsService.getPreferedNotificationByMemberId(
        member.id,
      );

    let preferenceCenterArr = JSON.parse(JSON.stringify(preferenceCenter));
    if (preferedNotification && preferedNotification.length) {
      preferedNotification.forEach((notification) => {
        if (preferenceCenter.includes(notification.notificationTypeId)) {
          const index = preferenceCenterArr.indexOf(
            notification.notificationTypeId,
          );
          if (index > -1) {
            preferenceCenterArr.splice(index, 1);
          }
          this.preferedNotificationsService.update(notification.id, {
            isActive: true,
          });
        } else {
          this.preferedNotificationsService.update(notification.id, {
            isActive: false,
          });
        }
      });
    }
    preferenceCenterArr.forEach((notificationTypeId: number) => {
      this.preferedNotificationsService.create({
        notificationTypeId: notificationTypeId,
        memberId: member.id,
        isActive: true,
      });
    });
  }

  //Get Member List
  async memeberList(pageOptionsDto: PageOptionsDto): Promise<PageDto<Member>> {
    const user = this.request.user;

    const queryBuilder = this.membersRepository
      .createQueryBuilder('member')
      .select(
        'DISTINCT member.id as memberId,member.memberuuid as memberUuid , member.fullName , member.email as emailAddress, member.createdOn as memberSince, member.modifiedOn as lastActive, member.isActive',
      )
      .addSelect('memberrole.roleName as roleName')
      .addSelect('country.countryCode as locations')
      .leftJoin('member.roles', 'memberrole')
      .leftJoin('member.memberaddresses', 'memberaddress')
      .leftJoin('memberaddress.country', 'country')
      .andWhere('member.roleId >= :roleId', { roleId: RoleEnum.admin });

    const entities = await queryBuilder.getRawMany();
    const keys = ['memberId'];
    let filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    const itemCount = filtered.length;

    let result = filtered.slice(
      pageOptionsDto.skip,
      pageOptionsDto.skip + pageOptionsDto.limit,
    );

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOptionsDto,
    });
    return new PageDto(result, pageMetaDto);
  }

  //Remove a memeber
  async memeberRemove(memberId) {
    try {
      const record = await this.membersRepository.findOne({
        memberuuid: memberId,
      });
      if (!record) {
        throw new UnprocessableEntityException('Member not exist!');
      }
      record.isActive = false;
      record.isArchived = true;
      await record.save();
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Member deleted successfully',
      };
    } catch {
      return `No data deleted for Member #${memberId}.`;
    }
  }

  //Reset Password
  async resetPassword(hash: string, password: string): Promise<void> {
    const forgot = await this.forgotService.findOne({
      where: {
        hash,
      },
    });

    if (!forgot) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `notFound`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const member = forgot.member;
    member.password = password;
    await member.save();
    await this.forgotService.softDelete(forgot.id);
  }

  //Get Member Dashboard Data
  async getMemberDashboardData(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetMemberDashboard_new @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let respone = [];
    await result.map(async (record: any) => {
      let diffPercent = 0;
      if (record.kpiBlock === 'Average Visitior Growth' || record.kpiBlock === 'Average Registrations growth') {
        record.Diff = Math.abs(record.CurrentValue - record.PrevValue)
        diffPercent = record.Diff
      } else {
        if (record.PrevValue) {
          diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
        } else {
          diffPercent = Math.round(record.Diff / 0.01);
        }
      }
      respone.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return respone;
  }

  //Get Dashborad Sessions Data
  async getDashboradSessionsData(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetCurrentAndPrevDates @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = {
      CurrentValue: 0,
      PrevValue: 0,
      Diff: 0,
      diffPercent: 0,
    };
    response.CurrentValue = await this.gaService.getSessionsData(
      result[0].currFromDate,
      result[0].currToDate,
    );
    response.PrevValue = await this.gaService.getSessionsData(
      result[0].prevFromDate,
      result[0].prevToDate,
    );
    response.Diff = response.CurrentValue - response.PrevValue;
    if (response.PrevValue) {
      response.diffPercent = Math.round(
        (response.Diff / response.PrevValue) * 100,
      );
    } else {
      response.diffPercent = Math.round((response.Diff / 1) * 100);
    }
    return response;
  }

  //Get Dashborad Sessions Report
  async getDashboradSessionsReport(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetCurrentAndPrevDates @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = {
      CurrentValue: 0,
      PrevValue: 0,
      Diff: 0,
      diffPercent: 0,
    };
    response.CurrentValue = await this.gaService.getSessionsData(
      result[0].currFromDate,
      result[0].currToDate,
    );
    response.PrevValue = await this.gaService.getSessionsData(
      result[0].prevFromDate,
      result[0].prevToDate,
    );
    response.Diff = response.CurrentValue - response.PrevValue;
    let newResult = [];
    newResult.push({
      SNo: 1,
      CurrentSessionValue: response.CurrentValue,
      PreviousSessionValue: response.PrevValue,
      Difference: response.Diff,
    });
    let headerList = [];
    let headersData = Object.keys(newResult[0]);
    await headersData.reduce(async (promise, item) => {
      await promise;
      item;
      let itemObj = {
        header: item,
        key: item,
        width: 30,
      };
      headerList.push(itemObj);
    }, Promise.resolve());
    let file = await this.excelService.generateReport(
      `Report`,
      headerList,
      newResult,
    );
    return file;
  }

  //Get MainDashborad Data
  async getMainDashboradData(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetMainLandingDashboard @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let respone = [];
    await result.map(async (record: any) => {
      let diffPercent = 0;
      if (record.PrevValue) {
        diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
      } else {
        diffPercent = Math.round(record.Diff / 0.01);
      }
      respone.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return respone;
  }

  //Get Admin User Other than superAdmin
  async members() {
    const queryBuilder = await this.membersRepository
      .createQueryBuilder('member')
      .select('member.id, member.fullName, member.email')
      .andWhere('member.roleId >= :roleId', { roleId: RoleEnum.superadmin })
      .getRawMany();

    return queryBuilder;
  }

  //Get Admin Users Other than superAdmin.Admin
  async membersWithOutAdmins() {
    const queryBuilder = await this.membersRepository
      .createQueryBuilder('member')
      .select('member.id ,member.fullName')
      .andWhere(
        'member.roleId NOT IN(' + [RoleEnum.superadmin, RoleEnum.admin] + ')',
      )
      .getRawMany();

    return queryBuilder;
  }

  //Invite a user
  async inviteUser(invitationDto: CreateUserInvitationDto) {
    const member = this.request.user;
    const record = await this.memberInvitationsRepository.findOne({
      where: {
        email: invitationDto.email,
        isAccepted: true,
      },
    });
    if (record) {
      throw new UnprocessableEntityException('Invitation already accepted!');
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

    this.mailService.inviteUser({
      to: invitation.email,
      data: {
        hash: invitation.hash,
        fullName: invitation.fullName,
      },
    });

    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.inviteOtherMembersToAFarmUuid,
      );
    const messageText = messageTemplate.messageText.replace(
      '{FarmAdminUser}',
      invitation.fullName,
    );
    const messageTitle = messageTemplate.messageTitle;

    this.notificationsService.create({
      createdBy: member['id'],
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: member['id'],
      messageTitle,
      messageText,
      isRead: false,
    });
    return invitation;
  }

  //Get Members
  async findByFilelds(fields) {
    return await this.membersRepository.find({
      select: ['id', 'memberuuid', 'email', 'fullName'],
      where: fields,
    });
  }

  //Get Dashborad Report Data
  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case MEMBERDASHBOARDKPI.TOTAL_VISITORS:
        qbQuery = `EXEC procGetMemberDashboardVisitorsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.TOTAL_NEW_REGISTRATIONS:
        qbQuery = `EXEC procGetMemberDashboardNewRegistrationsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.AVG_VISITORS_GROWTH:
        qbQuery = `EXEC procGetMemberDashboardAvgVisitorGrowthDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.AVG_REGISTRATIONS_GROWTH:
        qbQuery = `EXEC procGetMemberDashboardAvgRegistrationGrowthDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.AVG_SPEND_PER_USER:
        qbQuery = `EXEC procGetMemberDashboardAvgSpendPerUserDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.USER_SPENDING:
        qbQuery = `EXEC procGetMemberDashboardUserSpendingDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.CHURN_RATE:
        qbQuery = `EXEC procGetMemberDashboardChurnRateDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.MY_STALLIONS:
        qbQuery = `EXEC procGetMemberDashboardMyStallionsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.MY_MARES:
        qbQuery = `EXEC procGetMemberDashboardMyMaresDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.MY_BROODMARE_SIRES:
        qbQuery = `EXEC procGetMemberDashboardMyBroodmareSiresDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.MY_FARMS:
        qbQuery = `EXEC procGetMemberDashboardMyFarmsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MEMBERDASHBOARDKPI.TOTAL_USER_SESSIONS:
        qbQuery = `EXEC procGetMemberDashboardSessionDownload @paramDate1=@0, @paramDate2=@1`;
        break;
    }
    if (qbQuery == '') {
      throw new NotFoundException('No Data Exist');
    }
    let result = await this.membersRepository.manager.query(`${qbQuery}`, [
      options.fromDate,
      options.toDate,
    ]);

    if (result.length) {
      await result.reduce(async (promise, element) => {
        await promise;
        switch (options.kpiTitle) {
          case MEMBERDASHBOARDKPI.TOTAL_NEW_REGISTRATIONS:
            // element.MemberName = await this.commonUtilsService.toTitleCase(
            //   element.MemberName,
            // );
            break;
          case MEMBERDASHBOARDKPI.MY_STALLIONS:
            // element.StallionName = await this.commonUtilsService.toTitleCase(
            //   element.StallionName,
            // );
            // element.Farm = await this.commonUtilsService.toTitleCase(
            //   element.Farm,
            // );
            break;
          case MEMBERDASHBOARDKPI.MY_MARES:
          case MEMBERDASHBOARDKPI.MY_BROODMARE_SIRES:
            // element.HorseName = await this.commonUtilsService.toTitleCase(
            //   element.HorseName,
            // );
            // element.MemberName = await this.commonUtilsService.toTitleCase(
            //   element.MemberName,
            // );
            break;
          case MEMBERDASHBOARDKPI.MY_FARMS:
            // element.FarmName = await this.commonUtilsService.toTitleCase(
            //   element.FarmName,
            // );
            break;
        }
      }, Promise.resolve());
      let headerList = [];
      let headersData = Object.keys(result[0]);
      await headersData.reduce(async (promise, item) => {
        await promise;
        item;
        let itemObj = {
          header: item,
          key: item,
          width: 30,
        };
        headerList.push(itemObj);
      }, Promise.resolve());
      const currentDateTime = new Date();
      let file = await this.excelService.generateReport(
        `Report`,
        headerList,
        result,
      );
      return file;
    } else {
      throw new NotFoundException('Data not found for the given date range!');
    }
  }

  //Get Member Registrations By Country Data
  async getMemberRegistrationsByCountryData(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetMemberDashboardRegistrationByCountry @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let totalMembers = 0;
    await result.map(async (item) => {
      totalMembers = totalMembers + item.membersCount;
    });
    if (totalMembers) {
      await result.map(async (item) => {
        item.percent = 0;
        const numberToRound = (item.membersCount / totalMembers) * 100.0;
        if (numberToRound) {
          item.percent = Math.round(numberToRound);
        }
      });
    }
    return result;
  }

  /*Get Dashboard - RegistrationRateGraph*/
  async getRegistrationRateGraph(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetMemberDashboardRegRateGraph 
      @fromDate=@0, 
      @toDate=@1`,
      [options.fromDate, options.toDate],
    );
    let currentTotal = 0;
    let previousTotal = 0;
    let finalResult = [];
    let rangeFrom = null;
    let rangeTo = null;
    await result.map(async (item, index) => {
      currentTotal = currentTotal + item.currRegRate;
      previousTotal = previousTotal + item.prevRegRate;
      switch (item.interval) {
        case 'DAY':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getDayFromDate(
              item.currdayDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getDayFromDate(item.currdayDate);
          }
          finalResult.push({
            label: this.commonUtilsService.getDayFromDate(item.currdayDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'WEEK':
          if (index === 0) {
            rangeFrom = `Week ${item.currWeekNumber}`;
          }
          if (index === result.length - 1) {
            rangeTo = `Week ${item.currWeekNumber}`;
          }
          finalResult.push({
            label: `Week ${item.currWeekNumber}`,
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'MONTH':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getMonthFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'YEAR':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getYearFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
      }
    });
    return {
      currentTotal,
      previousTotal,
      rangeFrom,
      rangeTo,
      result: finalResult,
    };
  }

  //Get Dashborad Visitor Data
  async getDashboradVisitorData(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetCurrentAndPrevDates @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = {
      CurrentValue: 0,
      PrevValue: 0,
      Diff: 0,
      diffPercent: 0,
    };
    response.CurrentValue = await this.gaService.getHomePageVisitors(
      result[0].currFromDate,
      result[0].currToDate,
    );
    response.PrevValue = await this.gaService.getHomePageVisitors(
      result[0].prevFromDate,
      result[0].prevToDate,
    );
    response.Diff = response.CurrentValue - response.PrevValue;
    if (response.PrevValue) {
      response.diffPercent = Math.round(
        (response.Diff / response.PrevValue) * 100,
      );
    } else {
      response.diffPercent = Math.round((response.Diff / 1) * 100);
    }
    return response;
  }

  //Get Dashborad Visitor Average Data
  async getDashboradVisitorAvgData(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetCurrentAndPrevDates @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = {
      CurrentValue: 0,
      PrevValue: 0,
      Diff: 0,
      diffPercent: 0,
    };
    let dateDiff = differenceInDays(
      result[0].currToDate,
      result[0].currFromDate,
    );
    response.CurrentValue =
      Math.round(
        ((await this.gaService.getHomePageVisitors(
          result[0].currFromDate,
          result[0].currToDate,
        )) /
          dateDiff +
          Number.EPSILON) *
          100,
      ) / 100;
    response.PrevValue =
      Math.round(
        ((await this.gaService.getHomePageVisitors(
          result[0].prevFromDate,
          result[0].prevToDate,
        )) /
          dateDiff +
          Number.EPSILON) *
          100,
      ) / 100;
    response.Diff = response.CurrentValue - response.PrevValue;
    response.diffPercent = response.Diff;
    return response;
  }

  //Get Dashborad Visitors Report
  async getDashboradVisitorsReport(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetCurrentAndPrevDates @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = {
      CurrentValue: 0,
      PrevValue: 0,
      Diff: 0,
      diffPercent: 0,
    };
    response.CurrentValue = await this.gaService.getHomePageVisitors(
      result[0].currFromDate,
      result[0].currToDate,
    );
    response.PrevValue = await this.gaService.getHomePageVisitors(
      result[0].prevFromDate,
      result[0].prevToDate,
    );
    response.Diff = response.CurrentValue - response.PrevValue;
    let newResult = [];
    newResult.push({
      SNo: 1,
      CurrentValue: response.CurrentValue,
      PreviousValue: response.PrevValue,
      Difference: response.Diff,
    });
    return await this.generateReport(newResult);
  }

  //Get Dashborad Visitors Avg Report
  async getDashboradVisitorsAvgReport(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetCurrentAndPrevDates @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = {
      CurrentValue: 0,
      PrevValue: 0,
      Diff: 0,
      diffPercent: 0,
    };
    let dateDiff = differenceInDays(
      result[0].currToDate,
      result[0].currFromDate,
    );
    response.CurrentValue =
      Math.round(
        ((await this.gaService.getHomePageVisitors(
          result[0].currFromDate,
          result[0].currToDate,
        )) /
          dateDiff +
          Number.EPSILON) *
          100,
      ) / 100;
    response.PrevValue =
      Math.round(
        ((await this.gaService.getHomePageVisitors(
          result[0].prevFromDate,
          result[0].prevToDate,
        )) /
          dateDiff +
          Number.EPSILON) *
          100,
      ) / 100;
    response.Diff = response.CurrentValue - response.PrevValue;
    let newResult = [];
    newResult.push({
      SNo: 1,
      CurrentValue: response.CurrentValue,
      PreviousValue: response.PrevValue,
      Difference: response.Diff,
    });
    return await this.generateReport(newResult);
  }

  //Generate a Report
  async generateReport(result) {
    let headerList = [];
    let headersData = Object.keys(result[0]);
    await headersData.reduce(async (promise, item) => {
      await promise;
      item;
      let itemObj = {
        header: item,
        key: item,
        width: 30,
      };
      headerList.push(itemObj);
    }, Promise.resolve());
    let file = await this.excelService.generateReport(
      `Report`,
      headerList,
      result,
    );
    return file;
  }

  //Get WorldReach Members
  async getWorldReachMembers(options: MemberDashboardDto) {
    let result = await this.membersRepository.manager.query(
      `EXEC procGetMemberDashboardWorldReach @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );

    for (let item of result) {
      item.location = [item.latitude, item.longitude];
    }

    return result;
  }

  async findName(id) {
    const record = await this.membersRepository.findOne({
      id: id,
    });
    if (!record) {
      throw new UnprocessableEntityException('User not exist!');
    }
    return record;
  }

  //Download Members Data
  async download(searchOptions: SearchOptionsDownloadDto): Promise<any> {
    if (searchOptions.activity === 'No') {
      let results = await this.membersRepository
        .createQueryBuilder('member')
        .select('DISTINCT member.id as memberId')
        .leftJoin('member.activity', 'activity')
        .andWhere('activity.activityTypeId = :activityTypeId', {
          activityTypeId: 1,
        })
        .getRawMany();
      var memberIds = [];
      results.forEach((item) => {
        memberIds.push(item.memberId);
      });
    }
    const accessLeveleBuilder = getRepository(MemberFarm)
      .createQueryBuilder('memberfarms')
      .select(
        'MAX(memberfarms.accessLevelId) as accessLevel,memberfarms.memberId',
      )
      .groupBy('memberfarms.memberId');

    const queryBuilder = this.membersRepository
      .createQueryBuilder('member')
      .select(
        'DISTINCT member.id as memberId,member.memberuuid as memberUuid , member.fullName , member.email as emailAddress,member.statusId as statusId, member.sso as sso, member.createdOn as memberSince, member.modifiedOn as lastActive, member.isVerified as isVerified,member.roleId',
      )
      .addSelect('country.countryCode as countryCode')
      .addSelect('memberaddress.countryId as countryId')
      .addSelect('access.accessLevel as accessLevel')
      .addSelect('memberrole.roleName as roleName')
      .addSelect('searchShare.socialShareTypeId as socialShareTypeId')
      .leftJoin('member.memberaddresses', 'memberaddress')
      .leftJoin('memberaddress.country', 'country')
      .leftJoin('member.roles', 'memberrole')
      .leftJoin('member.favouritefarms', 'favfarm')
      .leftJoin('member.favouritestallions', 'favStallion')
      .leftJoin('member.favouritemares', 'favMare')
      .leftJoin('member.favouritebroodmareSire', 'favBrood')
      .leftJoin(
        '(' + accessLeveleBuilder.getQuery() + ')',
        'access',
        'access.memberId=member.id',
      )
      .leftJoin('member.preferedNotification', 'pcenter')
      .leftJoin('member.orderProduct', 'product')
      .leftJoin('member.memberfarms', 'memberfarms')
      .leftJoin('member.activity', 'activity')
      .leftJoin('member.searchShare', 'searchShare')
      .andWhere('member.roleId = :roleId', { roleId: RoleEnum.Breeder });
    if (searchOptions.emailAddress) {
      if (searchOptions.isEmailAddressExactSearch) {
        queryBuilder.andWhere('member.email = :email', {
          email: searchOptions.emailAddress,
        });
      } else {
        queryBuilder.andWhere('member.email like :email', {
          email: '%' + searchOptions.emailAddress + '%',
        });
      }
    }
    if (searchOptions.name) {
      if (searchOptions.isNameExactSearch) {
        queryBuilder.andWhere('member.fullName =:fullName', {
          fullName: searchOptions.name,
        });
      } else {
        queryBuilder.andWhere('member.fullName like :fullName', {
          fullName: '%' + searchOptions.name + '%',
        });
      }
    }
    if (searchOptions.country) {
      queryBuilder.andWhere('memberaddress.countryId = :countryId', {
        countryId: searchOptions.country,
      });
    }
    if (searchOptions.verified == true) {
      queryBuilder
        .andWhere('member.isVerified = :isVerified', { isVerified: 1 })
        .andWhere('member.isVerified IS NOT NULL');
    }
    if (searchOptions.verified == false) {
      queryBuilder.andWhere(
        new Brackets((subQ) => {
          subQ
            .where('member.isVerified = :isVerified', { isVerified: 0 })
            .orWhere('member.isVerified IS NULL');
        }),
      );
    }
    if (searchOptions.paymentmethodId) {
      queryBuilder.andWhere('member.paymentMethodId = :paymentMethodId', {
        paymentMethodId: searchOptions.paymentmethodId,
      });
    }
    if (searchOptions.statusId) {
      queryBuilder.andWhere('member.statusId = :statusId', {
        statusId: searchOptions.statusId,
      });
    }
    if (searchOptions.socialLinkId) {
      queryBuilder.andWhere('member.socialLinkId = :socialLinkId', {
        socialLinkId: searchOptions.socialLinkId,
      });
    }
    if (searchOptions.socialShare) {
      queryBuilder.andWhere(
        'searchShare.socialShareTypeId = :socialShareTypeId',
        { socialShareTypeId: searchOptions.socialShare },
      );
    }
    if (searchOptions.farmUser === 'Yes') {
      if (searchOptions.accessLevel) {
        queryBuilder.andWhere('access.accessLevel = :accessLevelId', {
          accessLevelId: searchOptions.accessLevel,
        });
      }
    }
    if (searchOptions.farmUser === 'No') {
      queryBuilder.andWhere('access.accessLevel IS NULL');
    }
    if (searchOptions.PreferedNotifications) {
      if (searchOptions.PreferedNotifications === 'Messaging') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 1 },
        );
      } else if (
        searchOptions.PreferedNotifications === 'Stallion Nominations'
      ) {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 2 },
        );
      } else if (searchOptions.PreferedNotifications === 'Promotional') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 3 },
        );
      } else if (searchOptions.PreferedNotifications === 'Membership Updates') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 4 },
        );
      } else if (searchOptions.PreferedNotifications === 'Technical Updates') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 5 },
        );
      } else if (searchOptions.PreferedNotifications === 'SM Announcements') {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 6 },
        );
      } else if (
        searchOptions.PreferedNotifications === 'System Notifications'
      ) {
        queryBuilder.andWhere(
          'pcenter.notificationTypeId =:notificationTypeId',
          { notificationTypeId: 7 },
        );
      }
    }
    if (searchOptions.horseTracking) {
      if (searchOptions.horseTracking === 'Stallions') {
        queryBuilder.andWhere('favStallion.memberId Is NOT NULL');
      } else if (searchOptions.horseTracking === 'Broodmare') {
        queryBuilder.andWhere('favMare.memberId Is NOT NULL');
      } else if (searchOptions.horseTracking === 'Broodmare Sires') {
        queryBuilder.andWhere('favBrood.memberId Is NOT NULL');
      } else if (searchOptions.horseTracking === 'Farms') {
        queryBuilder.andWhere('favfarm.memberId Is NOT NULL');
      }
    }
    if (searchOptions.PrevOrders) {
      if (searchOptions.PrevOrders === 'My Shortlist Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.SHORTLIST_STALLION_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Stallion Match PRO Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.STALLION_MATCH_PRO_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Broodmare Affinity Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.BROODMARE_AFFINITY_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Stallion Match Sales Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.STALLION_MATCH_SALES_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Stallion Affinity Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.STALLION_AFFINITY_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Broodmare Sire Report') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.BROODMARE_SIRE_REPORT,
        });
      } else if (searchOptions.PrevOrders === 'Local Boost') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.LOCAL_BOOST,
        });
      } else if (searchOptions.PrevOrders === 'Extended Boost') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.EXTENDED_BOOST,
        });
      } else if (searchOptions.PrevOrders === 'Promoted Stallion') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.PROMOTED_STALLION,
        });
      } else if (searchOptions.PrevOrders === 'Nomination Acceptance') {
        queryBuilder.andWhere('product.productId =:productId', {
          productId: PRODUCT.NOMINATION_ACCEPTANCE,
        });
      }
    }
    if (searchOptions.activePeriod) {
      const activePeriod = searchOptions.activePeriod;
      let dateList = activePeriod.split('/');
      if (dateList.length === 2) {
        var minDate = dateList[0];
        var maxDate = dateList[1];
      }
      queryBuilder.andWhere(
        'member.lastActive >= CONVERT(date, :minDate) AND member.lastActive <= CONVERT(date, :maxDate)',
        {
          minDate,
          maxDate,
        },
      );
    }
    if (searchOptions.activity === 'Yes') {
      queryBuilder.andWhere('activity.activityTypeId = :activityTypeId', {
        activityTypeId: 1,
      });
    }
    if (searchOptions.activity === 'No') {
      if (memberIds.length > 0)
        queryBuilder.andWhere('member.id NOT IN(:...memberIds)', {
          memberIds: memberIds,
        });
    }
    queryBuilder;
    if (searchOptions.sortBy) {
      const sortBy = searchOptions.sortBy;
      const byOrder = searchOptions.order;
      if (sortBy.toLowerCase() === 'emailaddress') {
        queryBuilder.orderBy('member.email', byOrder);
      }
      if (sortBy.toLowerCase() === 'fullname') {
        queryBuilder.orderBy('member.fullName', byOrder);
      }
      if (sortBy.toLowerCase() === 'countryid') {
        queryBuilder.orderBy('memberaddress.countryId', byOrder);
      }
      if (sortBy.toLowerCase() === 'verified') {
        queryBuilder.orderBy('member.isVerified', byOrder);
      }
      if (sortBy.toLowerCase() === 'memberid') {
        queryBuilder.orderBy('member.id', byOrder);
      }
      if (sortBy.toLowerCase() === 'membersince') {
        queryBuilder.orderBy('member.createdOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'lastactive') {
        queryBuilder.orderBy('member.modifiedOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'countrycode') {
        queryBuilder.orderBy('country.countryCode', byOrder);
      }
    }

    const entities = await queryBuilder.getRawMany();
    const keys = ['memberId'];
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    return filtered;
  }

  //Get a Activity By memberId
  async findOneForActivityBymemberId(id: number) {
    let record = await this.membersRepository.findOne({
      id: id,
    });
    if (!record) {
      throw new UnprocessableEntityException('User not exist!');
    }
    const memberAddress = await this.memberAddressService.findOne(record);
    let countryId = null;
    let stateId = null;
    if (memberAddress) {
      countryId = memberAddress.countryId;
      stateId = memberAddress.stateId;
    }
    return {
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      countryId,
      stateId,
    };
  }

  //Update Password
  async updatePassword(member: Member, updateDto: AuthChangePasswordDto) {
    const template = '/password-changed-success';

    this.sendNotificationMail(
      member,
      notificationTemplates.passwordChangedConfirmation,
      notificationTypeList.MEMBERSHIP_UPDATES,
      template,
    );
    updateDto['modifiedBy'] = member['id'];

    await this.membersRepository.save(
      this.membersRepository.create({
        id: member.id,
        ...updateDto,
      }),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Password changed successfully',
    };
  }

  //Send Notification Mail
  async sendNotificationMail(
    member: Member,
    messageTemplateUuid: string,
    notificationTypeCode: string,
    template: string,
  ) {
    const preferedNotification =
      await this.preferedNotificationsService.getPreferredNotificationByNotificationTypeCode(
        notificationTypeCode,
      );

    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        messageTemplateUuid,
      );
    const messageText = messageTemplate.messageText;
    const messageTitle = messageTemplate.messageTitle;
    this.notificationsService.create({
      createdBy: member['id'],
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: member['id'],
      messageTitle,
      messageText,
      isRead: false,
      notificationType: preferedNotification?.notificationTypeId,
    });
  }

  //Get Latest Orders of a Member
  async getLatestOrders(uuid: string, pageOptionsDto: PageOptionsDto) {
    const member = await this.membersRepository.findOne({ memberuuid: uuid });
    if (!member) {
      throw new HttpException('Member not exist', HttpStatus.NOT_FOUND);
    }
    const orderStatus = await this.orderStatusService.findOneByStatusCode(
      ordersStatusList.COMPLETED,
    );

    const queryBuilder = await getRepository(Order)
      .createQueryBuilder('order')
      .select('order.id as orderId')
      .addSelect('orderProduct.pdfLink as reportLink')
      .addSelect('product.productName as reportName')
      .innerJoin('order.orderProduct', 'orderProduct')
      .innerJoin('orderProduct.product', 'product')
      .andWhere('orderProduct.isLinkActive = 1')
      .andWhere('orderProduct.orderStatusId >= :orderStatusId', {
        orderStatusId: orderStatus?.id,
      })
      .andWhere('order.memberId = :memberId', { memberId: member.id });

    if (pageOptionsDto.limit) {
      queryBuilder.limit(pageOptionsDto.limit);
    } else {
      queryBuilder.limit(20);
    }

    if (pageOptionsDto.order) {
      queryBuilder.orderBy('order.createdOn', pageOptionsDto.order);
    } else {
      queryBuilder.orderBy('order.createdOn', 'DESC');
    }

    const reports = await queryBuilder.getRawMany();

    return reports;
  }

  /* Get All Member Locations */
  async getAllMemberLocations() {
    let data = await this.membersRepository.manager.query(
      `EXEC proc_SMPGetAllMembersCountries`,
    );
    return data;
  }

  /* Update Member Last Active */
  @OnEvent('updateLastActive')
  async updateLastActive(memberId: number) {
    return await this.membersRepository.update(
      { id: memberId },
      {
        lastActive: new Date(),
      },
    );
  }
}
