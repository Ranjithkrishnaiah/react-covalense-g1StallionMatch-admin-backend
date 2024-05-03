import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { HorsesService } from 'src/horses/horses.service';
import { Member } from 'src/members/entities/member.entity';
import { FavouriteMare } from './entities/favourite-mare.entity';
import { Horse } from 'src/horses/entities/horse.entity';

@Injectable({ scope: Scope.REQUEST })
export class FavouriteMareService {
  constructor(
    @InjectRepository(FavouriteMare)
    private favMareRepository: Repository<FavouriteMare>,
    private horsesService: HorsesService,
  ) {}

  //Get all records
  async findAll(id: string) {
    let memberQueryBuilder = getRepository(Member)
      .createQueryBuilder('member')
      .select('member.id as memberid')
      .andWhere('member.memberuuid=:memberuuid', { memberuuid: id });
    const memberID = await memberQueryBuilder.getRawOne();

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

    const queryBuilder = this.favMareRepository
      .createQueryBuilder('favouriteMare')
      .select('favouriteMare.id as id, horse.horseUuid as horseId')
      .addSelect('horse.horseName, horse.yob')
      .addSelect('country.countryCode as countryCode')
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damId, dam.damName, dam.damYob, dam.damCountryCode')
      .innerJoin('favouriteMare.horse', 'horse', 'horse.isVerified=1')
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
      .innerJoin('horse.nationality', 'country')
      .andWhere('favouriteMare.memberId=:memberId', {
        memberId: memberID.memberid,
      });
    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  //Delete records by Ids
  async deleteMany(member: Member, maresList) {
    const mares = await this.horsesService.getManyHorsesByUuids(maresList);
    if (mares) {
      for (let i = 0; i < mares.length; i++) {
        const dlt = await this.favMareRepository.delete({
          memberId: member.id,
          mareId: mares[i].id,
        });
      }
    }
  }
}
