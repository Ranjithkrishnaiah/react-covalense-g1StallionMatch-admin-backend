import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketingMedia } from './entities/marketing-media.entity';
import { getRepository, Repository } from 'typeorm';
import { MarketingMediaDto } from './dto/marketing-media.dto';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class MarketingMediaService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MarketingMedia)
    private marketingMediaRepository: Repository<MarketingMedia>,
    private readonly mediaService: MediaService,
  ) {}

  //Create a record
  create(createMarketingMediaDto: MarketingMediaDto) {
    const member = this.request.user;
    let media = new MarketingMediaDto();
    media.marketingPageId = createMarketingMediaDto.marketingPageId;
    media.marketingPageSectionId =
      createMarketingMediaDto.marketingPageSectionId;
    media.mediaId = createMarketingMediaDto.mediaId;
    media['createdBy'] = member['id'];
    media['createdOn'] = new Date();

    return this.marketingMediaRepository.save(
      this.marketingMediaRepository.create(media),
    );
  }

  //Get a record By MarketingPageId And SectionId
  async findOneByMarketingPageIdAndSectionId(
    marketingPageId: number,
    marketingPageSectionId: number,
  ) {
    const query = getRepository(MarketingMedia)
      .createQueryBuilder('mrktMedia')
      .select('mrktMedia.id as marketingMediaId, mrktMedia.mediaId as mediaId')
      .andWhere('mrktMedia.marketingPageId = :marketingPageId', {
        marketingPageId: marketingPageId,
      })
      .andWhere('mrktMedia.marketingPageSectionId = :marketingPageSectionId', {
        marketingPageSectionId: marketingPageSectionId,
      });

    return await query.getRawOne();
  }

  update(id: number, updateMarketingMediaDto: MarketingMediaDto) {
    return this.marketingMediaRepository.update(
      { id: id },
      updateMarketingMediaDto,
    );
  }

  //Remove a record
  async remove(id: number) {
    const query = getRepository(MarketingMedia)
      .createQueryBuilder('mkm')
      .select('mkm.id, mkm.mediaId')
      .andWhere('mkm.id = :id', { id: id });

    const mmRecord = await query.getRawOne();

    if (!mmRecord) {
      throw new NotFoundException('Marketing media not exist!');
    }

    const response = this.marketingMediaRepository.delete(id);
    await this.mediaService.markForDeletion(mmRecord['mediaId']);

    return response;
  }
}
