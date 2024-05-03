import {
  Injectable,
  Inject,
  UnprocessableEntityException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FarmsService } from 'src/farms/farms.service';
import { Member } from 'src/members/entities/member.entity';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FavouriteFarm } from './entities/favourite-farm.entity';
import { FarmProfileImage } from 'src/farm-profile-image/entities/farm-profile-image.entity';
import { TrackedFarmNameSearchDto } from './dto/tracked-farm-search.dto';
@Injectable({ scope: Scope.REQUEST })
export class FavouriteFarmsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FavouriteFarm)
    private favouriteFarmRepository: Repository<FavouriteFarm>,
    private farmService: FarmsService,
  ) {}

  //Get all records by memberId
  async findAll(id: string) {
    let memberQueryBuilder = getRepository(Member)
      .createQueryBuilder('member')
      .select('member.id as memberid')
      .andWhere('member.memberuuid=:memberuuid', { memberuuid: id });
    const memberID = await memberQueryBuilder.getRawOne();

    let fpiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.favouriteFarmRepository
      .createQueryBuilder('favouriteFarm')
      .select('favouriteFarm.id as id')
      .addSelect(
        'farm.farmUuid as farmId, farm.farmName as farmName, mediaUrl as image',
      )
      .innerJoin('favouriteFarm.farm', 'farm')
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      )
      .andWhere('favouriteFarm.memberId=:memberId', {
        memberId: memberID.memberid,
      });

    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  //Delete records by memberId
  async deleteMany(member: Member, farmsList) {
    const farms = await this.farmService.getManyFarmsByUuids(farmsList);

    if (farms) {
      for (let i = 0; i < farms.length; i++) {
        const dlt = await this.favouriteFarmRepository.delete({
          memberId: member.id,
          farmId: farms[i].id,
        });
      }
    }
  }

  //Get Tracked Farm By Name
  async getTrackedFarmByName(searchOptionsDto: TrackedFarmNameSearchDto) {
    const queryBuilder = this.favouriteFarmRepository
      .createQueryBuilder('favouriteFarm')
      .select('distinct farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin('favouriteFarm.farm', 'farm')
      .andWhere('farm.farmName like :farmName', {
        farmName: '%' + searchOptionsDto.farmName + '%',
      });

    const entities = await queryBuilder.getRawMany();

    return entities;
  }
}
