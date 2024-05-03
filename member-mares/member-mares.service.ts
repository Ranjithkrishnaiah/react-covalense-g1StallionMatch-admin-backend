import {
  Inject,
  Injectable,
  Scope
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { HorseProfileImage } from 'src/horse-profile-image/entities/horse-profile-image.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { Member } from 'src/members/entities/member.entity';
import { Repository, getRepository } from 'typeorm';
import { MemberMare } from './entities/member-mare.entity';

@Injectable({ scope: Scope.REQUEST })
export class MemberMaresService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberMare)
    private memberMareRepository: Repository<MemberMare>,
    private horsesService: HorsesService,
  ) {}


  /* Get all records */
  async findAll(id:string) {
    let memberQueryBuilder = getRepository(Member)
    .createQueryBuilder('member')
    .select('member.id as memberid')
    .andWhere('member.memberuuid=:memberuuid', { memberuuid: id });
    const member = await  memberQueryBuilder.getRawOne();

    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    let hpiQueryBuilder = getRepository(HorseProfileImage)
      .createQueryBuilder('hpi')
      .select('hpi.horseId as mediaHorseId, media.mediaUrl as profileMediaUrl')
      .innerJoin(
        'hpi.media',
        'media',
        'media.id=hpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.memberMareRepository
      .createQueryBuilder('memberMare')
      .select('memberMare.id as id')
      .addSelect(
        'horse.horseUuid as horseId, horse.horseName as horseName, horse.yob as yob',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damId, dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect('profileMediaUrl as profilePic')
      .leftJoin(
        'memberMare.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + hpiQueryBuilder.getQuery() + ')',
        'horseprofileimage',
        'mediaHorseId=horse.id',
      )
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      )
      .andWhere('memberMare.memberId=:memberId', { memberId: member.memberid })
     .orderBy('horse.horseName','ASC')
    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    return entities
  }
  //Delete records by Ids
  async deleteMany(member: Member, maresList) {
    const mares = await this.horsesService.getManyHorsesByUuids(maresList);
    if (mares) {
      for (let i = 0; i < mares.length; i++) {
        const dlt = await this.memberMareRepository.delete({
          memberId: member.id,
          mareId: mares[i].id,
        });
      }
    }
  }
}
