import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { HorsesService } from 'src/horses/horses.service';
import { Member } from 'src/members/entities/member.entity';
import { FavouriteBroodmareSire } from './entities/favourite-broodmare-sire.entity';
import { TrackedDamSireNameSearchDto } from './dto/tracked-damsire-search.dto';

@Injectable({ scope: Scope.REQUEST })
export class FavouriteBroodmareSireService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FavouriteBroodmareSire)
    private favBroodmareSireRepository: Repository<FavouriteBroodmareSire>,
    private horsesService: HorsesService,
  ) {}

  //Get All records
  async findAll(id: string) {
    const member = this.request.user;

    let memberQueryBuilder = getRepository(Member)
      .createQueryBuilder('member')
      .select('member.id as memberid')
      .andWhere('member.memberuuid=:memberuuid', { memberuuid: id });
    const memberID = await memberQueryBuilder.getRawOne();

    const queryBuilder = this.favBroodmareSireRepository
      .createQueryBuilder('favouriteBroodmareSire')
      .select(
        'favouriteBroodmareSire.id as id, horse.horseUuid as horseId, 8 as rnrs, 4 as sw, 20 as swByRnrs',
      )
      .addSelect('horse.horseName, horse.yob')
      .innerJoin('favouriteBroodmareSire.horse', 'horse', 'horse.isVerified=1')
      .andWhere('favouriteBroodmareSire.memberId=:memberId', {
        memberId: memberID.memberid,
      });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Delete records
  async deleteMany(member: Member, broodMareSireIdList) {
    const broodMareSire = await this.horsesService.getManyHorsesByUuids(
      broodMareSireIdList,
    );

    if (broodMareSire) {
      for (let i = 0; i < broodMareSire.length; i++) {
        const dlt = await this.favBroodmareSireRepository.delete({
          memberId: member.id,
          broodmareSireId: broodMareSire[i].id,
        });
      }
    }
  }

  //Get Tracked Stallion By Name
  async getTrackedStallionByName(
    searchOptionsDto: TrackedDamSireNameSearchDto,
  ) {
    const queryBuilder = this.favBroodmareSireRepository
      .createQueryBuilder('favouriteBroodmareSire')
      .select('distinct horse.horseUuid as horseId, horse.horseName')
      .innerJoin('favouriteBroodmareSire.horse', 'horse', 'horse.isVerified=1')
      .andWhere('horse.horseName like :horseName', {
        horseName: '%' + searchOptionsDto.damSireName + '%',
      })
      .getRawMany();
    return queryBuilder;
  }
}
