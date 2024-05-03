import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { Request } from 'express';

import { FarmMediaInfo } from './entities/farm-media-info.entity';
import { UpdateMediaDto } from './dto/update-media.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { FarmMediaFile } from 'src/farm-media-files/entities/farm-media-file.entity';

@Injectable()
export class FarmMediaInfoService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FarmMediaInfo)
    private farmMediaInfoRepository: Repository<FarmMediaInfo>,
  ) {}

  //Create a record
  async create(farmId: number, media: CreateMediaDto) {
    const member = this.request.user;
    media.createdBy = member['id'];
    let data = {
      ...media,
      farmId: farmId,
      isActive: true,
    };
    const response = await this.farmMediaInfoRepository.save(
      this.farmMediaInfoRepository.create(data),
    );
    return response;
  }

  //Update a record
  async update(farmId: number, mediaId: number, media: UpdateMediaDto) {
    let record = await this.farmMediaInfoRepository.findOne({
      farmId,
      id: mediaId,
    });
    if (!record) {
      throw new NotFoundException('Farm Media not found!');
    }
    const member = this.request.user;
    media.modifiedBy = member['id'];
    let result = await this.farmMediaInfoRepository.update(
      {
        id: mediaId,
        farmId: farmId,
      },
      media,
    );
    return result;
  }

  //Get all by farmId
  async getAllMediaByFarmId(farmId: number) {
    const queryBuilder = this.farmMediaInfoRepository
      .createQueryBuilder('mi')
      .select(
        'mi.id as mediaInfoId, mi.title as title, mi.description as description, mi.createdOn as createdOn',
      )
      .addSelect(
        'media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType',
      )
      .leftJoin('mi.farmmediafile', 'mf')
      .leftJoin(
        'mf.media',
        'media',
        'media.id=mf.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('mi.farmId = :farmId', { farmId: farmId })
      .andWhere('mi.isActive = :isActive', { isActive: true });
    let dbList = await queryBuilder.getRawMany();

    let mediaInfoList = [];
    dbList.forEach(function (record) {
      if (!mediaInfoList[record.mediaInfoId]) {
        mediaInfoList[record.mediaInfoId] = {
          mediaInfoId: record.mediaInfoId,
          title: record.title,
          description: record.description,
          createdOn: record.createdOn,
          isDeleted: false,
          mediaInfoFiles: [],
        };
      }
      if (record.mediauuid && record.mediaUrl) {
        let mediaItem = {
          mediaInfoId: record.mediaInfoId,
          mediauuid: record.mediauuid,
          fileName: record.fileName,
          mediaUrl: record.mediaUrl,
          mediaThumbnailUrl: record.mediaThumbnailUrl,
          mediaShortenUrl: record.mediaShortenUrl,
          mediaFileType: record.mediaFileType,
          mediaFileSize: record.mediaFileSize,
        };
        mediaInfoList[record.mediaInfoId].mediaInfoFiles.push(mediaItem);
      }
    });
    let finalList = mediaInfoList.filter(function (item) {
      return item != null;
    });
    return finalList;
  }

  //Get record by farmId and mediaId
  async getMediaByFarmId(farmId: number, mediaId: number) {
    let fmfQueryBuilder = getRepository(FarmMediaFile)
      .createQueryBuilder('fmf')
      .select('fmf.mediainfoid as mediainfoid, media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType')
      .innerJoin(
        'fmf.media',
        'media',
        'media.id=fmf.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.farmMediaInfoRepository
      .createQueryBuilder('mi')
      .select(
        'mi.id as mediaInfoId, mi.title as title, mi.description as description, mi.createdOn as createdOn',
      )
      .addSelect(
        'media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType',
      )
      .leftJoin(
        '(' + fmfQueryBuilder.getQuery() + ')',
        'media',
        'mediaInfoId=mi.id',
      )
      .andWhere('mi.id = :mediaId', { mediaId: mediaId });
    if (farmId) {
      queryBuilder.andWhere('mi.farmId = :farmId', { farmId: farmId });
    }
    queryBuilder.andWhere('mi.isActive = :isActive', { isActive: true });
    let entity = await queryBuilder.getRawOne();

    if (!entity) {
      throw new NotFoundException('Farm media not found!');
    }

    let media = [];
    if (entity.mediauuid) {
      media.push({
        mediaInfoId: entity.mediaInfoId,
        mediauuid: entity.mediauuid,
        fileName: entity.fileName,
        mediaUrl: entity.mediaUrl,
        mediaThumbnailUrl: entity.mediaThumbnailUrl,
        mediaShortenUrl: entity.mediaShortenUrl,
        mediaFileType: entity.mediaFileType,
        mediaFileSize: entity.mediaFileSize,
      });
    }
    const result = {
      mediaInfoId: entity.mediaInfoId,
      title: entity.title,
      description: entity.description,
      createdOn: entity.createdOn,
      isDeleted: false,
      media: media,
    };

    return result;
  }

  //Delete a record
  async delete(farmId: number, mediaInfoId: number) {
    let response = await this.farmMediaInfoRepository.findOne({
      id: mediaInfoId,
      farmId: farmId,
      isActive: true,
    });
    if (!response) {
      throw new NotFoundException('Farm Media not found!');
    }
    const member = this.request.user;
    const record = await this.farmMediaInfoRepository.findOne({
      id: mediaInfoId,
      farmId: farmId,
    });
    record.isActive = false;
    record.deletedBy = member['id'];
    record.save();
    return record;
  }
}
