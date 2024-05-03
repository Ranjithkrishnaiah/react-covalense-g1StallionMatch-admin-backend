import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Notifications } from './entities/notifications.entity';
import {
  DeleteResult,
  getRepository,
  Repository,
  UpdateResult,
} from 'typeorm';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { NotificationRequestDto } from './dto/notification-request.dto';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { notificationTemplates, notificationTypeList } from 'src/utils/constants/notifications';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { PreferedNotificationService } from 'src/prefered-notification/prefered-notifications.service';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Notifications)
    private notificationsRepository: Repository<Notifications>,
    private messageTemplatesService: MessageTemplatesService,
    private preferedNotificationService: PreferedNotificationService,
  ) {}

  //to test new notification 
  async create(createNotificationRequest: CreateNotificationDto) {
    const response = await this.notificationsRepository.save(
      this.notificationsRepository.create(createNotificationRequest),
    );
    return response;
  }

  //to create notification based on conditions
  async requestNotification(notificationRequestDto: NotificationRequestDto) {
    const member = this.request.user;
    if (notificationRequestDto.notificationType == 7) {
      const queryBuilder = await getRepository(MemberFarm)
        .createQueryBuilder('memberfarm')
        .select('memberfarm.memberId as id')
        .andWhere('memberfarm.isFamOwner = :isValue', { isValue: 1 })
        .getRawMany();

      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(notificationTemplates.boostNotification);
      
      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationTypeList.SYSTEM_NOTIFICATIONS
        );

      queryBuilder.forEach(async (item) => {
        await this.create({
          createdBy: member['id'],
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: item.id,
          messageTitle: 'Boost Notification',
          messageText: notificationRequestDto.messageText,
          isRead: false,
          notificationType: preferedNotification?.notificationTypeId,
        });
      });
      return 'success';
    } else {
      return 'Failed to send notification';
    }
  }

  //to get all notifications by loggedin list
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<NotificationResponseDto[]>> {
    const member = this.request.user;

    const queryBuilder = getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select(
        'notifications.notificationUuid as notificationId, notifications.notificationShortUrl, notifications.messageTemplateId, notifications.messageTitle, notifications.messageText, notifications.isRead, notifications.createdOn as timeStamp, notifications.actionUrl as linkAction',
      )
      .addSelect(
        'messagetemplate.linkName as linkName, messagetemplate.copyLinkAdmin as copyLinkAdmin',
      )
      .addSelect('feature.id as featureId, feature.featureName as featureName')
      .addSelect('messagetype.id as messageTypeId, messagetype.messageTypeName')
      .addSelect('sender.id as senderId, sender.fullName as senderName')
      .addSelect('role.roleName as roleName')
      .leftJoin('notifications.messagetemplate', 'messagetemplate')
      .leftJoin('messagetemplate.feature', 'feature')
      .leftJoin('messagetemplate.messagetype', 'messagetype')
      .leftJoin('notifications.sender', 'sender')
      .leftJoin('sender.roles', 'role')
      .andWhere('notifications.recipientId = :recipientId', {
        recipientId: member['id'],
      });

    if (searchOptionsDto.countryId) {
      queryBuilder.innerJoin(
        'sender.memberaddresses',
        'address',
        "address.countryId ='" + searchOptionsDto.countryId + "'",
      );
    }

    if (searchOptionsDto.name) {
      if (searchOptionsDto.isNameExactSearch) {
        queryBuilder.andWhere('sender.fullName =:name', {
          name: searchOptionsDto.name,
        });
      } else {
        queryBuilder.andWhere('sender.fullName like :name', {
          name: `%${searchOptionsDto.name}%`,
        });
      }
    }

    if (searchOptionsDto.messageKey) {
      const messageKeys = searchOptionsDto.messageKey.split(',');
      messageKeys.forEach((name, index) => {
        if (name.trim() != '') {
          const parameters = {
            ['name_' + index]: '%' + name.trim() + '%',
          };
          !index
            ? queryBuilder.andWhere(
                `notifications.messageText LIKE :name_${index}`,
                parameters,
              )
            : queryBuilder.orWhere(
                `notifications.messageText LIKE :name_${index}`,
                parameters,
              );
        }
      });
    }

    if (searchOptionsDto.email) {
      if (searchOptionsDto.isEmailAddressExactSearch) {
        queryBuilder.andWhere('sender.email  =:email', {
          email: searchOptionsDto.email,
        });
      } else {
        queryBuilder.andWhere('sender.email  like :email', {
          email: '%' + searchOptionsDto.email + '%',
        });
      }
    }

    if (searchOptionsDto.sentDate) {
      let priceList = searchOptionsDto.sentDate.split('/');
      let toDate = await this.addHours(23.59, new Date(priceList[1]));
      queryBuilder
        .andWhere('notifications.createdOn >= :fromDate', {
          fromDate: new Date(priceList[0]),
        })
        .andWhere('notifications.createdOn <= :toDate', { toDate: toDate });
    }

    if (searchOptionsDto.title) {
      queryBuilder.andWhere('notifications.messageTitle like :title', {
        title: `%${searchOptionsDto.title}%`,
      });
    }

    if (searchOptionsDto.linkType) {
      queryBuilder.andWhere('messagetemplate.linkName like :linkType', {
        linkType: `%${searchOptionsDto.linkType}%`,
      });
    }

    if (searchOptionsDto.status) {
      const status = searchOptionsDto.status == 'Read' ? true : false;
      queryBuilder.andWhere('notifications.isRead  =:status', {
        status: status,
      });
    }

    queryBuilder.orderBy('notifications.createdOn', 'DESC');
    
    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      const byOrder = searchOptionsDto.order;
      if (sortBy.toLowerCase() === 'notificationtitle') {
        queryBuilder.orderBy('notifications.messageTitle', byOrder);
      }
      if (sortBy.toLowerCase() === 'messagetext') {
        queryBuilder.orderBy('notifications.messageText', byOrder);
      }
      if (sortBy.toLowerCase() === 'readnotification') {
        queryBuilder.orderBy('notifications.isRead', byOrder);
      }
      if (sortBy.toLowerCase() === 'linkname') {
        queryBuilder.orderBy('messagetemplate.linkName', byOrder);
      }
      if (sortBy.toLowerCase() === 'datecreated') {
        queryBuilder.orderBy('notifications.createdOn', byOrder);
      }
    
    }

    if (searchOptionsDto.skip) {
      queryBuilder.offset(searchOptionsDto.skip);
    }

    if (searchOptionsDto.limit) {
      queryBuilder.limit(searchOptionsDto.limit);
    }

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  //to apply hard removal of notification by id
  async deleteNotification(notificationId: string) {
    await this.findOneByUuid(notificationId);
    const updateResult: DeleteResult =
      await this.notificationsRepository.delete({
        notificationUuid: notificationId,
      });

    if (updateResult.affected > 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Notification Deleted successfully',
      };
    }
  }

  //to add hours to the given date
  async addHours(numOfHours, date = new Date()) {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

    return date;
  }

  //to update ntification details
  async updateNotification(
    notificationId: string,
    updateNotificationDto: UpdateNotificationDto,
  ) {
    const member = this.request.user;
    updateNotificationDto.modifiedBy = member['id'];
    const updateResult: UpdateResult =
      await this.notificationsRepository.update(
        { notificationUuid: notificationId },
        updateNotificationDto,
      );

    if (updateResult.affected > 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Notification Updated successfully',
      };
    }
    
  }

  //to get single notification details by id
  async findOneById(notificationId: string) {
    const queryBuilder = getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select(
        'notifications.notificationUuid as notificationId, notifications.notificationShortUrl, notifications.messageTemplateId, notifications.messageTitle, notifications.messageText, notifications.isRead, notifications.createdOn as timeStamp',
      )
      .addSelect(
        'messagetemplate.linkName as linkName, messagetemplate.linkAction as linkAction',
      )
      .addSelect('feature.id as featureId, feature.featureName as featureName')
      .addSelect('messagetype.id as messageTypeId, messagetype.messageTypeName')
      .addSelect('sender.id as senderId, sender.fullName as senderName')
      .addSelect('role.roleName as roleName')
      .leftJoin('notifications.messagetemplate', 'messagetemplate')
      .leftJoin('messagetemplate.feature', 'feature')
      .leftJoin('messagetemplate.messagetype', 'messagetype')
      .leftJoin('notifications.sender', 'sender')
      .leftJoin('sender.roles', 'role')
      .andWhere('notifications.notificationUuid = :notificationUuid', {
        notificationUuid: notificationId,
      });

    return await queryBuilder.getRawOne();
  }

  //to get notification details by its uuid
  async findOneByUuid(notificationId: string) {
    const entity = await this.notificationsRepository.findOne({
      notificationUuid: notificationId,
    });
    if (!entity) {
      throw new NotFoundException('Not exist!');
    }
    return entity;
  }

  //to get distinct message titles
  async findTitles() {
    const queryBuilder = getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select('DISTINCT ("messageTitle") as title')
      .andWhere('messageTitle IS NOT NULL');
    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  //to get uniue link trypes in notifications list
  async findLinkTypes() {
    const queryBuilder = getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select('DISTINCT messagetemplate.linkName as linkType')
      .leftJoin('notifications.messagetemplate', 'messagetemplate')
      .andWhere('messagetemplate.linkName IS NOT NULL');
    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  // to get notifications count of loggedin member
  async getMsgCount() {
    const member = this.request.user;
    const unreadCount = await getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select('notifications.notificationUuid as notificationId')
      .andWhere('notifications.recipientId = :recipientId', {
        recipientId: member['id'],
      })
      .getCount();

    return { unreadCount: unreadCount };
  }

  //to download notifications list
  async getDownloadData(searchOptionsDto: SearchOptionsDto) {
    const member = this.request.user;

    const queryBuilder = getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select(
        'notifications.createdOn as Date, notifications.messageTitle as Title, notifications.messageText as Message, notifications.isRead as ReadStatus',
      )
      .leftJoin('notifications.messagetemplate', 'messagetemplate')
      .leftJoin('messagetemplate.feature', 'feature')
      .leftJoin('messagetemplate.messagetype', 'messagetype')
      .leftJoin('notifications.sender', 'sender')
      .leftJoin('sender.roles', 'role')
      .andWhere('notifications.recipientId = :recipientId', {
        recipientId: member['id'],
      });

    if (searchOptionsDto.countryId) {
      queryBuilder.innerJoin(
        'sender.memberaddresses',
        'address',
        "address.countryId ='" + searchOptionsDto.countryId + "'",
      );
    }

    if (searchOptionsDto.name) {
      if (searchOptionsDto.isNameExactSearch) {
        queryBuilder.andWhere('sender.fullName =:name', {
          name: searchOptionsDto.name,
        });
      } else {
        queryBuilder.andWhere('sender.fullName like :name', {
          name: `%${searchOptionsDto.name}%`,
        });
      }
    }

    if (searchOptionsDto.messageKey) {
      const messageKeys = searchOptionsDto.messageKey.split(',');
      messageKeys.forEach((name, index) => {
        if (name.trim() != '') {
          const parameters = {
            ['name_' + index]: '%' + name.trim() + '%',
          };
          !index
            ? queryBuilder.andWhere(
                `notifications.messageText LIKE :name_${index}`,
                parameters,
              )
            : queryBuilder.orWhere(
                `notifications.messageText LIKE :name_${index}`,
                parameters,
              );
        }
      });
    }

    if (searchOptionsDto.email) {
      if (searchOptionsDto.isEmailAddressExactSearch) {
        queryBuilder.andWhere('sender.email  =:email', {
          email: searchOptionsDto.email,
        });
      } else {
        queryBuilder.andWhere('sender.email  like :email', {
          email: '%' + searchOptionsDto.email + '%',
        });
      }
    }

    if (searchOptionsDto.sentDate) {
      let priceList = searchOptionsDto.sentDate.split('/');
      let toDate = await this.addHours(23.59, new Date(priceList[1]));
      queryBuilder
        .andWhere('notifications.createdOn >= :fromDate', {
          fromDate: new Date(priceList[0]),
        })
        .andWhere('notifications.createdOn <= :toDate', { toDate: toDate });
    }

    if (searchOptionsDto.title) {
      queryBuilder.andWhere('notifications.messageTitle like :title', {
        title: `%${searchOptionsDto.title}%`,
      });
    }

    if (searchOptionsDto.linkType) {
      queryBuilder.andWhere('messagetemplate.linkName like :linkType', {
        linkType: `%${searchOptionsDto.linkType}%`,
      });
    }

    if (searchOptionsDto.status) {
      const status = searchOptionsDto.status == 'Read' ? true : false;
      queryBuilder.andWhere('notifications.isRead  =:status', {
        status: status,
      });
    }

    if (searchOptionsDto.order) {
      queryBuilder.orderBy('notifications.createdOn', searchOptionsDto.order);
    }

    if (searchOptionsDto.skip) {
      queryBuilder.offset(searchOptionsDto.skip);
    }

    if (searchOptionsDto.limit) {
      queryBuilder.limit(searchOptionsDto.limit);
    }

    const entities = await queryBuilder.getRawMany();
    return entities;
  }
}
