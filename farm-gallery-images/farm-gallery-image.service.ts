import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FarmGalleryImage } from './entities/farm-gallery-image.entity';

@Injectable({ scope: Scope.REQUEST })
export class FarmGalleryImageService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FarmGalleryImage)
    private farmGalleryImageRepository: Repository<FarmGalleryImage>,
  ) {}

  //Get all farm gallery Images By farmId
  async getAllFarmGalleryImages(farmId: number) {
    return await this.findByFarmId(farmId);
  }

  //Get farm gallery Image By farmId and mediaId
  async findOne(farmId: number, mediaId: number) {
    return await this.farmGalleryImageRepository.find({
      id: mediaId,
      farmId: farmId,
    });
  }

  //Get all farm gallery Images Count By farmId
  async getImagesCountByFarmId(farmId: number) {
    return await this.farmGalleryImageRepository
      .createQueryBuilder('fgi')
      .select(
        'fgi.farmId, fgi.mediaId, media.fileName, media.mediauuid, media.mediaLocation, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('fgi.media', 'media')
      .andWhere('fgi.farmId = :farmId', { farmId: farmId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getCount();
  }

  //Get all farm gallery Images By farmId
  async findByFarmId(farmId: number) {
    return await this.farmGalleryImageRepository
      .createQueryBuilder('fgi')
      .select(
        'media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl',
      )
      .innerJoin('fgi.media', 'media')
      .andWhere('fgi.farmId = :farmId', { farmId: farmId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getRawMany();
  }

  //Add a farm gallery Image
  async create(farmId: number, mediaId: number) {
    return this.farmGalleryImageRepository.save(
      this.farmGalleryImageRepository.create({
        farmId: farmId,
        mediaId: mediaId,
      }),
    );
  }
}
