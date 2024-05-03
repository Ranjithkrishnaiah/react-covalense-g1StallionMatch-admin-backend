import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { CreateMarketingTileDto } from './dto/create-marketing-tile.dto';
import { MarketingTiles } from './entities/marketing-tile.entity';
import { MarketingPageSection } from 'src/marketing-page-home/entities/marketing-page-section.entity';
import { DeleteTileDto } from './dto/delete-tile.dto';

@Injectable()
export class MarketingTilesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MarketingTiles)
    private marketingTilesRepository: Repository<MarketingTiles>,
  ) {}

  //Create a record
  async create(createMarketingTileDto: CreateMarketingTileDto) {
    const createResponse = await this.marketingTilesRepository.save(
      this.marketingTilesRepository.create(createMarketingTileDto),
    );
    return createResponse;
  }

  //Remove a record
  async remove(deleteFarmDto: DeleteTileDto, sectionType: string) {
    sectionType = this.changeSectionType(sectionType);

    const tile = await this.findOneByUuidAndSectionType(
      deleteFarmDto.tileId,
      sectionType,
    );
    if (!tile) {
      throw new NotFoundException('Not exist!');
    }
    return this.marketingTilesRepository.delete({
      titlePermissionsUuid: deleteFarmDto.tileId,
    });
  }

  //Get a record By titlePermissionsUuid And SectionType
  async findOneByUuidAndSectionType(uuid: string, sectionType: string) {
    const query = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as marketingPageSectionId, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionName as sectionName, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .andWhere(
        'mrktPageSec.marketingPageSectionType = :marketingPageSectionType',
        { marketingPageSectionType: sectionType },
      );

    const section = await query.getRawOne();

    let titlePerQueryBuilder =
      this.marketingTilesRepository.createQueryBuilder('mt');

    if (sectionType == 'tilePermissions') {
      titlePerQueryBuilder.select(
        'mt.titlePermissionsUuid as id, mt.marketingPagePermissionTitle as title, mt.isAnonymous as isAnonymous, mt.isRegistered as isRegistered, mt.marketingPageTilePermissionsPosition as position',
      );
    } else {
      titlePerQueryBuilder.select(
        'mt.titlePermissionsUuid as id, mt.marketingPagePermissionTitle as title',
      );
    }

    titlePerQueryBuilder
      .andWhere('mt.marketingPageSectionId = :marketingPageSectionId', {
        marketingPageSectionId: section['marketingPageSectionId'],
      })
      .andWhere('mt.titlePermissionsUuid = :titlePermissionsUuid', {
        titlePermissionsUuid: uuid,
      });

    return titlePerQueryBuilder.getRawOne();
  }

  //Get All By SectionType
  async findAllBySectionType(type: string) {
    const sectionType = this.changeSectionType(type);

    const query = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as marketingPageSectionId, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionName as sectionName, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .andWhere(
        'mrktPageSec.marketingPageSectionType = :marketingPageSectionType',
        { marketingPageSectionType: sectionType },
      );

    const section = await query.getRawOne();

    let titlePerQueryBuilder =
      this.marketingTilesRepository.createQueryBuilder('mt');

    if (sectionType == 'tilePermissions') {
      titlePerQueryBuilder.select(
        'mt.titlePermissionsUuid as id, mt.marketingPagePermissionTitle as title, mt.isAnonymous as isAnonymous, mt.isRegistered as isRegistered, mt.marketingPageTilePermissionsPosition as position',
      );
    } else {
      titlePerQueryBuilder.select(
        'mt.titlePermissionsUuid as id, mt.marketingPagePermissionTitle as title',
      );
    }

    titlePerQueryBuilder.andWhere(
      'mt.marketingPageSectionId = :marketingPageSectionId',
      { marketingPageSectionId: section['marketingPageSectionId'] },
    );

    return titlePerQueryBuilder.getRawMany();
  }

  //Get Count By SectionType
  async findCountSectionType(sectionType: string) {
    const query = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as marketingPageSectionId, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionName as sectionName, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .andWhere(
        'mrktPageSec.marketingPageSectionType = :marketingPageSectionType',
        { marketingPageSectionType: sectionType },
      );

    const section = await query.getRawOne();

    let titlePerQueryBuilder =
      this.marketingTilesRepository.createQueryBuilder('mt');

    if (sectionType == 'tilePermissions') {
      titlePerQueryBuilder.select(
        'mt.titlePermissionsUuid as id, mt.marketingPagePermissionTitle as title, mt.isAnonymous as isAnonymous, mt.isRegistered as isRegistered, mt.marketingPageTilePermissionsPosition as position',
      );
    } else {
      titlePerQueryBuilder.select(
        'mt.titlePermissionsUuid as id, mt.marketingPagePermissionTitle as title, mt.marketingPageTilePermissionsPosition as position',
      );
    }

    titlePerQueryBuilder.andWhere(
      'mt.marketingPageSectionId = :marketingPageSectionId',
      { marketingPageSectionId: section['marketingPageSectionId'] },
    );

    return titlePerQueryBuilder.getCount();
  }

  //Change Section Type
  changeSectionType(type: string) {
    if (type == 'free') {
      return 'freePricingTile';
    } else if (type == 'promoted') {
      return 'promotedPricingTile';
    } else if (type == 'tilePermissions') {
      return 'tilePermissions';
    } else {
      throw new NotFoundException('Not exist!');
    }
  }
}
