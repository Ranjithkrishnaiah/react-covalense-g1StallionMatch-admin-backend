import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HorseAuditEntity } from '../horse-audit/horse-audit.entity';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';

@Injectable()
export class HorseAuditService {
  constructor(
    @InjectRepository(HorseAuditEntity)
    private horseAuditRepository: Repository<HorseAuditEntity>,
  ) {}

  // //Create Horse
  @OnEvent('createHorse')
  listenToCreatHorseEvent(data: any) {
    let createHorseRequestBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: '',
      entityId: data.horseUuid,
    };
    let user = this.horseAuditRepository.save(
      this.horseAuditRepository.create(createHorseRequestBody),
    );
  }

  //Update Horse
  @OnEvent('updateHorse')
  listenToUpdateHorseEvent(data: any) {
    let createUpdateHorseRequestBody = {
      activityType: ACTIVITY_TYPE.UPDATE,
      createdBy: data.createdBy,
      newValue: data.newValue,
      oldValue: data.oldValue,
      attributeName: data.key,
      entityId: data.horseUuid,
    };

    let user = this.horseAuditRepository.save(
      this.horseAuditRepository.create(createUpdateHorseRequestBody),
    );
  }
}
