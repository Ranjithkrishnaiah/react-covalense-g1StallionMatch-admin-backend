import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MemberFarm } from './entities/member-farm.entity';
import { CreateFarmMemberDto } from './dto/create-farm-member.dto';
import { Member } from 'src/members/entities/member.entity';
import { FarmsService } from 'src/farms/farms.service';
import { MemberFarmStallion } from 'src/member-farm-stallions/entities/member-farm-stallion.entity';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';

@Injectable({ scope: Scope.REQUEST })
export class MemberFarmsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberFarm)
    private memberFarmRepository: Repository<MemberFarm>,
    private farmService: FarmsService,
  ) {}

  //Get a record
  findOne(fields) {
    return this.memberFarmRepository.findOne({
      where: fields,
    });
  }

  //Create a record
  async create(farmMember: CreateFarmMemberDto) {
    const record = await this.memberFarmRepository.save(
      this.memberFarmRepository.create(farmMember),
    );
    return record;
  }

  //Get Member Farms
  async getMemberFarms() {
    const member = this.request.user;
    const queryBuilder = this.memberFarmRepository
      .createQueryBuilder('memberFarm')
      .select(
        'farm.farmUuid as farmId, farm.farmName as farmName, farm.isActive as isActive',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'memberFarm.isFamOwner as isFamOwner, farmaccesslevel.accessName as accessLevel',
      )
      .innerJoin('memberFarm.farm', 'farm')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farmlocation.state', 'state')
      .leftJoin('memberFarm.farmaccesslevel', 'farmaccesslevel')
      .andWhere('memberFarm.memberId = :memberId', { memberId: member['id'] });
    return await queryBuilder.getRawMany();
  }

  //Get Member Farms By MemberId
  async getMemberFarmsByMemberId(id: string) {
    const member = await getRepository(Member).findOne({
      memberuuid: id,
    });

    const queryBuilder = this.memberFarmRepository
      .createQueryBuilder('memberFarm')
      .select('farm.farmUuid as farmId, farm.farmName as farmName, farm.url')
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'memberFarm.isFamOwner as isFamOwner, farmaccesslevel.accessName as accessLevel',
      )
      .innerJoin('memberFarm.farm', 'farm')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farmlocation.state', 'state')
      .leftJoin('memberFarm.farmaccesslevel', 'farmaccesslevel')
      .andWhere('memberFarm.memberId = :memberId', { memberId: member.id });
    return await queryBuilder.getRawMany();
  }

  //Update records by farmIds
  async updateMany(member: Member, farmsList, accessLevel) {
    const farms = await this.farmService.getManyFarmsByUuids(farmsList);

    if (farms) {
      for (let i = 0; i < farms.length; i++) {
        const dlt = await this.memberFarmRepository.update(
          { memberId: member.id, farmId: farms[i].id },
          { accessLevelId: accessLevel },
        );
      }
    }
  }

  //Delete records
  async deleteMany(member: Member, farmsList) {
    const farms = await this.farmService.getManyFarmsByUuids(farmsList);

    for (let i = 0; i < farms.length; i++) {
      const record = await this.findOne({ memberId: member.id, farmId: farms[i].id });
      if(record){
        await getRepository(MemberFarmStallion).delete({memberFarmId: record.id});
        await this.memberFarmRepository.delete({ id: record.id});
        //Delete Member Invitation Records
        await getRepository(MemberInvitation).manager.query(
          `EXEC proc_SMPDeleteFarmInvitationsOfAMember
          @pFarmId=@0,
          @pEmail=@1`,
          [farms[i].id, member.email],
        );
      }
    }
  }
}
