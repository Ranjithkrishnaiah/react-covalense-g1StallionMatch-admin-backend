import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { StallionsService } from 'src/stallions/stallions.service';
import { Member } from 'src/members/entities/member.entity';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CreateFavouriteStallionDto } from './dto/create-favourite-stallion.dto';
import { FavouriteStallion } from './entities/favourite-stallion.entity';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { TrackedStallionSearchDto } from './dto/tracked-stallion-search.dto';

@Injectable({ scope: Scope.REQUEST })
export class FavouriteStallionsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FavouriteStallion)
    private favStallionRepository: Repository<FavouriteStallion>,
    private stallionsService: StallionsService,
  ) {}

  //Add a record
  async create(createFavouriteStallionDto: CreateFavouriteStallionDto) {
    try {
      const member = this.request.user;
      //Check stallion exist
      let stallionRecord = await this.stallionsService.findOne(
        createFavouriteStallionDto.stallionUuid,
      );
      if (!stallionRecord) {
        throw new UnprocessableEntityException('Stallion not exist!');
      }
      let favouriteRecord = {
        stallionId: stallionRecord.id,
        memberId: member['id'],
        createdBy: member['id'],
      };
      //Check Faviourate already added!
      let favRecord = await this.favStallionRepository.findOne(favouriteRecord);
      if (favRecord) {
        throw new HttpException(
          'You have already added this to your favourite!',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      return await this.favStallionRepository.save(
        this.favStallionRepository.create(favouriteRecord),
      );
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  //Get all records
  async findAll(id: string) {
    const member = this.request.user;

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

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select('spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.favStallionRepository
      .createQueryBuilder('favouriteStallion')
      .select('stallion.stallionUuid as stallionId, mediaUrl as image')
      .addSelect('horse.horseName, horse.yob')
      .addSelect('country.countryCode as countryCode')
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damId, dam.damName, dam.damYob, dam.damCountryCode')
      .innerJoin('favouriteStallion.stallion', 'stallion')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .innerJoin('stallion.horse', 'horse')
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
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin('stallionlocation.country', 'country')
      .andWhere('favouriteStallion.memberId=:memberId', {
        memberId: memberID.memberid,
      })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  async findAllWithRaceDetails(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<FavouriteStallion>> {
    const member = this.request.user;

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select('spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.favStallionRepository
      .createQueryBuilder('favouriteStallion')
      .select(
        'favouriteStallion.id as id, stallion.stallionUuid as stallionId, mediaUrl as image, 8 as rnrs, 4 as sw, 20 as swByRnrs',
      )
      .addSelect('horse.horseName as horseName')
      .innerJoin('favouriteStallion.stallion', 'stallion')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .innerJoin('stallion.horse', 'horse')
      .andWhere('favouriteStallion.memberId=:memberId', {
        memberId: member['id'],
      })
      .orderBy('horse.horseName', searchOptionsDto.order)
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      queryBuilder.orderBy('horse.horseName', 'ASC');
      if (sortBy.toLowerCase() === 'age') {
        queryBuilder.orderBy('horse.yob', 'ASC');
      }

      if (sortBy.toLowerCase() === 'date added') {
        queryBuilder.orderBy('favouriteStallion.createdOn', 'DESC');
      }
      if (sortBy.toLowerCase() === 'runners') {
      }
      if (sortBy.toLowerCase() === 'stakes winners') {
      }
    }

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  async remove(deleteFavouriteStallionDto: CreateFavouriteStallionDto) {
    const record = await this.stallionsService.findOne(
      deleteFavouriteStallionDto.stallionUuid,
    );
    if (!record) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    const member = this.request.user;
    const response = await this.favStallionRepository.delete({
      stallionId: record.id,
    });
    return {
      statusCode: 200,
      message: `This action removes a #${deleteFavouriteStallionDto.stallionUuid} favouriteStallion`,
      data: response,
    };
  }

  //Delete records by ids
  async deleteMany(member: Member, stallionIdList) {
    const stallions = await this.stallionsService.getManyByUuids(
      stallionIdList,
    );

    if (stallions) {
      for (let i = 0; i < stallions.length; i++) {
        const dlt = await this.favStallionRepository.delete({
          memberId: member.id,
          stallionId: stallions[i].id,
        });
      }
    }
  }

  //Get Tracked Stallion By Name
  async getTrackedStallionByName(searchOptionsDto: TrackedStallionSearchDto) {
    const queryBuilder = this.favStallionRepository
      .createQueryBuilder('favouriteStallion')
      .select(
        'distinct stallion.stallionUuid as stallionId, horse.horseName as stallionName',
      )
      .innerJoin('favouriteStallion.stallion', 'stallion')
      .innerJoin('stallion.horse', 'horse')
      .andWhere('horse.horseName like :horseName', {
        horseName: '%' + searchOptionsDto.stallionName + '%',
      });

    const entities = await queryBuilder.getRawMany();

    return entities;
  }
}
