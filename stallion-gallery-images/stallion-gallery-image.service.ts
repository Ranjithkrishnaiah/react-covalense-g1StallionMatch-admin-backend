import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { StallionGalleryImage } from './entities/stallion-gallery-image.entity';

@Injectable({ scope: Scope.REQUEST })
export class StallionGalleryImageService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionGalleryImage)
    private stallionGalleryImageRepository: Repository<StallionGalleryImage>,
  ) {}

  async getAllStallionGalleryImages(stallionId: number) {
    return await this.findByStallionId(stallionId);
  }

  async findOne(stallionId: number, testimonialId: number) {
    return await this.stallionGalleryImageRepository.find({
      id: testimonialId,
      stallionId: stallionId,
    });
  }

  /* async saveSource(stallionId: number, fileInfo: FileInfoDto) {
    const member = this.request.user;
    return await this.stallionGalleryImageRepository.save(
      this.stallionGalleryImageRepository.create({
        stallionId: stallionId,
        originalName: fileInfo.fileName,
        fileKey: fileInfo.filePath,
        mimetype: fileInfo.fileType,
        createdBy: member['id'],
        isActive: true
      })
    );
  } */

  /* async create(stallionId: number, file) {
    const member = this.request.user;
    const s3 = new S3();
    const uploadResult = await s3.upload({
      ACL: 'public-read',
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Body: file.buffer,
      Key: `stallion/hero-image/${stallionId}/${uuid()}/${file.originalname}`
    }).promise();
 
    const newFile = this.stallionHeroImageRepository.create({
      stallionId: stallionId,
      originalName: file.originalname,
      fileKey: uploadResult.Key,
      mimetype: file.mimetype,
      createdBy: member['id'],
      isActive: true
    })
    
    await this.stallionHeroImageRepository.save(newFile);
    return newFile;
  } */

  /* async delete(stallionId: number, fileId: number) {
    const member = this.request.user;
    const record = await this.stallionGalleryImageRepository.findOne({
       id: fileId,
       stallionId: stallionId,
       isActive: true
    });
    if (!record) {
      throw new NotFoundException('Stallion hero image not found!');
    } 
    //Its a soft delete
    record.isActive = false;
    record.deletedBy = member['id']
    record.save(); */
  //Its a Hard Delete if we enable this code from here
  /* const s3 = new S3();
    await s3.deleteObject({
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: record.fileKey,
    }).promise();
    await this.stallionHeroImageRepository.delete({
      id: fileId,
      stallionId: stallionId
    }); */
  //return true;
  //}

  /* Get gallery image count of a stallion */
  async getImagesCountByStallionId(stallionId: number) {
    return await this.stallionGalleryImageRepository
      .createQueryBuilder('sgi')
      .select(
        'sgi.stallionId, sgi.mediaId, media.fileName, media.mediauuid, media.mediaLocation, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('sgi.media', 'media')
      .andWhere('sgi.stallionId = :stallionId', { stallionId: stallionId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getCount();
  }

  /* Get List of gallery images of a stallion */
  async findByStallionId(stallionId: number) {
    return await this.stallionGalleryImageRepository
      .createQueryBuilder('sgi')
      .select(
        'media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl',
      )
      .addSelect('sgi.imagePosition as position')
      .innerJoin('sgi.media', 'media')
      .andWhere('sgi.stallionId = :stallionId', { stallionId: stallionId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .orderBy('sgi.imagePosition', 'ASC')
      .getRawMany();
  }

  /* Add ay galler image of a stallion */
  async create(stallionId: number, mediaId: number, position: number) {
    return this.stallionGalleryImageRepository.save(
      this.stallionGalleryImageRepository.create({
        stallionId: stallionId,
        mediaId: mediaId,
        imagePosition: position,
      }),
    );
  }
}
