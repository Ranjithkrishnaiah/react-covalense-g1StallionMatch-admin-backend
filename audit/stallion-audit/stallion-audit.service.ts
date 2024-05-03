import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { FarmsService } from 'src/farms/farms.service';
import { Repository } from 'typeorm';
import { StallionAuditEntity } from './stallion-audit.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';

@Injectable()
export class StallionAuditService {
  constructor(
    @InjectRepository(StallionAuditEntity)
    private stallionAuditRepository: Repository<StallionAuditEntity>,
    private eventEmitter: EventEmitter2,
    private farmService: FarmsService,
  ) {}

  //Create Stallion
  @OnEvent('createStallion')
  async listenToCreateStallionEvent(data: any) {
    let farm = await this.farmService.findById(data.farmId);
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: '',
      entityId: data.stallionUuid,
    };
    let stallion = await this.stallionAuditRepository.save(
      this.stallionAuditRepository.create(createFarmRequestBody),
    );

    let createStallionBody = {
      activityType: ACTIVITY_TYPE.UPDATE,
      newValue: stallion['newValue'],
      oldValue: stallion['oldValue'],
      key: stallion['entityId'],
      farmUuid: farm.farmUuid,
    };
    this.eventEmitter.emit('updateAuditFarm', createStallionBody);
  }

  //Update Stallion
  @OnEvent('updateStallion')
  listenToUpdateHorseEvent(data: any) {
    let createUpdateHorseRequestBody = {
      activityType: ACTIVITY_TYPE.UPDATE,
      createdBy: data.createdBy,
      newValue: data.newValue,
      oldValue: data.oldValue,
      attributeName: data.key,
      entityId: data.stallionUuid,
    };

    let user = this.stallionAuditRepository.save(
      this.stallionAuditRepository.create(createUpdateHorseRequestBody),
    );
  }
}
