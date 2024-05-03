import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { FarmAuditEntity } from 'src/audit/farm-audit/farm-audit.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { Country } from 'src/country/entity/country.entity';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { ExcelService } from 'src/excel/excel.service';
import { FarmGalleryImageDto } from 'src/farm-gallery-images/dto/farm-gallery-image.dto';
import { FarmGalleryImageService } from 'src/farm-gallery-images/farm-gallery-image.service';
import { FarmMediaFileDto } from 'src/farm-media-files/dto/farm-media-file.dto';
import { FarmMediaFilesService } from 'src/farm-media-files/farm-media-files.service';
import { CreateMediaDto } from 'src/farm-media-info/dto/create-media.dto';
import { UpdateMediaDto } from 'src/farm-media-info/dto/update-media.dto';
import { FarmMediaInfoService } from 'src/farm-media-info/farm-media-info.service';
import { FarmProfileImage } from 'src/farm-profile-image/entities/farm-profile-image.entity';
import { FarmProfileImageService } from 'src/farm-profile-image/farm-profile-image.service';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { GoogleAnalyticsService } from 'src/google-analytics/google-analytics.service';
import { HorsesService } from 'src/horses/horses.service';
import { MailService } from 'src/mail/mail.service';
import { MediaService } from 'src/media/media.service';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { Member } from 'src/members/entities/member.entity';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { Messages } from 'src/messages/entities/messages.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { PreferedNotificationService } from 'src/prefered-notification/prefered-notifications.service';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { FARMDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import {
  notificationTemplates,
  notificationTypeList,
} from 'src/utils/constants/notifications';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { In, Like, Repository, getRepository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { FarmLocationDto } from '../farm-locations/dto/farm-location.dto';
import { FarmLocationsService } from '../farm-locations/farm-locations.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { SearchOptionsDownloadDto } from './dto/download-farm-list.dto';
import { FarmNameSearchDto } from './dto/farm-name-search.dto';
import { FarmsListDto } from './dto/farms-list.dto';
import { LocationsListDto } from './dto/locations-list.dto';
import { SearchByNameDto } from './dto/search-by-name.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateFarmGalleryDto } from './dto/update-farm-gallery.dto';
import { UpdateFarmMediaInfoDto } from './dto/update-farm-media-info';
import { UpdateFarmOverviewDto } from './dto/update-farm-overview.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Farm } from './entities/farm.entity';
import { MessageRecipient } from 'src/message-recepient/entities/message-recipient.entity';

@Injectable({ scope: Scope.REQUEST })
export class FarmsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Farm)
    private farmsRepository: Repository<Farm>,
    private farmLocationService: FarmLocationsService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly mediaService: MediaService,
    private readonly fileUploadsService: FileUploadsService,
    private readonly configService: ConfigService,
    private readonly farmProfileImageService: FarmProfileImageService,
    private currenciesService: CurrenciesService,
    private horsesService: HorsesService,
    private readonly farmGalleryImageService: FarmGalleryImageService,
    private readonly farmMediaInfoService: FarmMediaInfoService,
    private readonly farmMediaFilesService: FarmMediaFilesService,
    private readonly excelService: ExcelService,
    private readonly gaService: GoogleAnalyticsService,
    private readonly messageTemplatesService: MessageTemplatesService,
    private readonly preferedNotificationService: PreferedNotificationService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  //Create a record
  async create(createFarmDto: CreateFarmDto) {
    const member = this.request.user;
    const { farmName } = createFarmDto;
    createFarmDto.createdBy = member['id'];
    createFarmDto.isVerified = true;
    createFarmDto.isActive = true;
    createFarmDto.isPromoted = false;
    const farmResponse = await this.farmsRepository.save(
      this.farmsRepository.create(createFarmDto),
    );
    // Validate profileImage
    if (createFarmDto?.profileImageuuid) {
      await this.setFarmProfilePic(
        farmResponse,
        createFarmDto.profileImageuuid,
      );
    }
    let locationData = new FarmLocationDto();
    locationData.countryId = createFarmDto.countryId;
    locationData.stateId = createFarmDto.stateId;
    locationData.farmId = farmResponse.id;
    locationData.createdBy = member['id'];
    await this.farmLocationService.create(locationData);
    return farmResponse;
  }

  //Get Farms By Name
  async findFarmsByName(pageOptionsDto: FarmNameSearchDto): Promise<Farm[]> {
    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'farm.farmUuid as farmId, farm.farmName, country.countryName ,country.id as countryId, state.id as stateId',
      )
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farmlocation.state', 'state');
    if (pageOptionsDto.farmName) {
      if (pageOptionsDto.isFarmNameExactSearch) {
        queryBuilder.andWhere('farm.farmName =:farmName', {
          farmName: pageOptionsDto.farmName,
        });
      } else {
        queryBuilder.andWhere('farm.farmName like :farmName', {
          farmName: `%${pageOptionsDto.farmName}%`,
        });
      }
    }

    queryBuilder
      .andWhere({ isActive: true })
      .orderBy('farm.farmName', pageOptionsDto.order);

    let entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Get all farms
  async findAll(searchOptionsDto: SearchOptionsDto): Promise<PageDto<Farm>> {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    let scntQuery = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id, count(stallion.id) totalStallions')
      .andWhere("stallion.isRemoved = 0")
      .innerJoin('farm.stallions', 'stallion')
      .groupBy('farm.id');

    let ucntQuery = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id, count(memberfarm.memberId) users')
      .innerJoin('farm.memberfarms', 'memberfarm')
      .groupBy('farm.id');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let spQuery = getRepository(StallionPromotion)
      .createQueryBuilder('sp')
      .select(
        'DISTINCT sp.stallionId stallionId, sp.startDate startDate, sp.endDate endDate, CASE WHEN ((getutcdate() BETWEEN sp.startDate AND sp.endDate) AND (op.promotionId IS NOT NULL OR sp.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted,  CASE WHEN getutcdate() >  sp.endDate THEN 1 ELSE 0 END AS expired',
      )
      .innerJoin('sp.stallion', 'stallion')
      .andWhere("stallion.isRemoved = 0")
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=sp.id',
      );

    let spcntQuery = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.farmId, count(stallion.id) promoted')
      .innerJoin(
        '(' + spQuery.getQuery() + ')',
        'pro',
        'pro.stallionId=stallion.id AND pro.isPromoted=1',
      )
      .groupBy('stallion.farmId');

    let fPromotionQueryBuilder = getRepository(Stallion)
      .createQueryBuilder('t1')
      .select(
        't1.farmId, CAST(1 as bit) as isPromoted, count(*) as promotedStallions',
      )
      .innerJoin(
        '(' + spQuery.getQuery() + ')',
        't2',
        't2.stallionId=t1.id AND t2.isPromoted=1',
      )
      .groupBy('t1.farmId');

    let EPromotionQueryBuilder = getRepository(Stallion)
      .createQueryBuilder('exp')
      .select('exp.farmId, 1 as expired, count(*) as expiredFarms')
      .innerJoin(
        '(' + spQuery.getQuery() + ')',
        't3',
        't3.stallionId=exp.id AND t3.expired=1',
      )
      .groupBy('exp.farmId');

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'MAX(studFee.id) as studFeeId, studFee.stallionId as feeStallionId',
      )
      .groupBy('studFee.stallionId');

    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'farm.farmUuid as farmId, farm.farmName as farmName, farm.isActive, farm.isVerified, promotion.isPromoted,expromotion.expired, farm.createdBy, farm.createdOn, farm.modifiedBy, farm.modifiedOn',
      )
      .addSelect('country.countryName as countryName')
      .addSelect('state.stateName as stateName')
      .addSelect('scnt.totalStallions, ucnt.users, spcnt.promoted')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('stallionservicefee.fee as fee')
      .addSelect('stallionservicefee.feeYear as feeYear')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farm.stallions', 'stallion')
      .leftJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .leftJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .leftJoin('stallionservicefee.currency', 'currency')
      .leftJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .leftJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )

      .leftJoin('farmlocation.state', 'state')
      .leftJoin('(' + scntQuery.getQuery() + ')', 'scnt', 'scnt.id=farm.id')
      .leftJoin('(' + ucntQuery.getQuery() + ')', 'ucnt', 'ucnt.id=farm.id')
      .leftJoin(
        '(' + spcntQuery.getQuery() + ')',
        'spcnt',
        'spcnt.farmId=farm.id',
      )
      .leftJoin(
        '(' + fPromotionQueryBuilder.getQuery() + ')',
        'promotion',
        'promotion.farmId=farm.id',
      )
      .leftJoin(
        '(' + EPromotionQueryBuilder.getQuery() + ')',
        'expromotion',
        'expromotion.farmId=farm.id',
      );

    if (searchOptionsDto.activePeriod) {
      let dateRange = searchOptionsDto.activePeriod.split('/');
      if (dateRange.length == 2) {
        queryBuilder
          .innerJoin('farm.memberfarms', 'memberfarm')
          .innerJoin('memberfarm.member', 'member')
          .innerJoin('member.activity', 'activity')
          .andWhere('farm.isVerified = :isVerified', { isVerified: 1 })
          .andWhere('activity.createdOn BETWEEN :fromDate AND :toDate', {
            fromDate: await this.commonUtilsService.setHoursZero(dateRange[0]),
            toDate: await this.commonUtilsService.setToMidNight(dateRange[1]),
          });
      }
    }

    if (searchOptionsDto.farmName) {
      if (searchOptionsDto.isFarmNameExactSearch) {
        queryBuilder.andWhere('farm.farmName =:farmName', {
          farmName: searchOptionsDto.farmName,
        });
      } else {
        queryBuilder.andWhere('farm.farmName like :farmName', {
          farmName: '%' + searchOptionsDto.farmName + '%',
        });
      }
    }
    if (searchOptionsDto.farmId) {
      queryBuilder.andWhere('farm.farmUuid = :farmId', {
        farmId: searchOptionsDto.farmId,
      });
    }
    if (searchOptionsDto.country) {
      queryBuilder.andWhere('farmlocation.countryId = :countryId', {
        countryId: searchOptionsDto.country,
      });
    }
    if (searchOptionsDto.Status && searchOptionsDto.Status != 'All') {
      let isActive = searchOptionsDto.Status == 'Active' ? true : false;
      queryBuilder.andWhere('farm.isActive = :isActive', {
        isActive: isActive,
      });
    }
    if (
      searchOptionsDto.PromotedStatus &&
      searchOptionsDto.PromotedStatus != 'All'
    ) {
      let isPromoted = searchOptionsDto.PromotedStatus == 'Promoted' ? 1 : 0;
      if (isPromoted) {
        queryBuilder.andWhere('promotion.isPromoted = :isPromoted', {
          isPromoted: isPromoted,
        });
      } else {
        queryBuilder.andWhere('promotion.isPromoted IS NULL');
      }
    }
    if (
      searchOptionsDto.expiredStallion &&
      searchOptionsDto.expiredStallion != 'All'
    ) {
      let expired = searchOptionsDto.expiredStallion == 'Yes' ? 1 : 0;
      if (expired) {
        queryBuilder.andWhere('expromotion.expired = :expired', {
          expired: expired,
        });
      } else {
        queryBuilder.andWhere('expromotion.expired IS NULL');
      }
    }
    if (searchOptionsDto.RequiresVerification == true) {
      queryBuilder.andWhere('farm.isVerified = 0');
    }
    if (searchOptionsDto.RequiresVerification == false) {
      queryBuilder.andWhere('farm.isVerified = :isVerified', { isVerified: 1 });
    }

    if (searchOptionsDto.RequiresVerification == true) {
      queryBuilder.orderBy('farm.createdOn', 'DESC');
    }

    queryBuilder;
    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      const byOrder = searchOptionsDto.order;
      if (sortBy.toLowerCase() === 'farmname') {
        queryBuilder.orderBy('farm.farmName', byOrder);
      }
      if (sortBy.toLowerCase() === 'countryid') {
        queryBuilder.orderBy('farmlocation.countryId ', byOrder);
      }
      if (sortBy.toLowerCase() === 'isactive') {
        queryBuilder.orderBy('farm.isActive', byOrder);
      }
      if (sortBy.toLowerCase() === 'isverified') {
        queryBuilder.orderBy('farm.isVerified', byOrder);
      }
      if (sortBy.toLowerCase() === 'ispromoted') {
        queryBuilder.orderBy('farm.isPromoted', byOrder);
      }
      if (sortBy.toLowerCase() === 'countryname') {
        queryBuilder.orderBy('country.countryName', byOrder);
      }
      if (sortBy.toLowerCase() === 'statename') {
        queryBuilder.orderBy('state.stateName', byOrder);
      }
      if (sortBy.toLowerCase() === 'createdby') {
        queryBuilder.orderBy('farm.createdBy', byOrder);
      }
      if (sortBy.toLowerCase() === 'createdon') {
        queryBuilder.orderBy('farm.createdOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'modifiedby') {
        queryBuilder.orderBy('farm.modifiedBy', byOrder);
      }
      if (sortBy.toLowerCase() === 'modifiedon') {
        queryBuilder.orderBy('farm.modifiedOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'totalstallions') {
        queryBuilder.orderBy('scnt.totalStallions', byOrder);
      }
      if (sortBy.toLowerCase() === 'users') {
        queryBuilder.orderBy('ucnt.users', byOrder);
      }
      if (sortBy.toLowerCase() === 'promoted') {
        queryBuilder.orderBy('spcnt.promoted', byOrder);
      }
    } else {
      queryBuilder.orderBy('farm.farmName', searchOptionsDto.order);
    }
    const entities = await queryBuilder.getRawMany();
    const keys = ['farmId'];
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    const itemCount = filtered.length;

    let result = filtered.slice(
      searchOptionsDto.skip,
      searchOptionsDto.skip + searchOptionsDto.limit,
    );

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });
    return new PageDto(result, pageMetaDto);
  }

  //Get All By Name
  async findAllByName(farmName: string, searchByNameDto: SearchByNameDto) {
    return await this.farmsRepository.find({
      where: {
        farmName: searchByNameDto?.isFarmNameExactSearch
          ? farmName
          : Like(`%${farmName}%`),
      },
      take: 20,
    });
  }

  //Get a record
  async findOne(id: any) {
    return await this.farmsRepository.findOne({
      farmUuid: id,
    });
  }

  //Get a record
  async findFarm(id: string) {
    return await this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'farm.id as id ,farm.farmUuid as farmUuid, farm.farmName as farmName, farm.email as email,farm.website as website, farm.url as url,farm.overview as overview,farm.isActive, farm.isVerified, farm.createdBy, farm.createdOn, farm.modifiedBy, farm.modifiedOn, memberfarm.isFamOwner as owner,memberfarm.memberId  as memberId',
      )
      .addSelect('country.id as countryId')
      .addSelect('state.id as stateId')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farmlocation.state', 'state')
      .leftJoin('farm.memberfarms', 'memberfarm')
      .andWhere('farm.farmUuid = :farmUuid', { farmUuid: id })
      .getRawOne();
  }

  //Update a record
  async update(id: string, updateFarmDto: UpdateFarmDto) {
    const member = this.request.user;
    const { farmName } = updateFarmDto;
    let record = await this.getFarmByUuid(id);
    if (updateFarmDto?.isProfileImageDeleted) {
      await this.deleteFarmProfilePic(record);
    }
    // Validate profileImage
    if (updateFarmDto?.profileImageuuid) {
      await this.setFarmProfilePic(record, updateFarmDto.profileImageuuid);
    }
    let locationData = new FarmLocationDto();
    locationData.countryId = updateFarmDto.countryId;
    locationData.stateId = updateFarmDto.stateId;
    //Any other process to handle these excess columns on update!
    const farmResponse = await this.getFarmDetails(id);
    locationData.farmId = farmResponse.id;
    locationData.modifiedBy = member['id'];
    await this.farmLocationService.update(farmResponse.id, locationData);

    delete updateFarmDto.countryId;
    delete updateFarmDto.stateId;
    delete updateFarmDto.profileImageuuid;
    delete updateFarmDto.isProfileImageDeleted;
    updateFarmDto.modifiedBy = member['id'];
    const updateFarm = {
      ...updateFarmDto,
      isVerified: true,
      modifiedOn: new Date(),
    };

    await this.farmsRepository.update({ id: record.id }, updateFarm);
    if (!record.isVerified) {
      let farmMembers = await this.getFarmMembers(id);

      farmMembers.forEach(async (fMember) => {
        if (fMember && fMember['roleId'] == 2) {
          const messageTemplate =
            await this.messageTemplatesService.getMessageTemplateByUuid(
              notificationTemplates.farmCreatedUuid,
            );

          if (messageTemplate) {
            if (messageTemplate.emailSms) {
              const recipient = await getRepository(Member).findOne({
                memberuuid: fMember['memberId'],
              });

              const preferedNotification =
                await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
                  notificationTypeList.SYSTEM_NOTIFICATIONS,
                  recipient['id'],
                );

              if (!preferedNotification || preferedNotification.isActive) {
                let mailData = {
                  to: fMember.email,
                  subject: 'Congratulations! Your farm is now live on Stallion Match.',
                  text: '',
                  template: '/farm-added',
                  context: {
                    FarmUser: await this.commonUtilsService.toTitleCase(
                      fMember.fullName,
                    ),
                    FarmDashboard:
                      process.env.PORTALFRONTEND_DOMAIN +
                      '/' +
                      process.env.FRONTEND_APP_DASHBOARD_URI +
                      farmResponse.farmName +
                      '/' +
                      farmResponse.farmId,
                    manageStallions:
                      process.env.PORTALFRONTEND_DOMAIN +
                      '/stallions/' +
                      farmResponse.farmName +
                      '/' +
                      farmResponse.farmId,
                  },
                };

                this.mailService.sendMailCommon(mailData);
              }
            }
          }
        }
      });

      let farmMember = await getRepository(MemberFarm)
        .createQueryBuilder('memberfarm')
        .select(
          'member.id as memberId, member.fullName as memberName, member.email as email',
        )
        .innerJoin('memberfarm.member', 'member')
        .where('memberfarm.farmId = :farmId', { farmId: record.id })
        .getRawOne();

      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.farmVerifiedConfirmationToOwnerUuid,
        );
      const messageText = messageTemplate.messageText.replace(
        '{farmName}',
        await this.commonUtilsService.toTitleCase(farmName),
      );
      const messageTitle = messageTemplate.messageTitle;
      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationTypeList.SYSTEM_NOTIFICATIONS,
        );
      const sendNotification = await this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: farmMember['memberId'],
        messageTitle,
        messageText,
        notificationType: preferedNotification?.notificationTypeId,
        isRead: false,
        farmid: record.id,
      });
    }

    if (farmName != record.farmName) {
      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationTypeList.SYSTEM_NOTIFICATIONS,
        );
      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.adminChangedFarmNameUuid,
        );
      const messageText = messageTemplate.messageText
        .replace(
          '{PreviousFarmName}',
          await this.commonUtilsService.toTitleCase(record.farmName),
        )
        .replace(
          '{farmName}',
          await this.commonUtilsService.toTitleCase(farmName),
        );
      const messageTitle = messageTemplate.messageTitle.replace(
        '{farmName}',
        await this.commonUtilsService.toTitleCase(farmName),
      );
      this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: member['id'],
        messageTitle,
        messageText,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
        farmid: record.id,
      });
    }
    const finalfarmResponse = await this.getFarmDetail(id);

    return finalfarmResponse;
  }

  //Get Farm by farmId
  async getFarmByUuid(farmUuid: string) {
    const record = await this.farmsRepository.findOne({ farmUuid });
    if (!record) {
      throw new UnprocessableEntityException('Farm not exist!');
    }
    return record;
  }

  //Get Farm by farmId
  async getFarmDetails(farmUuid: string) {
    const record = await this.farmsRepository.findOne({ farmUuid });
    if (!record) {
      throw new NotFoundException('Farm not found!');
    }
    let scntQuery = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id, count(stallion.id) totalStallions')
      .innerJoin('farm.stallions', 'stallion')
      .andWhere("stallion.isRemoved = 0")
      .groupBy('farm.id');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let spQuery = getRepository(StallionPromotion)
      .createQueryBuilder('sp')
      .select(
        'DISTINCT sp.stallionId stallionId, sp.startDate startDate, sp.endDate endDate, CASE WHEN ((getutcdate() BETWEEN sp.startDate AND sp.endDate) AND (op.promotionId IS NOT NULL OR sp.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted,  CASE WHEN getutcdate() >  sp.endDate THEN 1 ELSE 0 END AS expired',
      )
      .innerJoin('sp.stallion', 'stallion')
      .andWhere("stallion.isRemoved = 0")
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=sp.id',
      );

    let fPromotionQueryBuilder = getRepository(Stallion)
      .createQueryBuilder('t1')
      .select(
        't1.farmId, CAST(1 as bit) as isPromoted, count(*) as promotedStallions',
      )
      .innerJoin(
        '(' + spQuery.getQuery() + ')',
        't2',
        't2.stallionId=t1.id AND t2.isPromoted=1',
      )
      .groupBy('t1.farmId');

    let ucntQuery = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id, count(memberfarm.memberId) users')
      .innerJoin('farm.memberfarms', 'memberfarm')
      .groupBy('farm.id');

    let farmOwner = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id as ofarmId')
      .addSelect('memberfarm.memberId as memberId')
      .innerJoin('farm.memberfarms', 'memberfarm')
      .andWhere('memberfarm.isFamOwner = 1')
      .groupBy('farm.id,memberfarm.memberId');

    let fpiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );
    // let receivedCount = await getRepository(Messages)
    //   .createQueryBuilder('message')
    //   .select('count(message.id) as recieved,message.farmId as farmId')
    //   .innerJoin('message.messagerecipient', 'messagerecipient')
    //   .leftJoin(
    //     '(' + farmOwner.getQuery() + ')',
    //     'farmOwner',
    //     'farmOwner.ofarmId=message.farmId AND farmOwner.memberId=messagerecipient.recipientId',
    //   )
    //   .groupBy('message.farmId');
    const receivedCount = await getRepository(MessageRecipient)
    .createQueryBuilder('messagerecipient')
    .select('COUNT(DISTINCT messagerecipient.channelId)', 'received')
    .addSelect('message.farmId', 'farmId')
    .innerJoin('messagerecipient.message', 'message')
    .where("message.farmId = :farmId", { farmId: record.id })
    .groupBy('message.farmId')
    .getRawOne();

    // let sentCount = await getRepository(Messages)
    //   .createQueryBuilder('message')
    //   .select('count(message.id) as sent ,message.farmId as farmId')
    //   .leftJoin(
    //     '(' + farmOwner.getQuery() + ')',
    //     'farmOwner',
    //     'farmOwner.ofarmId=message.farmId AND farmOwner.memberId=message.createdBy',
    //   )
    //   .groupBy('message.farmId');
    const sentCount = await getRepository(MessageRecipient)
    .createQueryBuilder('messagerecipient')
    .select('COUNT(DISTINCT messagerecipient.channelId)', 'sent')
    .addSelect('message.farmId', 'farmId')
    .innerJoin('messagerecipient.message', 'message')
    .where("message.farmId = :farmId", { farmId: record.id })
    .groupBy('message.farmId')
    .getRawOne();

    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'farm.id as id ,farm.isActive as isActive,farm.farmUuid as farmId, farm.email, farm.website, mediaUrl as image, farm.url, farm.overview, farm.farmName as farmName, promotion.isPromoted'
      )
    //  .addSelect('sent.sent as sent ,  rcv.recieved as recieved')
      .addSelect('country.id as countryId, country.countryCode as countryCode')
      .addSelect('state.id as stateId, state.stateName as stateName')
      .addSelect('scnt.totalStallions, ucnt.users')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('(' + scntQuery.getQuery() + ')', 'scnt', 'scnt.id=farm.id')
      .leftJoin('(' + ucntQuery.getQuery() + ')', 'ucnt', 'ucnt.id=farm.id')
      // .leftJoin(
      //   '(' + receivedCount.getQuery() + ')',
      //   'rcv',
      //   'rcv.farmId=farm.id',
      // )
      // .leftJoin('(' + sentCount.getQuery() + ')', 'sent', 'sent.farmId=farm.id')
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      )
      .leftJoin(
        '(' + fPromotionQueryBuilder.getQuery() + ')',
        'promotion',
        'promotion.farmId=farm.id',
      )
      .leftJoin('farmlocation.state', 'state');
    queryBuilder.where('farm.farmUuid = :farmUuid', { farmUuid: farmUuid });
    //return 
    const entities = await queryBuilder.getRawOne();
    const response = {
      ...entities,
      recieved: receivedCount?.received,
      sent : sentCount?.sent
    }
    return response
    
  }

  //Get Farm by farmId
  async getFarmDetail(farmUuid: string) {
    const record = await this.farmsRepository.findOne({ farmUuid });
    if (!record) {
      throw new NotFoundException('Farm not found!');
    }
    let scntQuery = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id, count(stallion.id) totalStallions')
      .innerJoin('farm.stallions', 'stallion')
      .groupBy('farm.id');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let spQuery = getRepository(StallionPromotion)
      .createQueryBuilder('sp')
      .select(
        'DISTINCT sp.stallionId stallionId, sp.startDate startDate, sp.endDate endDate, CASE WHEN ((getutcdate() BETWEEN sp.startDate AND sp.endDate) AND (op.promotionId IS NOT NULL OR sp.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted,  CASE WHEN getutcdate() >  sp.endDate THEN 1 ELSE 0 END AS expired',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=sp.id',
      );

    let fPromotionQueryBuilder = getRepository(Stallion)
      .createQueryBuilder('t1')
      .select(
        't1.farmId, CAST(1 as bit) as isPromoted, count(*) as promotedStallions',
      )
      .innerJoin(
        '(' + spQuery.getQuery() + ')',
        't2',
        't2.stallionId=t1.id AND t2.isPromoted=1',
      )
      .groupBy('t1.farmId');

    let ucntQuery = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id, count(memberfarm.memberId) users')
      .innerJoin('farm.memberfarms', 'memberfarm')
      .groupBy('farm.id');

    let fpiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'farm.id as id ,farm.isActive as isActive,farm.farmUuid as farmId, farm.email, farm.website, mediaUrl as image, farm.url, farm.overview, farm.farmName as farmName, promotion.isPromoted,0 as sent ,  0 as recieved',
      )
      .addSelect('country.id as countryId, country.countryCode as countryCode')
      .addSelect('state.id as stateId, state.stateName as stateName')
      .addSelect('scnt.totalStallions, ucnt.users')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('(' + scntQuery.getQuery() + ')', 'scnt', 'scnt.id=farm.id')
      .leftJoin('(' + ucntQuery.getQuery() + ')', 'ucnt', 'ucnt.id=farm.id')
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      )
      .leftJoin(
        '(' + fPromotionQueryBuilder.getQuery() + ')',
        'promotion',
        'promotion.farmId=farm.id',
      )
      .leftJoin('farmlocation.state', 'state');
    queryBuilder.where('farm.farmUuid = :farmUuid', { farmUuid: farmUuid });

    return await queryBuilder.getRawOne();
  }

  //Set Farm by Profile Pic
  async setFarmProfilePic(record: Farm, fileUuid: string) {
    await this.deleteFarmProfilePic(record);
    // Set Stallion Profile Image
    let mediaRecord = await this.mediaService.create(fileUuid);
    return await this.farmProfileImageService.create({
      farmId: record.id,
      mediaId: mediaRecord.id,
    });
  }

  //Get Presigned Url for Profile Image Upload
  async profileImageUpload(fileInfo: FileUploadUrlDto) {
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    //TODO: Validate allowed file format or not
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirFarmProfileImage',
    )}/${uuid()}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Delete Profile Image
  async deleteFarmProfilePic(record: Farm) {
    // Check Profile pic already exist, if yes delete it from S3
    let profileImageData = await this.farmProfileImageService.findByFarmId(
      record.id,
    );
    if (profileImageData) {
      //Mark for Deletion - previous profile image
      await this.mediaService.markForDeletion(profileImageData.mediaId);
    }
  }

  //Get Profile Image By farmId
  async getFarmLogoByFarmId(farmId: number) {
    const record = await this.farmsRepository.findOne({
      id: farmId,
      isActive: true,
    });
    if (!record) {
      throw new NotFoundException('Farm not found!');
    }
    let fpiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select('mediaUrl as farmLogo')
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      );

    queryBuilder
      .where('farm.id = :farmId', { farmId: farmId })
      .andWhere({ isActive: true });

    return await queryBuilder.getRawOne();
  }

  //Farm Overview Update
  async overviewUpdate(farmUuid: string, data: UpdateFarmOverviewDto) {
    const member = this.request.user;
    await this.getFarmByUuid(farmUuid);
    let updateDto = {
      ...data,
      modifiedBy: member['id'],
    };

    await this.farmsRepository.update({ farmUuid: farmUuid }, updateDto);
    return await this.getFarmDetails(farmUuid);
  }

  //Get Presigned Url for Gallery Image Upload
  async galleryImageUpload(farmUuid: string, fileInfo: FileUploadUrlDto) {
    let record = await this.getFarmByUuid(farmUuid);
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    //TODO: Validate allowed file format or not
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get('file.s3DirFarmGalleryImage')}/${
      record.farmUuid
    }/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Set Farm Gallery Images
  async galleryUpdate(farmUuid: string, data: UpdateFarmGalleryDto) {
    const record = await this.getFarmByUuid(farmUuid);
    //Validate and Set GalleryImage
    if (data?.galleryImages) {
      await this.setGalleryImages(record.id, data.galleryImages);
    }
    return await this.getFarmDetails(farmUuid);
  }

  //Set Farm Gallery Images
  async setGalleryImages(farmId: number, galleryImages: FarmGalleryImageDto[]) {
    let newImages = [];
    let deletedImages = [];
    await galleryImages.reduce(
      async (promise, galleryImage: FarmGalleryImageDto) => {
        await promise;
        if (galleryImage.mediauuid) {
          if (galleryImage.isDeleted) {
            deletedImages.push(galleryImage.mediauuid);
          } else {
            newImages.push(galleryImage.mediauuid);
          }
        }
      },
      Promise.resolve(),
    );
    // Validate Count
    let itemCount = await this.farmGalleryImageService.getImagesCountByFarmId(
      farmId,
    );
    itemCount = itemCount + newImages.length - deletedImages.length;
    if (itemCount > this.configService.get('file.maxLimitGalleryImage')) {
      throw new UnprocessableEntityException('Max limit reached!');
    }
    let farmGalleryImageService = this.farmGalleryImageService;
    await galleryImages.reduce(
      async (promise, galleryImage: FarmGalleryImageDto) => {
        await promise;
        if (galleryImage.mediauuid) {
          if (galleryImage.isDeleted) {
            await this.mediaService.markForDeletionByMediaUuid(
              galleryImage.mediauuid,
            );
          } else {
            let mediaRecord = await this.mediaService.create(
              galleryImage.mediauuid,
            );
            await farmGalleryImageService.create(farmId, mediaRecord.id);
          }
        }
      },
      Promise.resolve(),
    );
  }

  //Get All Farm Gallery Images
  async getAllGalleryImages(farmUuid: string) {
    const farm = await this.getFarmByUuid(farmUuid);
    return await this.farmGalleryImageService.getAllFarmGalleryImages(farm.id);
  }

  //Get All Farm Media
  async getAllFarmMediaByFarmId(farmUuid: string) {
    const farm = await this.getFarmByUuid(farmUuid);
    let records = await this.farmMediaInfoService.getAllMediaByFarmId(farm.id);
    return records;
  }

  //Update Farm Media
  async mediaUpdate(farmUuid: string, data: UpdateFarmMediaInfoDto) {
    const record = await this.getFarmByUuid(farmUuid);
    //Validate and Set Media
    if (data?.mediaInfos) {
      await this.setMediaInfos(record.id, data.mediaInfos);
    }
    return await this.getFarmDetails(farmUuid);
  }

  //Set Farm Media
  async setMediaInfos(farmId: number, mediaInfos: CreateMediaDto[]) {
    let createdMediaInfos = [];
    let updatedMediaInfos = [];
    let deletedMediaInfos = [];
    await mediaInfos.reduce(async (promise, mediaInfo: CreateMediaDto) => {
      await promise;
      if (mediaInfo?.mediaInfoId) {
        if (mediaInfo?.isDeleted) {
          //Delete MediaInfo
          deletedMediaInfos.push(mediaInfo);
        } else {
          //Update MediaInfo
          updatedMediaInfos.push(mediaInfo);
        }
      } else {
        //Create MediaInfo
        createdMediaInfos.push(mediaInfo);
      }
    }, Promise.resolve());

    //Delete MediaInfos
    await this.deleteMediaInfosFromFarm(farmId, deletedMediaInfos);
    //Update MediaInfos
    await this.updateMediaInfosToFarm(farmId, updatedMediaInfos);
    //Add New MediaInfos
    await this.addNewMediaInfosToFarm(farmId, createdMediaInfos);
  }

  //Delete Farm Media
  async deleteMediaInfosFromFarm(
    farmId: number,
    deletedMediaInfos: CreateMediaDto[],
  ) {
    await deletedMediaInfos.reduce(
      async (promise, mediaInfo: CreateMediaDto) => {
        await promise;
        await mediaInfo?.mediaInfoFiles?.reduce(
          async (promise, media: FarmMediaFileDto) => {
            await promise;
            if (media?.mediauuid && media.isDeleted) {
              // Delete Mediafile
              await this.mediaService.markForDeletionByMediaUuid(
                media.mediauuid,
              );
            }
          },
          Promise.resolve(),
        );
        await this.farmMediaInfoService.delete(farmId, mediaInfo.mediaInfoId);
      },
      Promise.resolve(),
    );
  }

  //Update Farm Media
  async updateMediaInfosToFarm(
    farmId: number,
    updatedMediaInfos: CreateMediaDto[],
  ) {
    await updatedMediaInfos.reduce(
      async (promise, mediaInfo: CreateMediaDto) => {
        await promise;
        await mediaInfo?.mediaInfoFiles?.reduce(
          async (promise, media: FarmMediaFileDto) => {
            await promise;
            if (media?.mediauuid) {
              if (media.isDeleted) {
                // Delete Mediafile
                await this.mediaService.markForDeletionByMediaUuid(
                  media.mediauuid,
                );
              } else {
                // Add Media file
                let mediaRecord = await this.mediaService.create(
                  media.mediauuid,
                );
                await this.farmMediaFilesService.create(
                  mediaInfo.mediaInfoId,
                  mediaRecord.id,
                );
              }
            }
          },
          Promise.resolve(),
        );
        let updateDto = new UpdateMediaDto();
        updateDto.title = mediaInfo.title;
        updateDto.description = mediaInfo.description;
        await this.farmMediaInfoService.update(
          farmId,
          mediaInfo.mediaInfoId,
          updateDto,
        );
      },
      Promise.resolve(),
    );
  }

  //Add New Farm Media
  async addNewMediaInfosToFarm(
    farmId: number,
    createdMediaInfos: CreateMediaDto[],
  ) {
    await createdMediaInfos.reduce(
      async (promise, mediaInfo: CreateMediaDto) => {
        await promise;
        let createMediaDto = new CreateMediaDto();
        createMediaDto.title = mediaInfo.title;
        createMediaDto.description = mediaInfo.description;
        let mediaInfoRecord = await this.farmMediaInfoService.create(
          farmId,
          createMediaDto,
        );
        await mediaInfo?.mediaInfoFiles?.reduce(
          async (promise, media: FarmMediaFileDto) => {
            await promise;
            if (media?.mediauuid && !media.isDeleted) {
              // Add Media file
              let mediaRecord = await this.mediaService.create(media.mediauuid);
              await this.farmMediaFilesService.create(
                mediaInfoRecord.id,
                mediaRecord.id,
              );
            }
          },
          Promise.resolve(),
        );
      },
      Promise.resolve(),
    );
  }

  //Get Presigned Url for Farm media image upload
  async farmMediaFileUpload(farmUuid: string, fileInfo: FileUploadUrlDto) {
    const record = await this.getFarmByUuid(farmUuid);
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    //TODO: Validate allowed file format or not
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyVideosAndImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get('file.s3DirFarmMediaImage')}/${
      record.farmUuid
    }/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Get Farms by farmIds
  async getManyFarmsByUuids(farmList) {
    const farmsIds = this.getFarmsIds(farmList);
    if (!farmsIds.length) {
      return null;
    }
    return this.farmsRepository.find({ where: { farmUuid: In(farmsIds) } });
  }

  getFarmsIds(list) {
    let farmsIds = [];
    list.forEach((farm) => {
      farmsIds.push(farm.farmId);
    });
    return farmsIds;
  }

  //Get All Farm Members
  async getFarmMembers(farmId) {
    const record = await this.getFarmByUuid(farmId);
    let queryBuilder = getRepository(MemberFarm)
      .createQueryBuilder('memberfarm')
      .select(
        'member.memberuuid as memberId, member.fullName as memberName, member.email as email, memberfarm.isFamOwner as isFamOwner',
      )
      .addSelect('farmaccesslevel.roleId as roleId')
      .innerJoin('memberfarm.member', 'member')
      .leftJoin('memberfarm.farmaccesslevel', 'farmaccesslevel')
      .where('memberfarm.farmId = :farmId', { farmId: record.id });
    return await queryBuilder.getRawMany();
  }

  //Get Farm Dashboard Data
  async getFarmDashboardData(options: DashboardDto) {
    let result = await this.farmsRepository.manager.query(
      `EXEC procGetFarmDashboard_new @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = [];
    await result.map((record: any) => {
      let diffPercent = 0;
      if (record.PrevValue) {
        diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
      } else {
        diffPercent = Math.round(record.Diff / 0.01);
      }
      response.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return response;
  }

  //Get All Farm Stallions
  async getAllStallionsWithoutPaging(farmUuid: string) {
    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName as horseName')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .addSelect(
        'stallionservicefee.fee as studFee, stallionservicefee.currencyId as currencyId',
      )
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .innerJoin(
        'stallion.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .innerJoin('stallion.horse', 'horse', 'horse.isVerified=1')
      .leftJoin('stallion.stallionservicefee', 'stallionservicefee')
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin('stallionservicefee.currency', 'currency')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .andWhere('farm.farmUuid = :farmUuid', { farmUuid: farmUuid });
    queryBuilder.andWhere('stallion.isActive = :isActive', { isActive: true });
    queryBuilder.orderBy('horse.horseName', 'ASC');
    const keys = ['stallionId'];
    let entities = await queryBuilder.getRawMany();
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    return filtered;
  }

  //Get a Farm by Id
  async findById(id: number) {
    return await this.farmsRepository.findOne({ id });
  }

  //Get All Farms By farmIds
  async findByFarms(farmsListDto: FarmsListDto) {
    const locations = await this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'Distinct country.id as countryId, country.countryName as countryName, farm.farmUuid as farmId',
      )
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farmlocation.state', 'state')
      .andWhere('farm.farmUuid IN (:...farmUuids)', {
        farmUuids: farmsListDto.farms,
      })
      .getRawMany();

    const users = await this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'Distinct member.memberuuid as memberId, member.fullName as fullName, farm.farmUuid as farmId',
      )
      .innerJoin('farm.memberfarms', 'memberfarm')
      .leftJoin('memberfarm.member', 'member')
      .andWhere('farm.farmUuid IN (:...farmUuids)', {
        farmUuids: farmsListDto.farms,
      })
      .getRawMany();

    const stallions = await this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'Distinct stallion.stallionUuid as stallionId, farm.farmUuid as farmId, horse.horseName as stallionName ',
      )
      .innerJoin('farm.stallions', 'stallion')
      .innerJoin('stallion.horse', 'horse', 'horse.isVerified=1')
      .andWhere('farm.farmUuid IN (:...farmUuids)', {
        farmUuids: farmsListDto.farms,
      })
      .getRawMany();

    return { locations: locations, users: users, stallions: stallions };
  }

  //Get All Farms By Locations
  async findByLocations(locationsListDto: LocationsListDto) {
    const farms = await this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'Distinct farm.farmUuid as farmId, farm.farmName as farmName, country.id as countryId',
      )
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .andWhere('country.id IN (:...countryIds)', {
        countryIds: locationsListDto.locations,
      })
      .getRawMany();
    let farmIds = [];
    farms.forEach((item) => {
      farmIds.push(item.farmId);
    });
    const users = await this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'Distinct member.memberuuid as memberId, member.fullName as fullName, country.id as countryId',
      )
      .innerJoin('farm.memberfarms', 'memberfarm')
      .leftJoin('memberfarm.member', 'member')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .andWhere('farm.farmUuid IN (:...farmUuids)', { farmUuids: farmIds })
      .getRawMany();

    const stallions = await this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'Distinct stallion.stallionUuid as stallionId, horse.horseName as stallionName, country.id as countryId',
      )
      .innerJoin('farm.stallions', 'stallion')
      .innerJoin('stallion.horse', 'horse', 'horse.isVerified=1')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .andWhere('farm.farmUuid IN (:...farmUuids)', { farmUuids: farmIds })
      .getRawMany();

    return { farms: farms, users: users, stallions: stallions };
  }

  //Get Farm Dashboard Reports
  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case FARMDASHBOARDKPI.LARGEST_FARM:
        qbQuery = `EXEC procGetFarmDashboardLargestFarmDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.FARM_USER:
        qbQuery = `EXEC procGetFarmDashboardFarmusersDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.TOTAL_FARMS:
        qbQuery = `EXEC procGetFarmDashboardTotalFarmsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.FARM_PROMOTED:
        qbQuery = `EXEC procGetFarmDashboardFarmPromotedDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.NEW_FARM:
        qbQuery = `EXEC procGetFarmDashboardNewFarmDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.FARM_USER_GROWTH:
        qbQuery = `EXEC procGetFarmDashboardFarmuserGrowthDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.FARM_PROMOTED_LOCATION:
        qbQuery = `EXEC procGetFarmDashboardFarmpromotedlocationDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.MOST_VALUABLE_FARM:
        qbQuery = `EXEC procGetFarmDashboardMostvaluableFarmDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.TOP_REFERRER_FARM:
        qbQuery = `EXEC procGetFarmDashboardTopReferrerDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.FARM_VISITOR:
        qbQuery = `EXEC procGetFarmDashboardTotalVisitorsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.MOST_ENGAGED_FARM:
        qbQuery = `EXEC procGetFarmDashboardMostEngagedFarmDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case FARMDASHBOARDKPI.MOST_ACTIVE_FARM:
        qbQuery = `EXEC procGetFarmDashboardMostActiveFarmDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      default:
        qbQuery = `EXEC procGetFarmDashboardMostvaluableFarmDownload @paramDate1=@0, @paramDate2=@1`;
        break;
    }
    let result = await this.farmsRepository.manager.query(`${qbQuery}`, [
      options.fromDate,
      options.toDate,
    ]);
    if (result.length) {
      await result.reduce(async (promise, element) => {
        await promise;
        switch (options.kpiTitle) {
          case FARMDASHBOARDKPI.LARGEST_FARM:
          case FARMDASHBOARDKPI.MOST_ACTIVE_FARM:
          case FARMDASHBOARDKPI.MOST_ENGAGED_FARM:
          case FARMDASHBOARDKPI.MOST_VALUABLE_FARM:
          case FARMDASHBOARDKPI.TOTAL_FARMS:
            // element.FarmName = await this.commonUtilsService.toTitleCase(
            //   element.FarmName,
            // );
            break;
          case FARMDASHBOARDKPI.NEW_FARM:
            // element.farmName = await this.commonUtilsService.toTitleCase(
            //   element.farmName,
            // );
            break;
          case FARMDASHBOARDKPI.FARM_USER:
          case FARMDASHBOARDKPI.FARM_USER_GROWTH:
            // element.MemberName = await this.commonUtilsService.toTitleCase(
            //   element.MemberName,
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

  //Download Farm List
  async downloadList(searchOptionsDto: SearchOptionsDownloadDto) {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    let scntQuery = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id, count(stallion.id) totalStallions')
      .innerJoin('farm.stallions', 'stallion')
      .groupBy('farm.id');

    let ucntQuery = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id, count(memberfarm.memberId) users')
      .innerJoin('farm.memberfarms', 'memberfarm')
      .groupBy('farm.id');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let spQuery = getRepository(StallionPromotion)
      .createQueryBuilder('sp')
      .select(
        'DISTINCT sp.stallionId stallionId, sp.startDate startDate, sp.endDate endDate, CASE WHEN ((getutcdate() BETWEEN sp.startDate AND sp.endDate) AND (op.promotionId IS NOT NULL OR sp.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted,  CASE WHEN getutcdate() >  sp.endDate THEN 1 ELSE 0 END AS expired',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=sp.id',
      );

    let spcntQuery = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.farmId, count(stallion.id) promoted')
      .innerJoin(
        '(' + spQuery.getQuery() + ')',
        'pro',
        'pro.stallionId=stallion.id AND pro.isPromoted=1',
      )
      .groupBy('stallion.farmId');

    let fPromotionQueryBuilder = getRepository(Stallion)
      .createQueryBuilder('t1')
      .select(
        't1.farmId, CAST(1 as bit) as isPromoted, count(*) as promotedStallions',
      )
      .innerJoin(
        '(' + spQuery.getQuery() + ')',
        't2',
        't2.stallionId=t1.id AND t2.isPromoted=1',
      )
      .groupBy('t1.farmId');

    let EPromotionQueryBuilder = getRepository(Stallion)
      .createQueryBuilder('exp')
      .select('exp.farmId, 1 as expired, count(*) as expiredFarms')
      .innerJoin(
        '(' + spQuery.getQuery() + ')',
        't3',
        't3.stallionId=exp.id AND t3.expired=1',
      )
      .groupBy('exp.farmId');

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'MAX(studFee.id) as studFeeId, studFee.stallionId as feeStallionId',
      )
      .groupBy('studFee.stallionId');

    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'farm.farmUuid as farmId, farm.farmName as farmName, farm.isActive, farm.isVerified, promotion.isPromoted,expromotion.expired, farm.createdBy, farm.createdOn, farm.modifiedBy, farm.modifiedOn',
      )
      .addSelect('country.countryName as countryName')
      .addSelect('state.stateName as stateName')
      .addSelect('scnt.totalStallions, ucnt.users, spcnt.promoted')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('stallionservicefee.fee as fee')
      .addSelect('stallionservicefee.feeYear as feeYear')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farm.stallions', 'stallion')
      .leftJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .leftJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .leftJoin('stallionservicefee.currency', 'currency')
      .leftJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .leftJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )

      .leftJoin('farmlocation.state', 'state')
      .leftJoin('(' + scntQuery.getQuery() + ')', 'scnt', 'scnt.id=farm.id')
      .leftJoin('(' + ucntQuery.getQuery() + ')', 'ucnt', 'ucnt.id=farm.id')
      .leftJoin(
        '(' + spcntQuery.getQuery() + ')',
        'spcnt',
        'spcnt.farmId=farm.id',
      )
      .leftJoin(
        '(' + fPromotionQueryBuilder.getQuery() + ')',
        'promotion',
        'promotion.farmId=farm.id',
      )
      .leftJoin(
        '(' + EPromotionQueryBuilder.getQuery() + ')',
        'expromotion',
        'expromotion.farmId=farm.id',
      );

    if (searchOptionsDto.farmName) {
      if (searchOptionsDto.isFarmNameExactSearch) {
        queryBuilder.andWhere('farm.farmName =:farmName', {
          farmName: searchOptionsDto.farmName,
        });
      } else {
        queryBuilder.andWhere('farm.farmName like :farmName', {
          farmName: '%' + searchOptionsDto.farmName + '%',
        });
      }
    }
    if (searchOptionsDto.farmId) {
      queryBuilder.andWhere('farm.farmUuid = :farmId', {
        farmId: searchOptionsDto.farmId,
      });
    }
    if (searchOptionsDto.country) {
      queryBuilder.andWhere('farmlocation.countryId = :countryId', {
        countryId: searchOptionsDto.country,
      });
    }
    if (searchOptionsDto.Status && searchOptionsDto.Status != 'All') {
      let isActive = searchOptionsDto.Status == 'Active' ? true : false;
      queryBuilder.andWhere('farm.isActive = :isActive', {
        isActive: isActive,
      });
    }
    if (
      searchOptionsDto.PromotedStatus &&
      searchOptionsDto.PromotedStatus != 'All'
    ) {
      let isPromoted = searchOptionsDto.PromotedStatus == 'Promoted' ? 1 : 0;
      if (isPromoted) {
        queryBuilder.andWhere('promotion.isPromoted = :isPromoted', {
          isPromoted: isPromoted,
        });
      } else {
        queryBuilder.andWhere('promotion.isPromoted IS NULL');
      }
    }
    if (
      searchOptionsDto.expiredStallion &&
      searchOptionsDto.expiredStallion != 'All'
    ) {
      let expired = searchOptionsDto.expiredStallion == 'Yes' ? 1 : 0;
      if (expired) {
        queryBuilder.andWhere('expromotion.expired = :expired', {
          expired: expired,
        });
      } else {
        queryBuilder.andWhere('expromotion.expired IS NULL');
      }
    }
    if (searchOptionsDto.RequiresVerification == true) {
      queryBuilder.andWhere('farm.isVerified = :isVerified', {
        isVerified: searchOptionsDto.RequiresVerification,
      });
    }
    if (searchOptionsDto.RequiresVerification == false) {
      queryBuilder.andWhere('farm.isVerified = :isVerified', {
        isVerified: searchOptionsDto.RequiresVerification,
      });
    }
    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      const byOrder = searchOptionsDto.order;
      if (sortBy.toLowerCase() === 'farmname') {
        queryBuilder.orderBy('farm.farmName', byOrder);
      }
      if (sortBy.toLowerCase() === 'countryid') {
        queryBuilder.orderBy('farmlocation.countryId ', byOrder);
      }
      if (sortBy.toLowerCase() === 'isactive') {
        queryBuilder.orderBy('farm.isActive', byOrder);
      }
      if (sortBy.toLowerCase() === 'isverified') {
        queryBuilder.orderBy('farm.isVerified', byOrder);
      }
      if (sortBy.toLowerCase() === 'ispromoted') {
        queryBuilder.orderBy('farm.isPromoted', byOrder);
      }
      if (sortBy.toLowerCase() === 'countryname') {
        queryBuilder.orderBy('country.countryName', byOrder);
      }
      if (sortBy.toLowerCase() === 'statename') {
        queryBuilder.orderBy('state.stateName', byOrder);
      }
      if (sortBy.toLowerCase() === 'createdby') {
        queryBuilder.orderBy('farm.createdBy', byOrder);
      }
      if (sortBy.toLowerCase() === 'createdon') {
        queryBuilder.orderBy('farm.createdOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'modifiedby') {
        queryBuilder.orderBy('farm.modifiedBy', byOrder);
      }
      if (sortBy.toLowerCase() === 'modifiedon') {
        queryBuilder.orderBy('farm.modifiedOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'totalstallions') {
        queryBuilder.orderBy('scnt.totalStallions', byOrder);
      }
      if (sortBy.toLowerCase() === 'users') {
        queryBuilder.orderBy('ucnt.users', byOrder);
      }
      if (sortBy.toLowerCase() === 'promoted') {
        queryBuilder.orderBy('spcnt.promoted', byOrder);
      }
    } else {
      queryBuilder.orderBy('farm.farmName', searchOptionsDto.order);
    }

    const entities = await queryBuilder.getRawMany();
    const keys = ['farmId'];
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    const itemCount = filtered.length;
    return filtered;
  }

  //Get All Farms Along with Searched By Users
  async getAllFarmsSearchedByUsers(farmName) {
    let queryBuilder = await getRepository(FarmAuditEntity)
      .createQueryBuilder('farmaudit')
      .select(
        'DISTINCT farmaudit.entityId as farmId, farm.farmName as farmName',
      )
      .innerJoin('farmaudit.farm', 'farm')
      .andWhere('farm.farmName like :farmName', {
        farmName: '%' + farmName + '%',
      })
      .addGroupBy('farmaudit.entityId, farm.farmName')
      .getRawMany();

    return queryBuilder;
  }

  //Get Dashborad Visitor Data
  async getDashboradVisitorData(options: DashboardDto) {
    let result = await this.farmsRepository.manager.query(
      `EXEC procGetCurrentAndPrevDates @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = {
      CurrentValue: 0,
      PrevValue: 0,
      Diff: 0,
      diffPercent: 0,
    };
    response.CurrentValue = await this.gaService.getFarmPageVisitors(
      result[0].currFromDate,
      result[0].currToDate,
    );
    response.PrevValue = await this.gaService.getFarmPageVisitors(
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

  //Get Dashborad Visitor Report
  async getDashboradVisitorReport(options: DashboardReportDto) {
    let result = await this.farmsRepository.manager.query(
      `EXEC procGetCurrentAndPrevDates @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = {
      CurrentValue: 0,
      PrevValue: 0,
      Diff: 0,
      diffPercent: 0,
    };
    response.CurrentValue = await this.gaService.getFarmPageVisitors(
      result[0].currFromDate,
      result[0].currToDate,
    );
    response.PrevValue = await this.gaService.getFarmPageVisitors(
      result[0].prevFromDate,
      result[0].prevToDate,
    );
    response.Diff = response.CurrentValue - response.PrevValue;
    let newResult = [];
    newResult.push({
      SNo: 1,
      CurrentVisitorCount: response.CurrentValue,
      PreviousVisitorCount: response.PrevValue,
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

  //Get World Reach Farms
  async getWorldReachFarms(options: DashboardDto) {
    let result = await this.farmsRepository.manager.query(
      `EXEC procGetFarmDashboardWorlReachFarms @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    for (let item of result) {
      const country = await getRepository(Country)
        .createQueryBuilder('country')
        .select('country.longitude, country.latitude')
        .andWhere('country.id =:countryId', { countryId: item.countryId })
        .getRawOne();
      item.longitude = country.longitude;
      item.latitude = country.latitude;
      item.location = [item.latitude, item.longitude];
      item.nonPromotedCount =
        parseInt(item.farmsCount) -
        parseInt(item.promotedCount ? item.promotedCount : 0);
    }
    return result;
  }

  //Get a farm by id
  async findFarmUuid(farmId) {
    const record = await this.farmsRepository.findOne({
      id: farmId,
    });
    if (!record) {
      throw new UnprocessableEntityException('Farm not exist!');
    }
    return record;
  }

  /* Get All Farms Locations */
  async getAllFarmsLocations() {
    let data = await this.farmsRepository.manager.query(
      `EXEC proc_SMPGetAllFarmsCountries`,
    );
    return data;
  }
}
