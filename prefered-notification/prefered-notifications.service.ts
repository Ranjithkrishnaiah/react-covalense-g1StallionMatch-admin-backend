import {
  Inject,
  Injectable,
  Scope
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { NotificationType } from 'src/notification-types/entities/notification-type.entity';
import { Repository, getRepository } from 'typeorm';
import { CreatePreferedNotificationDto } from './dto/create-prefered-notification.dto';
import { PreferedNotificationResponseDto } from './dto/prefered-notification-response.dto';
import { UpdatePreferedNotificationDto } from './dto/update-prefered-notification.dto';
import { PreferedNotification } from './entities/prefered-notification.entity';

@Injectable({ scope: Scope.REQUEST })
export class PreferedNotificationService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(PreferedNotification)
    private preferedNotificationRepository: Repository<PreferedNotification>,
  ) { }

  async create(createPreferedNotificationDto: CreatePreferedNotificationDto) {
    const member = this.request.user;
    createPreferedNotificationDto.createdBy = member['id'];
    if (!createPreferedNotificationDto.memberId) {
      createPreferedNotificationDto.memberId = member['id'];
    }
    const response = await this.preferedNotificationRepository.save(
      this.preferedNotificationRepository.create(createPreferedNotificationDto),
    );
    return response;
  }
  /* Get All Prefered Notifications */
  async getAll(): Promise<PreferedNotificationResponseDto[]> {
    const member = this.request.user;
    let queryBuilder = this.preferedNotificationRepository
      .createQueryBuilder('preferednotification')
      .select(
        'preferednotification.notificationTypeId as notificationTypeId, preferednotification.isActive as isActive',
      )
      .addSelect(
        'notificationtype.notificationTypeName as notificationTypeName',
      )
      .innerJoin('preferednotification.notificationtype', 'notificationtype')
      .andWhere('preferednotification.memberId = :memberId', {
        memberId: member['id'],
      })
      .orderBy('preferednotification.createdOn', 'ASC');

    const entities = await queryBuilder.getRawMany();

    return entities;
  }
  /* Update Prefered Notifications */
  update(id: number, updateDto: UpdatePreferedNotificationDto) {
    return this.preferedNotificationRepository.update({ id: id }, updateDto);
  }
  /* Get Prefered Notifications By Member */
  async getPreferedNotificationByMemberId(memberId: number) {
    let queryBuilder = this.preferedNotificationRepository
      .createQueryBuilder('preferednotification')
      .select(
        'preferednotification.id, preferednotification.notificationTypeId as notificationTypeId, preferednotification.isActive as isActive',
      )
      .addSelect(
        'notificationtype.notificationTypeName as notificationTypeName',
      )
      .innerJoin('preferednotification.notificationtype', 'notificationtype')
      .andWhere('preferednotification.memberId = :memberId', {
        memberId: memberId,
      })
      .orderBy('preferednotification.createdOn', 'ASC');

    const entities = await queryBuilder.getRawMany();

    return entities;
  }
  /* Get Prefered Notifications For  Recipient */
  async getPreferredNotification(
    notificationTypeId: number,
    recipientId: number,
  ) {
    let queryBuilder = getRepository(NotificationType)
      .createQueryBuilder('nt')
      .select('nt.id as notificationTypeId')
      .addSelect('preferednotification.isActive as isActive')
      .leftJoin('nt.preferednotification', 'preferednotification')
      .leftJoin('preferednotification.member', 'member')
      .andWhere('nt.id = :notificationTypeId AND member.id = :recipientId', {
        notificationTypeId: notificationTypeId,
        recipientId: recipientId,
      })
      .orderBy('nt.id');

    const preferedNotification = await queryBuilder.getRawOne();
    return preferedNotification;
  }

  // To get preferred Notification setted by Member in member profile.
  async getPreferredNotificationByNotificationTypeCode(
    notificationTypeCode: string,
    recipientId: number = null,
  ) {
    let queryBuilder = getRepository(NotificationType)
      .createQueryBuilder('nt')
      .select('nt.id as notificationTypeId');

    if (recipientId) {
      queryBuilder
        .addSelect('preferednotification.isActive as isActive')
        .leftJoin('nt.preferednotification', 'preferednotification')
        .leftJoin('preferednotification.member', 'member')
        .andWhere('member.id = :recipientId', { recipientId: recipientId });
    }

    queryBuilder
      .andWhere('nt.notificationTypeCode = :notificationTypeCode', {
        notificationTypeCode: notificationTypeCode,
      })
      .orderBy('nt.id');

    const preferedNotification = await queryBuilder.getRawOne();
    return preferedNotification;
  }
}
