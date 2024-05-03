import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from './entities/notification-type.entity';
import { NotificationTypesResponse } from './dto/notification-types-response';

@Injectable()
export class NotificationTypeService {
  constructor(
    @InjectRepository(NotificationType)
    private notificationTypeRepository: Repository<NotificationType>,
  ) {}

  //to get notifications list
  findAll() {
    return this.notificationTypeRepository.find();
  }

  /* Get notification types by code */
  findByNotificationCode(notificationTypeCode:string): Promise<NotificationTypesResponse> {
    return this.notificationTypeRepository.findOne({notificationTypeCode});
  }
}
