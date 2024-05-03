import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { MemberStatus } from './entities/member-status.entity';

@Injectable()
export class MemberStatusService {
  constructor(
    @InjectRepository(MemberStatus)
    private memberStatusRepository: Repository<MemberStatus>,
  ) {}

  //Get all records
  async findAll() {
    const status = await getRepository(MemberStatus)
      .createQueryBuilder('status')
      .select('status.id ,status.statusName')
      .andWhere('status.id != :id', { id: 3 })
      .getRawMany();
    return status;
  }
}
