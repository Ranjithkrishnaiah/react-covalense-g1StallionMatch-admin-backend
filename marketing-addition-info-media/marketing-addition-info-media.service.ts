import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, getRepository, Repository } from 'typeorm';
import { CreateMarketingAdditionInfoMediaDto } from './dto/create-marketing-addition-info-media.dto';
import { UpdateMarketingAdditionInfoMediaDto } from './dto/update-marketing-addition-info-media.dto';
import { MarketingAdditionInfoMedia } from './entities/marketing-addition-info-media.entity';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class MarketingAdditionInfoMediaService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MarketingAdditionInfoMedia)
    private marketingAdditionInfoMediaRepository: Repository<MarketingAdditionInfoMedia>,
    private readonly mediaService: MediaService,
  ) {}

  //Create a record
  create(
    createMarketingAdditionInfoMediaDto: CreateMarketingAdditionInfoMediaDto,
  ) {
    const member = this.request.user;

    let mediaInfo = new CreateMarketingAdditionInfoMediaDto();
    mediaInfo.marketingPageAdditionInfoId =
      createMarketingAdditionInfoMediaDto.marketingPageAdditionInfoId;
    mediaInfo.mediaId = createMarketingAdditionInfoMediaDto.mediaId;
    mediaInfo['createdBy'] = member['id'];

    return this.marketingAdditionInfoMediaRepository.save(
      this.marketingAdditionInfoMediaRepository.create(mediaInfo),
    );
  }

  //Update a record
  async update(
    id: number,
    updateMarketingAdditionInfoMediaDto: UpdateMarketingAdditionInfoMediaDto,
  ) {
    return await this.marketingAdditionInfoMediaRepository.update(
      { id: id },
      updateMarketingAdditionInfoMediaDto,
    );
  }

  //Get a recors by MarketingAdditionInfoId
  async findOneByMarketingAdditionInfoId(
    marketingPageAdditionInfoId: number,
    mediaFileType: string = '',
  ) {
    const query = getRepository(MarketingAdditionInfoMedia)
      .createQueryBuilder('maim')
      .select(
        'maim.id as id,maim.mediaId as mediaId, maim.marketingPageAdditionInfoId as marketingPageAdditionInfoId',
      )
      .leftJoin(
        'maim.media',
        'media',
        'media.id = maim.mediaId AND media.markForDeletion = 0',
      )
      .addSelect(
        'media.mediaUrl as imageUrl, media.mediaFileType as mediaFileType',
      )
      .andWhere(
        'maim.marketingPageAdditionInfoId = :marketingPageAdditionInfoId',
        { marketingPageAdditionInfoId: marketingPageAdditionInfoId },
      );

    if (mediaFileType) {
      if (mediaFileType === 'image') {
        query.andWhere('media.mediaFileType like :mediaFileType', {
          mediaFileType: mediaFileType + '/%',
        });
      } else {
        query.andWhere('media.mediaFileType = :mediaFileType', {
          mediaFileType: mediaFileType,
        });
      }
    }
    return await query.getRawOne();
  }

  //Remove record By MarketingInfoId
  async removeByMarketingInfoId(
    marketingPageAdditionInfoId: number,
    sectionType: string,
  ) {
    if (sectionType == 'reportsOverview') {
      return this.removePdfByMarketingInfoId(marketingPageAdditionInfoId);
    }
    const record = await this.findOneByMarketingAdditionInfoId(
      marketingPageAdditionInfoId,
    );
    let response;
    if (record) {
      response = await this.marketingAdditionInfoMediaRepository.delete(
        record['id'],
      );
      if (record['mediaId']) {
        const delMedia = await this.mediaService.remove(record['mediaId']);
      }
    }

    return response;
  }

  //Remove Pdf By MarketingInfoId
  async removePdfByMarketingInfoId(marketingPageAdditionInfoId) {
    const query = getRepository(MarketingAdditionInfoMedia)
      .createQueryBuilder('maim')
      .select(
        'maim.id as id,maim.mediaId as mediaId, maim.marketingPageAdditionInfoId as marketingPageAdditionInfoId',
      )
      .leftJoin(
        'maim.media',
        'media',
        'media.id = maim.mediaId AND media.markForDeletion = 0',
      )
      .addSelect(
        'media.mediaUrl as imageUrl, media.mediaFileType as mediaFileType',
      )
      .andWhere(
        'maim.marketingPageAdditionInfoId = :marketingPageAdditionInfoId',
        { marketingPageAdditionInfoId: marketingPageAdditionInfoId },
      );

    const entities = await query.getRawMany();
    let response;
    if (entities.length) {
      entities.forEach(async (element) => {
        response = await this.marketingAdditionInfoMediaRepository.delete(
          element['id'],
        );
        if (element['mediaId']) {
          const delMedia = await this.mediaService.remove(element['mediaId']);
        }
      });
    }
    return response;
  }

  //Remove By MarketingInfoId And MediaId
  async removeByMarketingInfoIdAndMediaId(
    marketingPageAdditionInfoId: number,
    mediaId: number,
  ) {
    const record = await this.marketingAdditionInfoMediaRepository.findOne({
      marketingPageAdditionInfoId,
      mediaId,
    });
    if (!record) {
      throw new UnprocessableEntityException('Media not exist!');
    }
    const response = await this.marketingAdditionInfoMediaRepository.delete(
      record['id'],
    );
    return response;
  }
}
