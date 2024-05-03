import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEntity } from './audit.entity';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';
const UserAgent = require('user-agents');

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEntity)
    private auditRepository: Repository<AuditEntity>,
  ) {}

  userAgent = new UserAgent();

  // createRace
  @OnEvent('createRace')
  listenToCreatHorseEvent(data: any) {
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'createRace',
      entityId: data.raceUuid,
      entity: data.id,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(createFarmRequestBody),
    );
  }

  // updateRaceDetails
  @OnEvent('updateRaceDetails')
  async listenToUpdateEvent(data: any) {
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.UPDATE,
      newValue: data.newValue,
      oldValue: data.oldValue,
      attributeName: data.key,
      entityId: data.raceUuid,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(createFarmRequestBody),
    );
  }

  //marketingInfoTestimonial
  @OnEvent('marketingInfoTestimonial')
  listenToCreatMarketingInfoTestimonialEvent(data: any) {
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: 'createMarketingInfoTestimonial',
      entityId: data.marketingPageAdditionInfoUuid,
      entity: data.id,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(createFarmRequestBody),
    );
  }

  //updateMarketingTestimonialAdditionalInfo
  @OnEvent('updateMarketingTestimonialAdditionalInfo')
  async listenToUpdateMarketingTestimonialInfoEvent(data: any) {
    let createFarmRequestBody = {
      activityType: ACTIVITY_TYPE.UPDATE,
      newValue: data.newValue,
      oldValue: data.oldValue,
      attributeName: data.key,
      entityId: data.marketingPageAdditionInfoUuid,
      userAgent: this.userAgent.data.userAgent,
      createdBy: data?.createdBy,
    };
    let user = this.auditRepository.save(
      this.auditRepository.create(createFarmRequestBody),
    );
  }
}
