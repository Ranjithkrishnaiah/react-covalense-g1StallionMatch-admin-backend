import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { FarmAuditEntity } from './farm-audit.entity';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';
const UserAgent = require('user-agents');

@Injectable()
export class FarmAuditService {
  constructor(
    @InjectRepository(FarmAuditEntity)
    private farmAuditRepository: Repository<FarmAuditEntity>,
  ) {}
  userAgent = new UserAgent();

  //Create Farm
  @OnEvent('createFarm')
  listenToCreateFarmEvent(data: any) {
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'createFarm',
      entityId: data.farmUuid,
      userAgent: this.userAgent.data.userAgent,
    };
    let user = this.farmAuditRepository.save(
      this.farmAuditRepository.create(createFarmRequestBody),
    );
  }

  // Update farm
  @OnEvent('updateAuditFarm')
  listenToUpdateEvent(data: any) {
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.UPDATE,
      newValue: data.newValue,
      oldValue: data.oldValue,
      attributeName: data.key,
      entityId: data.farmUuid,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.farmAuditRepository.save(
      this.farmAuditRepository.create(createFarmRequestBody),
    );
  }
}
