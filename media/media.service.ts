import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { Media } from './entities/media.entity';
import { CreateMediaInitialDto } from './dto/create-media-initial.dto';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class MediaService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
  ) {}

  //Create a record in Media
  async create(mediauuid: string) {
    const member = this.request.user;
    //As we are not using lambda services now, hardcoded to one image
    //Once after DB connected with AWS RDS then this will be removed
    if (this.configService.get('app.nodeEnv') == 'local') {
      let createMedia = new CreateMediaDto();
      createMedia.createdBy = member['id'];
      createMedia.mediauuid = mediauuid;
      createMedia.markForDeletion = false;
      createMedia.fileName = 'image.png';
      createMedia.mediaLocation =
        'stallion/profile-image/FCD90936-8309-ED11-B1EC-00155D01EE2B/209bb6e6-5d9f-45b4-a093-66be00d72d2e/image.png';
      createMedia.mediaUrl =
        'https://dev-stallionmatch.imgix.net/stallion/profile-image/FCD90936-8309-ED11-B1EC-00155D01EE2B/209bb6e6-5d9f-45b4-a093-66be00d72d2e/image.png';
      createMedia.mediaFileType = 'image/png';
      createMedia.mediaFileSize = 78066;
      return await this.mediaRepository.save(
        this.mediaRepository.create(createMedia),
      );
    } else {
      let createMedia = new CreateMediaInitialDto();
      createMedia.createdBy = member['id'];
      createMedia.mediauuid = mediauuid;
      createMedia.markForDeletion = false;
      return await this.mediaRepository.save(
        this.mediaRepository.create(createMedia),
      );
    }
  }

  //Update a record in Media
  async update(mediauuid: string, updateDto: UpdateMediaDto) {
    return this.mediaRepository.update({ mediauuid: mediauuid }, updateDto);
  }

  //Mark for deletion a record in Media
  async markForDeletion(mediaId: number) {
    const member = this.request.user;
    return this.mediaRepository.update(
      { id: mediaId },
      {
        markForDeletion: true,
        markForDeletionRequestBy: member['id'],
        markForDeletionRequestDate:
          await this.commonUtilsService.getCurrentUTCDateTime(),
      },
    );
  }

  //Mark for deletion a record in Media
  async markForDeletionByMediaUuid(mediaUuid: string) {
    const member = this.request.user;
    return this.mediaRepository.update(
      { mediauuid: mediaUuid },
      {
        markForDeletion: true,
        markForDeletionRequestBy: member['id'],
        markForDeletionRequestDate:
          await this.commonUtilsService.getCurrentUTCDateTime(),
      },
    );
  }

  //Get Media by uuid
  async getMediaByUuid(mediauuid: string) {
    const record = await this.mediaRepository.findOne({ mediauuid: mediauuid });
    if (!record) {
      throw new NotFoundException('Media not exist!');
    }
    return record;
  }

  //Validate FileUuid
  async validateFileUuid(mediauuid: string) {
    const record = await this.mediaRepository.findOne({ mediauuid: mediauuid });
    if (record) {
      throw new UnprocessableEntityException(
        'Mediauuid already in use, try with different one!',
      );
    }
    return mediauuid;
  }

  //Check Is Mediauuids Exist
  async isMediauuidsExist(mediauuidList: any[]) {
    let data = await this.mediaRepository
      .createQueryBuilder('media')
      .select('media.id')
      .andWhere('media.mediauuid  IN (:...mediauuidList)', {
        mediauuidList: mediauuidList,
      })
      .getCount();
    if (data) {
      throw new UnprocessableEntityException(
        'Mediauuids already in use, try with different one!',
      );
    }
    return;
  }

  //Delete a media
  async remove(id: number) {
    const record = await this.mediaRepository.findOne({ id: id });
    if (!record) {
      throw new UnprocessableEntityException('Media not exist!');
    }
    const response = await this.mediaRepository.delete(record['id']);
    return response;
  }

  //Get Records By MediaId
  findOneByMediaId(id: number) {
    return this.mediaRepository.findOne({
      id,
    });
  }

  //Get Media Upload Status
  async mediaUploadStatus(mediauuids: []) {
    const record = await this.mediaRepository.find({
      where: {
        mediauuid: In(mediauuids),
        mediaUrl: Not(IsNull()),
      },
    });
    if (mediauuids.length != record.length) {
      return 'INPROGRESS';
    }
    return 'SUCCESS';
  }

  async createPdf(mediauuid: string) {
    const member = this.request.user;
    //As we are not using lambda services now, hardcoded to one image
    //Once after DB connected with AWS RDS then this will be removed
    if (this.configService.get('app.nodeEnv') == 'local') {
      let createMedia = new CreateMediaDto();
      createMedia.createdBy = member['id'];
      createMedia.mediauuid = mediauuid;
      createMedia.markForDeletion = false;
      createMedia.fileName = 'abc.pdf';
      createMedia.mediaLocation =
        'marketing-page-report-overview/pdf/FCD90936-8309-ED11-B1EC-00155D01EE2B/209bb6e6-5d9f-45b4-a093-66be00d72d2e/abc.pdf';
      createMedia.mediaUrl =
        'https://dev-stallionmatch.imgix.net/marketing-page-report-overview/pdf/FCD90936-8309-ED11-B1EC-00155D01EE2B/209bb6e6-5d9f-45b4-a093-66be00d72d2e/abc.pdf';
      createMedia.mediaFileType = 'application/pdf';
      createMedia.mediaFileSize = 78066;
      return await this.mediaRepository.save(
        this.mediaRepository.create(createMedia),
      );
    } else {
      let createMedia = new CreateMediaInitialDto();
      createMedia.createdBy = member['id'];
      createMedia.mediauuid = mediauuid;
      createMedia.markForDeletion = false;
      return await this.mediaRepository.save(
        this.mediaRepository.create(createMedia),
      );
    }
  }
}
