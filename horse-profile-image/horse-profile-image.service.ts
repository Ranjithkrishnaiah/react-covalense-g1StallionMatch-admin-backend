import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileImageDto } from './dto/create-profile-image.dto';
import { HorseProfileImage } from './entities/horse-profile-image.entity';

@Injectable()
export class HorseProfileImageService {
  constructor(
    @InjectRepository(HorseProfileImage)
    private horseProfileImageRepository: Repository<HorseProfileImage>,
  ) {}

  //Create a record
  async create(createDto: CreateProfileImageDto) {
    return this.horseProfileImageRepository.save(
      this.horseProfileImageRepository.create(createDto),
    );
  }

  //Get a record by horseId
  async findByHorseId(horseId: number) {
    return await this.horseProfileImageRepository
      .createQueryBuilder('hpi')
      .select(
        'hpi.horseId, hpi.mediaId, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('hpi.media', 'media')
      .andWhere('hpi.horseId = :horseId', { horseId: horseId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getRawOne();
  }
}
