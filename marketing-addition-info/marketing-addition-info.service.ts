import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, IsNull, Not, Repository } from 'typeorm';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { MarketingAdditonInfo } from './entities/marketing-addition-info.entity';
import { MediaService } from 'src/media/media.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ConfigService } from '@nestjs/config';
import { MarketingAdditionInfoMediaService } from 'src/marketing-addition-info-media/marketing-addition-info-media.service';
import { MarketingPageSection } from 'src/marketing-page-home/entities/marketing-page-section.entity';
import { UpdateTestimonialInfoDto } from './dto/update-testimonial-info.dto';
import { UpdateCarouselInfoDto } from './dto/update-carousel-info.dto';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { CreateReportsOverviewDto } from './dto/create-overview.dto';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { ReorderItemDto } from './dto/reorder-item.dto';
import { MarketingTilesService } from 'src/marketing-tiles/marketing-tiles.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class MarketingAdditonInfoService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MarketingAdditonInfo)
    private marketingAdditonInfoRepository: Repository<MarketingAdditonInfo>,
    private readonly mediaService: MediaService,
    private readonly fileUploadsService: FileUploadsService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    private readonly marketingAdditionInfoMediaService: MarketingAdditionInfoMediaService,
    private readonly marketingTilesService: MarketingTilesService,
    private eventEmitter: EventEmitter2,
  ) {}

  //Create a record
  async create(createDto, type: string) {
    const member = this.request.user;
    let sectionType = type;
    if (type == 'free') {
      sectionType = 'freePricingTile';
    } else if (type == 'promoted') {
      sectionType = 'promotedPricingTile';
    }

    const query = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as marketingPageSectionId, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionName as sectionName, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .andWhere(
        'mrktPageSec.marketingPageSectionUuid = :marketingPageSectionUuid',
        { marketingPageSectionUuid: createDto.marketingPageSectionId },
      );

    const section = await query.getRawOne();
  
    if (!section) {
      throw new NotFoundException('marketingPageSectionId not exist!');
    }
      if (sectionType != section['sectionType']) {
        throw new NotFoundException(
          createDto.marketingPageSectionId + ' not exist for ' + sectionType,
        );
      }
   
    let createData;

    if (sectionType == 'testimonial') {
      createData = new CreateTestimonialDto();
      createData.marketingPageId = section['marketingPageId'];
      createData.marketingPageSectionId = section['marketingPageSectionId'];
      createData.marketingPageAdditionInfoName = createDto.name;
      createData.marketingPageAdditionInfoDescription = createDto.testimonial;
      createData.marketingPageAdditionInfoCompany = createDto.company;
      createData.marketingPageAdditionInfoCompanyUrl = createDto.companyUrl;
    } else if (sectionType == 'carousel') {
      createData = new CreateCarouselDto();
      createData.marketingPageId = section['marketingPageId'];
      createData.marketingPageSectionId = section['marketingPageSectionId'];
      createData.marketingPageAdditionInfoTitle = createDto.title;
      createData.marketingPageAdditionInfoDescription = createDto.description;
      createData.marketingPageAdditionInfoButtonText = createDto['buttonText'];
      createData.marketingPageAdditionInfoButtonUrl = createDto['buttonUrl'];
      createData.marketingPageAdditionInfoOrientation =
        createDto['orientation'];
    } else if (sectionType == 'reportsOverview') {
      createData = new CreateReportsOverviewDto();
      const productReportExist = await getRepository(Product).findOne({
        where: {
          productCode: createDto.productCode,
          marketingPageInfoId: Not(IsNull())
        },
      });
      if(productReportExist){
        throw new UnprocessableEntityException(
          'Report Overview is already present for this Product,try with different one!',
        );
      }
      createData.marketingPageId = section['marketingPageId'];
      createData.marketingPageSectionId = section['marketingPageSectionId'];
      createData.marketingPageAdditionInfoTitle = createDto.title;
      createData.marketingPageAdditionInfoDescription = createDto.description;
      createData.marketingPageAdditionInfoButtonText = createDto['buttonText'];
    } else if (sectionType == 'clientLogos') {
      createData = {};
      createData['marketingPageId'] = section['marketingPageId'];
      createData['marketingPageSectionId'] = section['marketingPageSectionId'];
    } else if (
      sectionType == 'freePricingTile' ||
      sectionType == 'promotedPricingTile'
    ) {
      createData = {};
      createData['marketingPageId'] = section['marketingPageId'];
      createData['marketingPageSectionId'] = section['marketingPageSectionId'];
      createData.marketingPagePermissionTitle = createDto.title;
      createData.titlePermissionsUuid = uuid();
      createData.createdBy = member['id'];
      createData.marketingPageTilePermissionsPosition =
        await this.marketingTilesService.findCountSectionType(sectionType);
      return this.marketingTilesService.create(createData);
    }

    createData['isActive'] = createDto.isActive ? createDto.isActive : false;
    createData['createdBy'] = member['id'];
    createData['marketingPageAdditionInfoUuid'] = uuid();

    const additonalInfo =
      await this.findAllByMarketingPageSectionIdAndSectionType(
        section['marketingPageSectionId'],
        section['sectionType'],
      );

    createData['marketingPageAdditionInfoPosition'] = additonalInfo.count;

    const createResponse = await this.marketingAdditonInfoRepository.save(
      this.marketingAdditonInfoRepository.create(createData),
    );
    if(createResponse){
      if (sectionType == 'reportsOverview'){
         await getRepository(Product).update({ productCode: createDto.productCode},{marketingPageInfoId:createResponse['id']})
      }
    }
    if (createDto.fileInfo) {
      const image = await this.uploadImage(createResponse['id'], {
        fileName: createDto.fileInfo.fileName,
        fileuuid: createDto.fileInfo.fileuuid,
        fileSize: createDto.fileInfo.fileSize,
      });

      createResponse['bgImage'] = image['url'];
    }

    if (createDto.fileuuid) {
      await this.updateAdditionalMedia(
        createResponse['id'],
        createDto.fileuuid,
        'image',
      );
    }

    if (sectionType == 'overview' && createDto.pdfuuid) {
      await this.updateAdditionalMedia(
        createResponse['id'],
        createDto.pdfuuid,
        'application/pdf',
      );
    }
  
   return createResponse;
  }

  //Update Additional Info Media
  async updateAdditionalMedia(
    marketingPageAdditionInfoId,
    fileuuid,
    mediaFileType,
  ) {
    const media = await this.mediaService.getMediaByUuid(fileuuid);

    const record =
      await this.marketingAdditionInfoMediaService.findOneByMarketingAdditionInfoId(
        marketingPageAdditionInfoId,
        mediaFileType,
      );
    if (record) {
      await this.marketingAdditionInfoMediaService.update(record['id'], {
        mediaId: media.id,
      });
      if (record['mediaId']) {
        await this.mediaService.remove(record['mediaId']);
      }
    } else {
      await this.marketingAdditionInfoMediaService.create({
        marketingPageAdditionInfoId: marketingPageAdditionInfoId,
        mediaId: media.id,
      });
    }
  }

  //Get all records
  async findAll(sectionType: string) {
    let allQueryBuilder =
      getRepository(MarketingAdditonInfo).createQueryBuilder('additionInfo');

    if (sectionType == 'testimonial') {
      allQueryBuilder.select(
        'additionInfo.id as id, additionInfo.marketingPageAdditionInfoUuid as uuid, additionInfo.marketingPageAdditionInfoName as name, additionInfo.marketingPageAdditionInfoDescription as testimonial, additionInfo.marketingPageAdditionInfoCompany as company,additionInfo.marketingPageAdditionInfoCompanyUrl as companyUrl, additionInfo.isActive as isActive',
      );
    } else {
      allQueryBuilder.select(
        'additionInfo.id as id, additionInfo.marketingPageAdditionInfoUuid as uuid, additionInfo.marketingPageAdditionInfoTitle as title, additionInfo.marketingPageAdditionInfoDescription as description, additionInfo.marketingPageAdditionInfoButtonText as buttonText,additionInfo.marketingPageAdditionInfoOrientation as orientation, additionInfo.isActive as isActive',
      );
    }

    allQueryBuilder
      .leftJoin('additionInfo.aditnMedia', 'additionInfoMedia')
      .leftJoin(
        'additionInfoMedia.media',
        'media',
        'media.id = additionInfoMedia.mediaId AND additionInfoMedia.marketingPageAdditionInfoId = additionInfo.id',
      )
      .addSelect('media.mediaUrl as imageUrl');

    if (sectionType == 'testimonial') {
      allQueryBuilder.andWhere(
        'additionInfo.marketingPageAdditionInfoName IS NOT NULL',
      );
    } else {
      allQueryBuilder.andWhere(
        'additionInfo.marketingPageAdditionInfoTitle IS NOT NULL',
      );
    }

    const entities = await allQueryBuilder.getRawMany();
    return entities;
  }

  //Get All By MarketingPageSectionId And SectionType
  async findAllByMarketingPageSectionIdAndSectionType(
    marketingPageSectionId: number,
    sectionType: string,
  ) {
    let mrkAdditnQueryBuilder =
      getRepository(MarketingAdditonInfo).createQueryBuilder('additionInfo');

    if (sectionType == 'testimonial') {
      mrkAdditnQueryBuilder.select(
        'additionInfo.marketingPageAdditionInfoUuid as id, additionInfo.marketingPageAdditionInfoName as name, additionInfo.marketingPageAdditionInfoPosition as position, additionInfo.marketingPageAdditionInfoDescription as testimonial, additionInfo.marketingPageAdditionInfoCompany as company,additionInfo.marketingPageAdditionInfoCompanyUrl as companyUrl, additionInfo.isActive as isActive',
      );
    } else if (sectionType == 'carousel') {
      mrkAdditnQueryBuilder.select(
        'additionInfo.marketingPageAdditionInfoUuid as id, additionInfo.marketingPageAdditionInfoTitle as title, additionInfo.marketingPageAdditionInfoPosition as position, additionInfo.marketingPageAdditionInfoDescription as description, additionInfo.marketingPageAdditionInfoButtonText as buttonText,additionInfo.marketingPageAdditionInfoButtonUrl as buttonUrl,additionInfo.marketingPageAdditionInfoOrientation as orientation, additionInfo.isActive as isActive',
      );
    } else if (sectionType == 'reportsOverview') {

      let productQuery = await getRepository(Product).createQueryBuilder('product')
      .select('product.productCode as productCode,product.marketingPageInfoId as marketingPageInfoId');

      mrkAdditnQueryBuilder.select(
        'additionInfo.marketingPageAdditionInfoUuid as id, additionInfo.marketingPageAdditionInfoTitle as title, additionInfo.marketingPageAdditionInfoPosition as position, additionInfo.marketingPageAdditionInfoDescription as description, additionInfo.marketingPageAdditionInfoButtonText as buttonText, additionInfo.isActive as isActive,product.productCode',
      )
      mrkAdditnQueryBuilder.leftJoin(
        '(' + productQuery.getQuery() + ')',
        'product',
        'product.marketingPageInfoId=additionInfo.id',
      )

    } else if (sectionType == 'clientLogos') {
      mrkAdditnQueryBuilder.select(
        'additionInfo.marketingPageAdditionInfoUuid as id, additionInfo.isActive as isActive',
      );
    }
    mrkAdditnQueryBuilder
      .leftJoin('additionInfo.aditnMedia', 'additionInfoMedia')
      .addSelect(
        'media.mediaUrl as imageUrl, media.mediaFileType as mediaFileType,media.fileName, media.mediaThumbnailUrl, media.mediaShortenUrl',
      )
      .leftJoin(
        'additionInfoMedia.media',
        'media',
        'media.id = additionInfoMedia.mediaId AND additionInfoMedia.marketingPageAdditionInfoId = additionInfo.id',
      )
      .orderBy('additionInfo.marketingPageAdditionInfoPosition', 'ASC')
      .andWhere(
        'additionInfo.marketingPageSectionId = :marketingPageSectionId',
        { marketingPageSectionId: marketingPageSectionId },
      );

    const count = await mrkAdditnQueryBuilder.getCount();
    const entities = this.formatOverview(
      await mrkAdditnQueryBuilder.getRawMany(),
      sectionType,
    );
    return { entities, count };
  }

  //Get a record
  async findOne(uuid: string, sectionType: string) {
    let mdQueryBuilder =
      this.marketingAdditonInfoRepository.createQueryBuilder('mrktAditionInfo');

    if (sectionType == 'testimonial') {
      mdQueryBuilder.select(
        'mrktAditionInfo.marketingPageAdditionInfoUuid as id, mrktAditionInfo.marketingPageAdditionInfoName as name, mrktAditionInfo.marketingPageAdditionInfoDescription as testimonial, mrktAditionInfo.marketingPageAdditionInfoCompany as company,mrktAditionInfo.marketingPageAdditionInfoCompanyUrl as companyUrl, mrktAditionInfo.isActive as isActive',
      );
    } else if (sectionType == 'carousel') {
      mdQueryBuilder.select(
        'mrktAditionInfo.marketingPageAdditionInfoUuid as id, mrktAditionInfo.marketingPageAdditionInfoTitle as title, mrktAditionInfo.marketingPageAdditionInfoDescription as description, mrktAditionInfo.marketingPageAdditionInfoButtonText as buttonText,mrktAditionInfo.marketingPageAdditionInfoButtonUrl as buttonUrl,mrktAditionInfo.marketingPageAdditionInfoOrientation as orientation, mrktAditionInfo.isActive as isActive',
      );
    } else if (sectionType == 'overview') {
      let productQuery = await getRepository(Product).createQueryBuilder('product')
      .select('product.productCode as productCode,product.marketingPageInfoId as marketingPageInfoId');

      mdQueryBuilder.select(
        'mrktAditionInfo.marketingPageAdditionInfoUuid as id, mrktAditionInfo.marketingPageAdditionInfoTitle as title, mrktAditionInfo.marketingPageAdditionInfoDescription as description, mrktAditionInfo.marketingPageAdditionInfoButtonText as buttonText, mrktAditionInfo.isActive as isActive,product.productCode',
      );
      mdQueryBuilder.leftJoin(
        '(' + productQuery.getQuery() + ')',
        'product',
        'product.marketingPageInfoId=mrktAditionInfo.id',
      )
    }

    mdQueryBuilder
      .leftJoin('mrktAditionInfo.aditnMedia', 'additionInfoMedia')
      .addSelect(
        'media.mediaUrl as imageUrl, media.mediaFileType as mediaFileType',
      )
      .leftJoin(
        'additionInfoMedia.media',
        'media',
        'media.id = additionInfoMedia.mediaId  AND additionInfoMedia.marketingPageAdditionInfoId = mrktAditionInfo.id',
      )
      .andWhere(
        'mrktAditionInfo.marketingPageAdditionInfoUuid = :marketingPageAdditionInfoUuid',
        { marketingPageAdditionInfoUuid: uuid },
      );

    if (sectionType == 'testimonial') {
      mdQueryBuilder.andWhere(
        'mrktAditionInfo.marketingPageAdditionInfoName IS NOT NULL',
      );
    } else if (sectionType == 'carousel') {
      mdQueryBuilder.andWhere(
        'mrktAditionInfo.marketingPageAdditionInfoTitle IS NOT NULL',
      );
    } else if (sectionType == 'overview') {
      mdQueryBuilder
        .andWhere('mrktAditionInfo.marketingPageAdditionInfoTitle IS NOT NULL')
        .andWhere(
          'mrktAditionInfo.marketingPageAdditionInfoOrientation IS NULL',
        );
    }

    let entity = await mdQueryBuilder.getRawMany();

    entity = this.formatOverview(
      entity,
      sectionType == 'overview' ? 'reportsOverview' : sectionType,
    )[0];

    if (!entity) {
      throw new NotFoundException(sectionType + ' not exist!');
    }
    return entity;
  }

  //Update a record
  async update(uuid: string, updateDto, sectionType: string) {
    const member = this.request.user;

    const mrkAdditionEntity = await this.findByUuid(uuid, sectionType);
    if (!mrkAdditionEntity) {
      throw new NotFoundException('Not exist!');
    }

    let updateData;

    if (sectionType == 'testimonial') {
      updateData = new UpdateTestimonialInfoDto();
      updateData.marketingPageAdditionInfoName = updateDto['name'];
      updateData.marketingPageAdditionInfoDescription =
        updateDto['testimonial'];
      updateData.marketingPageAdditionInfoCompany = updateDto['company'];
      if (updateDto['companyUrl']) {
        updateData.marketingPageAdditionInfoCompanyUrl =
          updateDto['companyUrl'];
      }
    } else if (sectionType == 'carousel') {
      updateData = new UpdateCarouselInfoDto();
      updateData.marketingPageAdditionInfoTitle = updateDto['title'];
      updateData.marketingPageAdditionInfoDescription =
        updateDto['description'];
      updateData.marketingPageAdditionInfoButtonText = updateDto['buttonText'];
     // if (updateDto['buttonUrl']) {
        updateData.marketingPageAdditionInfoButtonUrl = updateDto['buttonUrl'];
     // }
      updateData.marketingPageAdditionInfoOrientation =
        updateDto['orientation'];
    } else if (sectionType == 'overview') {
      updateData = new UpdateCarouselInfoDto();
      updateData.marketingPageAdditionInfoTitle = updateDto['title'];
      updateData.marketingPageAdditionInfoDescription =
        updateDto['description'];
      updateData.marketingPageAdditionInfoButtonText = updateDto['buttonText'];
    }

    updateData.isActive = updateDto.isActive ? updateDto.isActive : false;
    updateData['modifiedOn'] = new Date();
    updateData['modifiedBy'] = member['id'];

    if (updateDto.fileuuid) {
      await this.updateAdditionalMedia(
        mrkAdditionEntity['id'],
        updateDto.fileuuid,
        'image',
      );
    }

    if (sectionType == 'overview' && updateDto.pdfuuid) {
      await this.updateAdditionalMedia(
        mrkAdditionEntity['id'],
        updateDto.pdfuuid,
        'application/pdf',
      );
    }

    return this.marketingAdditonInfoRepository.update(
      { marketingPageAdditionInfoUuid: mrkAdditionEntity['uuid'] },
      updateData,
    );
  }

  //Upload a Image
  async uploadImage(
    marketingPageAdditionInfoId: number,
    fileInfo: UploadImageDto,
  ) {
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirMarketingPageImage',
    )}/${uuid()}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    const media = await this.mediaService.create(fileInfo.fileuuid);

    const record =
      await this.marketingAdditionInfoMediaService.findOneByMarketingAdditionInfoId(
        marketingPageAdditionInfoId,
        'image/png',
      );

    if (record) {
      await this.marketingAdditionInfoMediaService.update(record['id'], {
        mediaId: media.id,
      });
      if (record['mediaId']) {
        await this.mediaService.remove(record['mediaId']);
      }
    } else {
      await this.marketingAdditionInfoMediaService.create({
        marketingPageAdditionInfoId: marketingPageAdditionInfoId,
        mediaId: media.id,
      });
    }

    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Reorder AdditionInfo
  async reorderAdditionInfo(
    marketingPageSectionId: string,
    reordered: ReorderItemDto,
  ) {
    let response;
    let record = await this.marketingAdditonInfoRepository.findOne({
      marketingPageAdditionInfoUuid: reordered.sourceId,
    });

    if (record) {
      response = await this.marketingAdditonInfoRepository.update(
        { marketingPageAdditionInfoUuid: reordered.sourceId },
        { marketingPageAdditionInfoPosition: reordered.sourcePosition },
      );
    }

    record = await this.marketingAdditonInfoRepository.findOne({
      marketingPageAdditionInfoUuid: reordered.destinationId,
    });

    if (record) {
      response = await this.marketingAdditonInfoRepository.update(
        { marketingPageAdditionInfoUuid: reordered.destinationId },
        { marketingPageAdditionInfoPosition: reordered.destinationPosition },
      );
    }

    return response;
  }

  //Delete a record
  async remove(uuid: string) {
    const record = await this.marketingAdditonInfoRepository.findOne({
      marketingPageAdditionInfoUuid: uuid,
    });

    if (!record) {
      throw new UnprocessableEntityException('Record not exist!');
    }

    const secQueryBuild = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as marketingPageSectionId, mrktPageSec.marketingPageSectionName as sectionName, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .andWhere('mrktPageSec.id = :id', {
        id: record['marketingPageSectionId'],
      });

    const sectionData = await secQueryBuild.getRawOne();
    await this.marketingAdditionInfoMediaService.removeByMarketingInfoId(
      record['id'],
      sectionData['sectionType'],
    );
    const response = await this.marketingAdditonInfoRepository.delete(
      record['id'],
    );
    await this.eventEmitter.emitAsync('deleteMaktTestimonial', {
      record: record,
    });
    return response;
  }

  //Upload a Pdf
  async uploadPdf(marketingPageAdditionInfoId: number, pdfInfo: UploadPdfDto) {
    await this.mediaService.validateFileUuid(pdfInfo.fileuuid);
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      pdfInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyPdf(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      pdfInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirMarketingPageReportOverviewPdf',
    )}/${uuid()}/${pdfInfo.fileuuid}/${pdfInfo.fileName}`;

    await this.mediaService.createPdf(pdfInfo.fileuuid);

    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Formar Overview Data
  formatOverview(list, sectionType) {
    let ids = [];
    let newList = [];
    let imageList = list.filter(function (item) {
      return item.mediaFileType != 'application/pdf' && item.imageUrl;
    });
    for (let i = 0; i < list.length; i++) {
      const index = ids.indexOf(list[i].id);
      if (index == -1) {
        ids.push(list[i].id);

        if (sectionType == 'reportsOverview') {
          // if(list[i].mediaFileType == 'application/pdf') list[i]['pdfUrl'] = list[i].imageUrl;
          // else list[i]['pdfUrl'] = null;
          if (list[i].mediaFileType == 'application/pdf') {
            list[i]['pdfUrl'] = list[i].imageUrl;
            if (!imageList.length) {
              list[i]['imageUrl'] = null;
            }
          } else {
            list[i]['pdfUrl'] = null;
          }
        }
        delete list[i].mediaFileType;
        newList.push(list[i]);
      } else {
        // if(list[i].mediaFileType == 'application/pdf' && list[i].imageUrl) newList[index]['pdfUrl'] = list[i].imageUrl;
        // else if(list[i].imageUrl){
        //   newList[index]['imageUrl'] = list[i].imageUrl;
        // }
        if (list[i].imageUrl) {
          if (list[i].mediaFileType == 'application/pdf') {
            newList[index]['pdfUrl'] = list[i].imageUrl;
          } else {
            newList[index]['imageUrl'] = list[i].imageUrl;
          }
        }
      }
    }

    return newList;
  }

  //Get record by marketingPageAdditionInfoUuid
  async findByUuid(uuid: string, sectionType: string) {
    let mdQueryBuilder =
      this.marketingAdditonInfoRepository.createQueryBuilder('mrktAditionInfo');

    if (sectionType == 'testimonial') {
      mdQueryBuilder.select(
        'mrktAditionInfo.id as id,mrktAditionInfo.marketingPageAdditionInfoUuid as uuid, mrktAditionInfo.marketingPageAdditionInfoName as name, mrktAditionInfo.marketingPageAdditionInfoDescription as testimonial, mrktAditionInfo.marketingPageAdditionInfoCompany as company,mrktAditionInfo.marketingPageAdditionInfoCompanyUrl as companyUrl, mrktAditionInfo.isActive as isActive',
      );
    } else if (sectionType == 'carousel') {
      mdQueryBuilder.select(
        'mrktAditionInfo.id as id, mrktAditionInfo.marketingPageAdditionInfoUuid as uuid, mrktAditionInfo.marketingPageAdditionInfoTitle as title, mrktAditionInfo.marketingPageAdditionInfoDescription as description, mrktAditionInfo.marketingPageAdditionInfoButtonText as buttonText,mrktAditionInfo.marketingPageAdditionInfoOrientation as orientation, mrktAditionInfo.isActive as isActive',
      );
    } else if (sectionType == 'overview') {
      mdQueryBuilder.select(
        'mrktAditionInfo.id as id, mrktAditionInfo.marketingPageAdditionInfoUuid as uuid, mrktAditionInfo.marketingPageAdditionInfoTitle as title, mrktAditionInfo.marketingPageAdditionInfoDescription as description, mrktAditionInfo.marketingPageAdditionInfoButtonText as buttonText, mrktAditionInfo.isActive as isActive',
      );
    }

    mdQueryBuilder
      .leftJoin('mrktAditionInfo.aditnMedia', 'additionInfoMedia')
      .leftJoin(
        'additionInfoMedia.media',
        'media',
        'media.id = additionInfoMedia.mediaId  AND additionInfoMedia.marketingPageAdditionInfoId = mrktAditionInfo.id',
      )
      .addSelect(
        'media.mediaUrl as imageUrl, media.mediaFileType as mediaFileType',
      )
      .andWhere(
        'mrktAditionInfo.marketingPageAdditionInfoUuid = :marketingPageAdditionInfoUuid',
        { marketingPageAdditionInfoUuid: uuid },
      );

    if (sectionType == 'testimonial') {
      mdQueryBuilder.andWhere(
        'mrktAditionInfo.marketingPageAdditionInfoName IS NOT NULL',
      );
    } else if (sectionType == 'carousel') {
      mdQueryBuilder.andWhere(
        'mrktAditionInfo.marketingPageAdditionInfoTitle IS NOT NULL',
      );
    } else if (sectionType == 'overview') {
      mdQueryBuilder
        .andWhere('mrktAditionInfo.marketingPageAdditionInfoTitle IS NOT NULL')
        .andWhere(
          'mrktAditionInfo.marketingPageAdditionInfoOrientation IS NULL',
        );
    }

    let entity = await mdQueryBuilder.getRawMany();
    entity = this.formatOverview(
      entity,
      sectionType == 'overview' ? 'reportsOverview' : sectionType,
    )[0];

    if (!entity) {
      throw new NotFoundException(sectionType + ' not exist!');
    }
    return entity;
  }

  //Get AdditionalInfo Data
  async getAdditionalInfo(fields: any) {
    const record = await this.marketingAdditonInfoRepository.findOne({
      where: fields,
    });
    return record;
  }

  //Delete a Image
  async removeImage(marketingPageAdditionInfoId) {
    const additionInfo = await this.getAdditionalInfo({
      marketingPageAdditionInfoUuid: marketingPageAdditionInfoId,
    });
    const record =
      await this.marketingAdditionInfoMediaService.findOneByMarketingAdditionInfoId(
        additionInfo?.id,
        'image',
      );
    if (record && record['mediaId']) {
      await this.marketingAdditionInfoMediaService.removeByMarketingInfoIdAndMediaId(
        record['marketingPageAdditionInfoId'],
        record['mediaId'],
      );
      return await this.mediaService.remove(record['mediaId']);
    }
    return;
  }

  //Delete a Pdf
  async removePdf(marketingPageAdditionInfoId) {
    const additionInfo = await this.getAdditionalInfo({
      marketingPageAdditionInfoUuid: marketingPageAdditionInfoId,
    });
    const record =
      await this.marketingAdditionInfoMediaService.findOneByMarketingAdditionInfoId(
        additionInfo?.id,
        'application/pdf',
      );
    if (record && record['mediaId']) {
      await this.marketingAdditionInfoMediaService.removeByMarketingInfoIdAndMediaId(
        record['marketingPageAdditionInfoId'],
        record['mediaId'],
      );
      return await this.mediaService.remove(record['mediaId']);
    }
    return;
  }
}
