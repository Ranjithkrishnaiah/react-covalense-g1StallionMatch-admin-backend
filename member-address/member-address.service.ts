import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/members/entities/member.entity';
import { Repository } from 'typeorm';
import { CreateMemberAddressDto } from './dto/create-member-address.dto';
import { UpdateMemberAddressDto } from './dto/update-member-address.dto';
import { MemberAddress } from './entities/member-address.entity';

@Injectable()
export class MemberAddressService {
  constructor(
    @InjectRepository(MemberAddress)
    private memberAddressRepository: Repository<MemberAddress>,
  ) {}

  //Create a record
  async create(member: Member, addressDto: CreateMemberAddressDto) {
    let record = await this.findOne(member);
    if (record) {
      return await this.update(member, addressDto);
    }
    let data = {
      ...addressDto,
      memberId: member.id,
      createdBy: member.id,
    };
    return this.memberAddressRepository.save(
      this.memberAddressRepository.create(data),
    );
  }

  //Update a record
  async update(member: Member, addressDto: UpdateMemberAddressDto) {
    let data = {
      ...addressDto,
      memberId: member.id,
      modifiedBy: member.id,
    };
    return this.memberAddressRepository.update({ memberId: member.id }, data);
  }

  //Get a record
  async findOne(member: Member) {
    return await this.memberAddressRepository.findOne({ memberId: member.id });
  }

  //Delete a record
  async delete(member: Member) {
    return await this.memberAddressRepository.delete({ memberId: member.id });
  }

  //Get a Member Address
  async findMemberAddress(memberId) {
    const queryBuilder = this.memberAddressRepository
      .createQueryBuilder('memberaddress')
      .select(
        'memberaddress.countryId, memberaddress.stateId, memberaddress.city, memberaddress.address',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName, state.stateCode as stateCode')
      .leftJoin('memberaddress.country', 'country')
      .leftJoin('memberaddress.state', 'state')
      .andWhere({ memberId: memberId })
      .orderBy('memberaddress.createdOn', 'DESC');
    return await queryBuilder.getRawOne();
  }
}
