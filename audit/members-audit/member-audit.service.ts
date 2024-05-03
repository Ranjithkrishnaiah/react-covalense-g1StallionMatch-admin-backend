import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/members/entities/member.entity';
import { Repository } from 'typeorm';
import { MemberAuditEntity } from './member-audit.entity';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';

@Injectable()
export class MemberAuditService {
  member: Member;
  constructor(
    @InjectRepository(MemberAuditEntity)
    private memberAuidtRepo: Repository<MemberAuditEntity>,
  ) {
    this.member;
  }

  //Create Member
  @OnEvent('createMember')
  listenToCreatHorseEvent(data: any) {
    let createHorseRequestBody = {
      activityType: ACTIVITY_TYPE.CREATE,
      newValue: JSON.stringify(data),
      oldValue: null,
      attributeName: '',
      entityId: data.memberuuid,
    };
    let user = this.memberAuidtRepo.save(
      this.memberAuidtRepo.create(createHorseRequestBody),
    );
  }
}
