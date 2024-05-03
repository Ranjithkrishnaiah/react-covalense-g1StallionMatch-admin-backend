import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { MarketingPageHomeData } from './entities/marketing-page-home.entity';
import { MarketingPage } from './entities/marketing-page.entity';
import { v4 as uuid } from 'uuid';
import { MediaService } from 'src/media/media.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ConfigService } from '@nestjs/config';
import { MarketingFileUploadUrlDto } from './dto/marketing-file-upload.dto';
import { MarketingPageSection } from './entities/marketing-page-section.entity';
import { MarketingMediaService } from 'src/marketing-media/marketing-media.service';
import { MarketingAdditonInfoService } from 'src/marketing-addition-info/marketing-addition-info.service';
import { MarketingMedia } from 'src/marketing-media/entities/marketing-media.entity';
import { MarketingTilePermissions } from './entities/marketing-tile-permissions.entity';
import { StallionsService } from 'src/stallions/stallions.service';
import { FarmsService } from 'src/farms/farms.service';
import { UpdateMarketingStallionDto } from './dto/update-marketing-stallion.dto';
import { StallionInfoResponseDto } from 'src/stallions/dto/stallion-info-response.dto';
import { UpdateMarketingFarmDto } from './dto/update-marketing-farm.dto';
import { FarmInfoResDto } from 'src/farms/dto/farm-info-res.dto';
import { MarketingFilePdfUploadUrlDto } from './dto/marketing-file-pdf-upload.dto';
import { Runner } from 'src/runner/entities/runner.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { StallionTestimonialsService } from 'src/stallion-testimonials/stallion-testimonials.service';
import { UpdateStallionTestimonialMarketingDto } from './dto/update-stallion-testimonial-marketing.dto';
import { StallionTestimonialMediaService } from 'src/stallion-testimonial-media/stallion-testimonial-media.service';
import { UpdateTestimonialDto } from 'src/stallion-testimonials/dto/update-testimonial.dto';
import { CreatieStallionTestimonialMarketingDto } from './dto/create-stallion-testimonial-marketing.dto';
import { CreateStallionTestimonialDto } from 'src/stallion-testimonials/dto/create-stallion-testimonial.dto';
import { HorsesService } from 'src/horses/horses.service';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { FarmMediaInfoService } from 'src/farm-media-info/farm-media-info.service';
import { CreatieFarmMediaMarketingDto } from './dto/create-farm-media-marketing.dto';
import { CreateMediaDto } from 'src/farm-media-info/dto/create-media.dto';

@Injectable()
export class MarketingPageHomeService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MarketingPageHomeData)
    private marketingPageHomeDataRepository: Repository<MarketingPageHomeData>,
    private readonly mediaService: MediaService,
    private readonly fileUploadsService: FileUploadsService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    private readonly marketingMediaService: MarketingMediaService,
    private readonly marketingAdditonInfoService: MarketingAdditonInfoService,
    private readonly stallionsService: StallionsService,
    private readonly farmService: FarmsService,
    private readonly stallionTestimonialsService: StallionTestimonialsService,
    private readonly stallionTestimonialMediaService: StallionTestimonialMediaService,
    private readonly horseService: HorsesService,
    private readonly farmMediaInfoService: FarmMediaInfoService,
  ) {}

  /* Add marketing page data like heading, hero image, banner1 and banner2 etc. */
  async create(createMarketingPageData) {
    const member = this.request.user;
    createMarketingPageData['marketingPageDataUuid'] = uuid();
    createMarketingPageData['createdBy'] = member['id'];

    const createResponse = await this.marketingPageHomeDataRepository.save(
      this.marketingPageHomeDataRepository.create(createMarketingPageData),
    );

    return createResponse;
  }

  /* Update marketing page data like heading, hero image, banner1 and banner2 etc.  */
  async update(marketingPageUuid: string, updateMarketingPageData) {
    const page = await this.getPageByUuid(marketingPageUuid);

    const secQueryBuild = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as marketingPageSectionId, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionName as sectionName, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .andWhere('mrktPageSec.marketingPageId = :marketingPageId', {
        marketingPageId: page['marketingPageId'],
      });

    const sectionData = await secQueryBuild.getRawMany();

    const response = await this.formatUpdateData(
      page,
      sectionData,
      updateMarketingPageData,
    );

    return response;
  }

  /* Get the marketing page data data like heading, hero image, banner1 and banner2 etc. with page(Home, stalliom match, Trends, Reports overview) uuid */
  async findByUuId(marketingPageUuid: string, options = {}) {
    const page = await this.getPageByUuid(marketingPageUuid);

    let mmQueryBuilder = getRepository(MarketingMedia)
      .createQueryBuilder('mm')
      .select(
        'mm.marketingPageId as marketingPageId, mm.marketingPageSectionId as marketingPageSectionId, media.mediaUrl as mediaUrl',
      )
      .innerJoin(
        'mm.media',
        'media',
        'media.id=mm.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    let marktQueryBuilder = getRepository(MarketingPageHomeData)
      .createQueryBuilder('mrktPageHomeData')
      .select(
        'mrktPageHomeData.id as id, mrktPageHomeData.marketingPageId as marketingPageId, mrktPageHomeData.marketingPageSectionId as marketingPageSectionId, mrktPageHomeData.marketingPageTitle as marketingPageTitle, mrktPageHomeData.marketingPageDescription as marketingPageDescription, mrktPageHomeData.marketingPageDescription1 as bannerDescription1, mrktPageHomeData.marketingPageDescription2 as bannerDescription2, mrktPageHomeData.marketingPageDescription3 as bannerDescription3, mrktPageHomeData.marketingPageButtonText as buttonText, mrktPageHomeData.marketingPageButtonUrl as buttonUrl, mrktPageHomeData.marketingPageTarget as marketingPageTarget, mrktPageHomeData.marketingPagePlaceholder as marketingPagePlaceholder, mrktPageHomeData.isRegistered as isRegistered, mrktPageHomeData.isAnonymous as isAnonymous,mmImage.mediaUrl as bgImage',
      )
      .addSelect(
        'marktPageSec.marketingPageSectionName as sectionName,marktPageSec.marketingPageSectionType as sectionType,marktPageSec.marketingPageSectionUuid as marketingPageSectionUuid',
      )
      .innerJoin('mrktPageHomeData.marketingPageSection', 'marktPageSec')
      .leftJoin(
        '(' + mmQueryBuilder.getQuery() + ')',
        'mmImage',
        'mmImage.marketingPageId=mrktPageHomeData.marketingPageId AND mmImage.marketingPageSectionId=mrktPageHomeData.marketingPageSectionId',
      )
      .andWhere('mrktPageHomeData.marketingPageId = :marketingPageId', {
        marketingPageId: page['marketingPageId'],
      });

    const entities = await marktQueryBuilder.getRawMany();

    if (!entities || entities.length == 0) {
      const query = getRepository(MarketingPageSection)
        .createQueryBuilder('mrktPageSec')
        .select(
          'mrktPageSec.id as marketingPageSectionId, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionName as sectionName, mrktPageSec.marketingPageSectionType as sectionType, mrktPageSec.marketingPageSectionUuid as marketingPageSectionUuid',
        )
        .andWhere('mrktPageSec.marketingPageId = :marketingPageId', {
          marketingPageId: page['marketingPageId'],
        });

      const data = await query.getRawMany();
      return this.formatResponse(page, data, options);
    }
    return this.formatResponse(page, entities, options);
  }

  /* Get the marketing page section like heading, hero image, banner1 and banner2 etc. by marketingPageSectionId and marketingPageId */
  async findByIdAndSectionId(
    marketingPageSectionId: number,
    marketingPageId: number,
  ) {
    let marktQueryBuilder = getRepository(MarketingPageHomeData)
      .createQueryBuilder('mrktPageHomeData')
      .select(
        'mrktPageHomeData.id as id, mrktPageHomeData.marketingPageId as marketingPageId, mrktPageHomeData.marketingPageSectionId as marketingPageSectionId, mrktPageHomeData.marketingPageTitle as marketingPageTitle, mrktPageHomeData.marketingPageDescription as marketingPageDescription, mrktPageHomeData.marketingPageDescription1 as bannerDescription1, mrktPageHomeData.marketingPageDescription2 as bannerDescription2, mrktPageHomeData.marketingPageDescription3 as bannerDescription3, mrktPageHomeData.marketingPageButtonText as buttonText, mrktPageHomeData.marketingPageButtonUrl as buttonUrl, mrktPageHomeData.marketingPageTarget as marketingPageTarget, mrktPageHomeData.marketingPagePlaceholder as marketingPagePlaceholder, mrktPageHomeData.isAuthenticated as isAuthenticated',
      )
      .andWhere('mrktPageHomeData.marketingPageId = :marketingPageId', {
        marketingPageId: marketingPageId,
      })
      .andWhere(
        'mrktPageHomeData.marketingPageSectionId = :marketingPageSectionId',
        { marketingPageSectionId: marketingPageSectionId },
      );

    const entity = await marktQueryBuilder.getRawOne();
    return entity;
  }

  /* Upload image for page section like heading, hero image, banner1 and banner2 etc. */
  async imageUpload(fileInfo: MarketingFileUploadUrlDto) {
    const member = this.request.user;
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    //Validate allowed file format or not
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImagesIncludingGifAndMp4(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );

    let secQueryBuilder = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as id, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .andWhere(
        'mrktPageSec.marketingPageSectionUuid = :marketingPageSectionUuid',
        { marketingPageSectionUuid: fileInfo.marketingPageSectionUuid },
      );

    const entity = await secQueryBuilder.getRawOne();

    if (!entity) {
      throw new NotFoundException('Not exist!');
    }

    if (entity['sectionType'] === 'clientLogos') {
      const createClientLogo = {
        marketingPageSectionId: fileInfo.marketingPageSectionUuid,
        fileInfo: {
          fileName: fileInfo.fileName,
          fileuuid: fileInfo.fileuuid,
          fileSize: fileInfo.fileSize,
        },
      };
      const clientLog = await this.marketingAdditonInfoService.create(
        createClientLogo,
        'clientLogos',
      );
      return { url: clientLog['bgImage'] };
    }

    const fileKey = `${this.configService.get(
      'file.s3DirMarketingPageImage',
    )}/${uuid()}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    const media = await this.mediaService.create(fileInfo.fileuuid);

    const mrktMedia =
      await this.marketingMediaService.findOneByMarketingPageIdAndSectionId(
        entity['marketingPageId'],
        entity['id'],
      );

    if (mrktMedia && mrktMedia['marketingMediaId']) {
      const updateMrktMedia = await this.marketingMediaService.update(
        mrktMedia['marketingMediaId'],
        {
          marketingPageId: entity['marketingPageId'],
          marketingPageSectionId: entity['id'],
          mediaId: media.id,
        },
      );
    } else {
      const createMrktMedia = await this.marketingMediaService.create({
        marketingPageId: entity['marketingPageId'],
        marketingPageSectionId: entity['id'],
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

  /* Upload Pdf for reports */
  async uploadPdf(pdfInfo: MarketingFilePdfUploadUrlDto) {
    let secQueryBuilder = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as id, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .andWhere(
        'mrktPageSec.marketingPageSectionUuid = :marketingPageSectionUuid',
        { marketingPageSectionUuid: pdfInfo.marketingPageSectionUuid },
      );

    const entity = await secQueryBuilder.getRawOne();

    if (!entity) {
      throw new NotFoundException('Not exist!');
    }

    await this.mediaService.validateFileUuid(pdfInfo.fileuuid);
    //Validate allowed file format or nota
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

    const media = await this.mediaService.createPdf(pdfInfo.fileuuid);

    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  /* Delete image for page section like heading, hero image, banner1 and banner2 etc. */
  async deleteImage(marketingPageSectionUuid: string) {
    let secQueryBuilder = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as id, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .andWhere(
        'mrktPageSec.marketingPageSectionUuid = :marketingPageSectionUuid',
        { marketingPageSectionUuid: marketingPageSectionUuid },
      );

    const entity = await secQueryBuilder.getRawOne();

    if (!entity) {
      throw new NotFoundException('Not exist!');
    }

    const mrktMedia =
      await this.marketingMediaService.findOneByMarketingPageIdAndSectionId(
        entity['marketingPageId'],
        entity['id'],
      );

    if (mrktMedia && mrktMedia['marketingMediaId']) {
      return await this.marketingMediaService.remove(
        mrktMedia['marketingMediaId'],
      );
    } else {
      throw new NotFoundException('Image Not exist!');
    }
  }

  /*Get a page by uuid */
  async getPageByUuid(marketingPageUuid: string) {
    let pageQueryBuilder = getRepository(MarketingPage)
      .createQueryBuilder('mrktPage')
      .select(
        'mrktPage.id as marketingPageId, mrktPage.marketingPageName as marketingPageName, mrktPage.pagePrefix as pagePrefix',
      )
      .andWhere('mrktPage.marketingPageUuid = :marketingPageUuid', {
        marketingPageUuid: marketingPageUuid,
      });

    const page = await pageQueryBuilder.getRawOne();
    if (!page) {
      throw new NotFoundException('Page not found!');
    }

    return page;
  }

  /* Formate for response - page section like heading, hero image, banner1, banner2, header and footer etc. */
  async formatResponse(page, secList, options) {
    let newFormat = {};

    for (let i = 0; i < secList.length; i++) {
      const secData = secList[i];
      if (secData.sectionType === 'mainHeading') {
        newFormat['mainHeading'] = this.formatMainHeading(
          page['pagePrefix'],
          secData,
        );
      } else if (secData.sectionType === 'heroImage') {
        newFormat['heroImage'] = this.formatHeroImage(
          page['pagePrefix'],
          secData,
        );
      } else if (secData.sectionType === 'banner1') {
        newFormat['banner1'] = this.formatBanner1(page['pagePrefix'], secData);
      } else if (secData.sectionType === 'banner2') {
        newFormat['banner2'] = this.formatBanner2(secData);
      } else if (secData.sectionType === 'headerBannerRegistered') {
        newFormat['headerBannerRegistered'] =
          this.formatHeaderFooterBannerRegistered(secData);
      } else if (secData.sectionType === 'footerBannerRegistered') {
        newFormat['footerBannerRegistered'] =
          this.formatHeaderFooterBannerRegistered(secData);
      } else if (secData.sectionType === 'headerBanner') {
        newFormat['headerBanner'] = this.formatHeaderFooterBanner(
          secData,
        );
      } else if (secData.sectionType === 'footerBanner') {
        newFormat['footerBanner'] = this.formatHeaderFooterBanner(
          secData,
        );
      } else if (secData.sectionType === 'reportsOverview') {
        newFormat['overview'] = await this.getAdditonInfo(
          page['marketingPageId'],
          'overview',
          options,
        );
      } else if (secData.sectionType === 'racehorse') {
        newFormat['racehorse'] = await this.getAdditonInfo(
          page['marketingPageId'],
          secData.sectionType,
          options,
        );
      }
    }

    if (
      page['pagePrefix'] === 'page_reports_overview' ||
      page['pagePrefix'] === 'racehorse_page'
    ) {
      return newFormat;
    }

    if (page['pagePrefix'] === 'page_stallion_match_farm') {
      newFormat['clientLogos'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'clientLogos',
        options,
      );
      newFormat['freePricingTile'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'freePricingTile',
        options,
      );
      newFormat['promotedPricingTile'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'promotedPricingTile',
        options,
      );
    }

    if (page['pagePrefix'] === 'page_trends') {
      newFormat['tilePermissions'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'tilePermissions',
        options,
      );
    }

    if (page['pagePrefix'] !== 'page_trends') {
      newFormat['testimonials'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'testimonial',
        options,
      );
      newFormat['carasouls'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'carousel',
        options,
      );
    }

    return newFormat;
  }

  /* Formate response for page section mail heading */
  formatMainHeading(pagePrefix, mainHding) {
    let mainHeadingRes = {
      sectionName: mainHding.sectionName,
      marketingPageSectionUuid: mainHding.marketingPageSectionUuid,
      title: mainHding.marketingPageTitle ? mainHding.marketingPageTitle : '',
      description: mainHding.marketingPageDescription
        ? mainHding.marketingPageDescription
        : '',
      bgImage: mainHding.bgImage ? mainHding.bgImage : '',
    };
    if (pagePrefix === 'page_stallion_match_farm') {
      mainHeadingRes['emailAddress'] = mainHding.marketingPagePlaceholder
        ? mainHding.marketingPagePlaceholder
        : '';
      mainHeadingRes['buttonTarget'] = mainHding.marketingPageTarget
        ? mainHding.marketingPageTarget
        : '';
    }

    return mainHeadingRes;
  }

  /* Formate response for page section Hero image */
  formatHeroImage(pagePrefix, heroImg) {
    let heroImageRes = {
      sectionName: heroImg.sectionName,
      marketingPageSectionUuid: heroImg.marketingPageSectionUuid,
    };
    if (pagePrefix === 'page_home') {
      heroImageRes['title'] = heroImg.marketingPageTitle
        ? heroImg.marketingPageTitle
        : '';
    } else if (pagePrefix === 'page_stallion_match_farm') {
      heroImageRes['imageName'] = heroImg.bgImage ? heroImg.bgImage : '';
    }

    return heroImageRes;
  }

  /* Formate response for page section Banner1 */
  formatBanner1(pagePrefix, bnr1) {
    let banner1Res = {
      sectionName: bnr1.sectionName,
      marketingPageSectionUuid: bnr1.marketingPageSectionUuid,
      title: bnr1.marketingPageTitle ? bnr1.marketingPageTitle : '',
      bgImage: bnr1.bgImage ? bnr1.bgImage : '',
    };
    if (pagePrefix === 'page_home') {
      banner1Res['description1'] = bnr1.bannerDescription1
        ? bnr1.bannerDescription1
        : '';
      banner1Res['description2'] = bnr1.bannerDescription2
        ? bnr1.bannerDescription2
        : '';
      banner1Res['description3'] = bnr1.bannerDescription3
        ? bnr1.bannerDescription3
        : '';
    } else if (pagePrefix === 'page_stallion_match_farm') {
      banner1Res['description'] = bnr1.marketingPageDescription
        ? bnr1.marketingPageDescription
        : '';
      banner1Res['buttonText'] = bnr1.buttonText ? bnr1.buttonText : '';
      banner1Res['buttonTarget'] = bnr1.buttonTarget ? bnr1.buttonTarget : '';
    }

    return banner1Res;
  }

  /* Formate response for page section Banner2 */
  formatBanner2(bnr2) {
    return {
      sectionName: bnr2.sectionName,
      marketingPageSectionUuid: bnr2.marketingPageSectionUuid,
      title: bnr2.marketingPageTitle ? bnr2.marketingPageTitle : '',
      description: bnr2.marketingPageDescription
        ? bnr2.marketingPageDescription
        : '',
      buttonText: bnr2.buttonText ? bnr2.buttonText : '',
      buttonTarget: bnr2.marketingPageTarget ? bnr2.marketingPageTarget : '',
      bgImage: bnr2.bgImage ? bnr2.bgImage : '',
    };
  }

  /* Formate data to update page section Main heading */
  formatUpdateMainHeading(pagePrefix, mainHeading) {
    let mainHeadingRes = {
      marketingPageTitle: mainHeading.title ? mainHeading.title : '',
      marketingPageDescription: mainHeading.description
        ? mainHeading.description
        : '',
    };
    if (pagePrefix === 'page_stallion_match_farm') {
      mainHeadingRes['marketingPagePlaceholder'] = mainHeading.emailAddress
        ? mainHeading.emailAddress
        : '';
      mainHeadingRes['marketingPageTarget'] = mainHeading.buttonTarget
        ? mainHeading.buttonTarget
        : '';
    }

    return mainHeadingRes;
  }

  /* Formate data to update page section Hero image */
  formatUpdateHeroImage(heroImage) {
    return {
      marketingPageTitle: heroImage.title,
    };
  }

  /* Formate data to update page section Banner1 */
  formatUpdateBanner1(pagePrefix, banner1) {
    let banner1Res = {
      marketingPageTitle: banner1.title ? banner1.title : '',
    };
    if (pagePrefix === 'page_home') {
      banner1Res['marketingPageDescription1'] = banner1.bannerDescription1
        ? banner1.bannerDescription1
        : '';
      banner1Res['marketingPageDescription2'] = banner1.bannerDescription2
        ? banner1.bannerDescription2
        : '';
      banner1Res['marketingPageDescription3'] = banner1.bannerDescription3
        ? banner1.bannerDescription3
        : '';
    } else if (pagePrefix === 'page_stallion_match_farm') {
      banner1Res['marketingPageDescription'] = banner1.description
        ? banner1.description
        : '';
      banner1Res['marketingPageButtonText'] = banner1.buttonText
        ? banner1.buttonText
        : '';
      banner1Res['marketingPageTarget'] = banner1.buttonTarget
        ? banner1.buttonTarget
        : '';
    }
    return banner1Res;
  }

  /* Formate data to update page section Banner1 */
  formatUpdateBanner2(banner2) {
    return {
      marketingPageTitle: banner2.title,
      marketingPageDescription: banner2.description,
      marketingPageButtonText: banner2.buttonText,
      marketingPageTarget: banner2.buttonTarget,
    };
  }

  /* Formate data to update page section header footer banner for registered user */
  formatUpdateHeaderFooterBannerRegistered(headerOrFooter) {
    return {
      marketingPageTitle: headerOrFooter.title,
      marketingPageDescription: headerOrFooter.description,
      marketingPageButtonText: headerOrFooter.buttonText,
      marketingPageButtonUrl: headerOrFooter.buttonUrl,
      isRegistered: headerOrFooter.isRegistered,
    };
  }

  /* Formate data to update page section header footer banner for anonymous user */
  formatUpdateHeaderFooterBanner(headerOrFooter) {
    return {
      marketingPageTitle: headerOrFooter.title,
      marketingPageDescription: headerOrFooter.description,
      marketingPageButtonText: headerOrFooter.buttonText,
      marketingPageButtonUrl: headerOrFooter.buttonUrl,
      isAnonymous: headerOrFooter.isAnonymous,
    };
  }

  /* Formate data to create Main header */
  formatNewMainHeading(pagePrefix, mainHding) {
    let mainHeadingRes = {
      marketingPageTitle: mainHding.title,
      marketingPageId: mainHding.marketingPageId,
      marketingPageSectionId: mainHding.marketingPageSectionId,
      marketingPageDescription: mainHding.description,
      isAuthenticated: false,
    };
    if (pagePrefix === 'page_stallion_match_farm') {
      mainHeadingRes['marketingPagePlaceholder'] = mainHding.emailAddress;
      mainHeadingRes['marketingPageTarget'] = mainHding.buttonText;
    }

    return mainHeadingRes;
  }

  /* Formate data to create Hero image */
  formatNewHeroImage(pagePrefix, heroImg) {
    let heroImageRes = {
      marketingPageId: heroImg.marketingPageId,
      marketingPageSectionId: heroImg.marketingPageSectionId,
      isAuthenticated: false,
    };
    if (pagePrefix === 'page_home') {
      heroImageRes['marketingPageTitle'] = heroImg.title;
    } else if (pagePrefix === 'page_stallion_match_farm') {
      heroImageRes['marketingPageTitle'] = '';
    }

    return heroImageRes;
  }

  /* Formate data to create Banner1 */
  formatNewBanner1(pagePrefix, bnr1) {
    let banner1Res = {
      marketingPageTitle: bnr1.title,
      marketingPageId: bnr1.marketingPageId,
      marketingPageSectionId: bnr1.marketingPageSectionId,
      isAuthenticated: false,
    };
    if (pagePrefix === 'page_home') {
      banner1Res['marketingPageDescription1'] = bnr1.bannerDescription1;
      banner1Res['marketingPageDescription2'] = bnr1.bannerDescription2;
      banner1Res['marketingPageDescription3'] = bnr1.bannerDescription3;
    } else if (pagePrefix === 'page_stallion_match_farm') {
      banner1Res['marketingPageDescription'] = bnr1.description;
      banner1Res['marketingPageButtonText'] = bnr1.buttonText;
      banner1Res['marketingPageTarget'] = bnr1.buttonTarget;
    }

    return banner1Res;
  }

  /* Formate data to create Banner2 */
  formatNewBanner2(bnr2) {
    let banner1Res = {
      marketingPageTitle: bnr2.title,
      marketingPageId: bnr2.marketingPageId,
      marketingPageSectionId: bnr2.marketingPageSectionId,
      marketingPageDescription: bnr2.description,
      marketingPageButtonText: bnr2.buttonText ? bnr2.buttonText : '',
      marketingPageButtonUrl: bnr2.buttonUrl ? bnr2.buttonUrl : '',
      marketingPageTarget: bnr2.buttonTarget,
      isAuthenticated: false,
    };

    return banner1Res;
  }

  /* Formate header or footer for registered user */
  formatHeaderFooterBannerRegistered(headerOrFooter) {
    const headerFooterRes = {
      sectionName: headerOrFooter.sectionName,
      marketingPageSectionUuid: headerOrFooter.marketingPageSectionUuid,
      title: headerOrFooter.marketingPageTitle
        ? headerOrFooter.marketingPageTitle
        : '',
      description: headerOrFooter.marketingPageDescription
        ? headerOrFooter.marketingPageDescription
        : '',
      buttonText: headerOrFooter.buttonText ? headerOrFooter.buttonText : '',
      buttonUrl: headerOrFooter.buttonUrl ? headerOrFooter.buttonUrl : '',
      isRegistered: headerOrFooter.isRegistered
        ? headerOrFooter.isRegistered
        : false,
    };

    return headerFooterRes;
  }

  /* Formate header or footer for anonymous user */
  formatHeaderFooterBanner(headerOrFooter) {
    const headerFooterRes = {
      sectionName: headerOrFooter.sectionName,
      marketingPageSectionUuid: headerOrFooter.marketingPageSectionUuid,
      title: headerOrFooter.marketingPageTitle
        ? headerOrFooter.marketingPageTitle
        : '',
      description: headerOrFooter.marketingPageDescription
        ? headerOrFooter.marketingPageDescription
        : '',
      buttonText: headerOrFooter.buttonText ? headerOrFooter.buttonText : '',
      buttonUrl: headerOrFooter.buttonUrl ? headerOrFooter.buttonUrl : '',
      isAnonymous: headerOrFooter.isAnonymous
        ? headerOrFooter.isAnonymous
        : false,
    };

    return headerFooterRes;
  }

  /* Formate header or footer */
  formatNewHeaderFooterBanner(headerOrFooter) {
    return {
      marketingPageTitle: headerOrFooter.title,
      marketingPageDescription: headerOrFooter.description,
      marketingPageButtonText: headerOrFooter.buttonText,
      marketingPageButtonUrl: headerOrFooter.buttonUrl,
      isAuthenticated: headerOrFooter.isRegistered,
      isAnonymous: headerOrFooter.isAnonymous,
    };
  }

  /* Get Additinal info like testimonial, carousel, overview, clientLogos and tilePermissions etc.*/
  async getAdditonInfo(marketingPageId: number, secType: string, options) {
    let secPageQueryBuilder = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as id, mrktPageSec.marketingPageId as marketingPageId,mrktPageSec.marketingPageSectionType as sectionType,mrktPageSec.marketingPageSectionUuid as marketingPageSectionUuid',
      )
      .andWhere('mrktPageSec.marketingPageId = :marketingPageId', {
        marketingPageId: marketingPageId,
      });

    if (secType == 'testimonial') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'testimonial'",
      );
    } else if (secType == 'carousel') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'carousel'",
      );
    } else if (secType == 'overview') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'reportsOverview'",
      );
    } else if (secType == 'clientLogos') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'clientLogos'",
      );
    } else if (secType == 'tilePermissions') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'tilePermissions'",
      );
    } else if (secType == 'freePricingTile') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'freePricingTile'",
      );
    } else if (secType == 'promotedPricingTile') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'promotedPricingTile'",
      );
    } else if (secType == 'racehorse') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'racehorse'",
      );
    }

    const section = await secPageQueryBuilder.getRawOne();
    if (
      secType == 'tilePermissions' ||
      secType == 'freePricingTile' ||
      secType == 'promotedPricingTile'
    ) {
      const tiles = await this.getTilePermissions(
        section['id'],
        section['sectionType'],
      );
      return {
        marketingPageSectionId: section['marketingPageSectionUuid'],
        list: tiles,
      };
    } else if (secType == 'racehorse') {
      const raceHorses = await this.getRaceHorses(
        section['id'],
        section['sectionType'],
        options,
      );
      return {
        marketingPageSectionId: section['marketingPageSectionUuid'],
        list: raceHorses,
      };
    } else {
      const additonalInfo =
        await this.marketingAdditonInfoService.findAllByMarketingPageSectionIdAndSectionType(
          section['id'],
          section['sectionType'],
        );
      return {
        marketingPageSectionId: section['marketingPageSectionUuid'],
        list: additonalInfo.entities,
      };
    }
  }

  /* Get Raceh horse.*/
  // It will remove once race horse logic will be implemented.
  async getRaceHorses(marketingPageId: number, secType: string, options) {
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireHorse.horseName as sireName, sireHorse.id as sirePedigreeId',
      );

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select('damHorse.horseName as damName, damHorse.id as damPedigreeId');

    let queryBuilder = getRepository(Runner)
      .createQueryBuilder('raceHorse')
      .select('raceHorse.runnerUuid as runnerId, raceHorse.createdOn')
      .addSelect(
        'horse.horseUuid as horseId, horse.horseName, horse.isActive, horse.yob, sire.sireName, dam.damName',
      )
      .addSelect('country.countryCode as countryCode')
      .addSelect('races.raceDate as raceDate,races.raceUuid as raceId')
      .innerJoin('raceHorse.horses', 'horse')
      .innerJoin('raceHorse.races', 'races')
      .leftJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sirePedigreeId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damPedigreeId=horse.damId',
      );

    if (options.limit) {
      queryBuilder.offset(options.skip).limit(options.limit);
    }
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Formate data to update */
  async formatUpdateData(page, secList, updateMarketingPageData) {
    let updtateMainHeading,
      updtateHeroImage,
      updtateBanner1,
      updtateBanner2,
      updtateHeaderBanner,
      updtateFooterBanner,
      updtateTilePermission;

    for (let i = 0; i < secList.length; i++) {
      const sec = secList[i];
      const homeData = await this.findByIdAndSectionId(
        sec.marketingPageSectionId,
        sec.marketingPageId,
      );

      if (homeData) {
        if (
          sec.sectionType === 'mainHeading' &&
          updateMarketingPageData.mainHeading
        ) {
          updtateMainHeading =
            await this.marketingPageHomeDataRepository.update(
              { id: homeData.id },
              this.formatUpdateMainHeading(
                page['pagePrefix'],
                updateMarketingPageData.mainHeading,
              ),
            );
        } else if (
          sec.sectionType === 'heroImage' &&
          updateMarketingPageData.heroImage &&
          page['pagePrefix'] === 'page_home'
        ) {
          updtateHeroImage = await this.marketingPageHomeDataRepository.update(
            { id: homeData.id },
            this.formatUpdateHeroImage(
              updateMarketingPageData.heroImage,
            ),
          );
        } else if (
          sec.sectionType === 'banner1' &&
          updateMarketingPageData.banner1
        ) {
          updtateBanner1 = await this.marketingPageHomeDataRepository.update(
            { id: homeData.id },
            this.formatUpdateBanner1(
              page['pagePrefix'],
              updateMarketingPageData.banner1,
            ),
          );
        } else if (
          sec.sectionType === 'banner2' &&
          updateMarketingPageData.banner2
        ) {
          updtateBanner2 = await this.marketingPageHomeDataRepository.update(
            { id: homeData.id },
            this.formatUpdateBanner2(
              updateMarketingPageData.banner2,
            ),
          );
        } else if (
          sec.sectionType === 'headerBannerRegistered' &&
          updateMarketingPageData.headerBannerRegistered
        ) {
          updtateHeaderBanner =
            await this.marketingPageHomeDataRepository.update(
              { id: homeData.id },
              this.formatUpdateHeaderFooterBannerRegistered(
                updateMarketingPageData.headerBannerRegistered,
              ),
            );
        } else if (
          sec.sectionType === 'footerBannerRegistered' &&
          updateMarketingPageData.footerBannerRegistered
        ) {
          updtateFooterBanner =
            await this.marketingPageHomeDataRepository.update(
              { id: homeData.id },
              this.formatUpdateHeaderFooterBannerRegistered(
                updateMarketingPageData.footerBannerRegistered,
              ),
            );
        } else if (
          sec.sectionType === 'headerBanner' &&
          updateMarketingPageData.headerBanner
        ) {
          updtateHeaderBanner =
            await this.marketingPageHomeDataRepository.update(
              { id: homeData.id },
              this.formatUpdateHeaderFooterBanner(
                updateMarketingPageData.headerBanner,
              ),
            );
        } else if (
          sec.sectionType === 'footerBanner' &&
          updateMarketingPageData.footerBanner
        ) {
          updtateFooterBanner =
            await this.marketingPageHomeDataRepository.update(
              { id: homeData.id },
              this.formatUpdateHeaderFooterBanner(
                updateMarketingPageData.footerBanner,
              ),
            );
        }
      } else {
        if (
          sec.sectionType === 'mainHeading' &&
          updateMarketingPageData.mainHeading
        ) {
          updateMarketingPageData.mainHeading['marketingPageId'] =
            sec.marketingPageId;
          updateMarketingPageData.mainHeading['marketingPageSectionId'] =
            sec.marketingPageSectionId;
          updtateMainHeading = await this.create(
            this.formatNewMainHeading(
              page['pagePrefix'],
              updateMarketingPageData.mainHeading,
            ),
          );
        } else if (
          sec.sectionType === 'heroImage' &&
          updateMarketingPageData.heroImage
        ) {
          updateMarketingPageData.heroImage['marketingPageId'] =
            sec.marketingPageId;
          updateMarketingPageData.heroImage['marketingPageSectionId'] =
            sec.marketingPageSectionId;
          updtateHeroImage = await this.create(
            this.formatNewHeroImage(
              page['pagePrefix'],
              updateMarketingPageData.heroImage,
            ),
          );
        } else if (
          sec.sectionType === 'banner1' &&
          updateMarketingPageData.banner1
        ) {
          updateMarketingPageData.banner1['marketingPageId'] =
            sec.marketingPageId;
          updateMarketingPageData.banner1['marketingPageSectionId'] =
            sec.marketingPageSectionId;
          updtateBanner1 = await this.create(
            this.formatNewBanner1(
              page['pagePrefix'],
              updateMarketingPageData.banner1,
            ),
          );
        } else if (
          sec.sectionType === 'banner2' &&
          updateMarketingPageData.banner2
        ) {
          updateMarketingPageData.banner2['marketingPageId'] =
            sec.marketingPageId;
          updateMarketingPageData.banner2['marketingPageSectionId'] =
            sec.marketingPageSectionId;
          updtateBanner2 = await this.create(
            this.formatNewBanner2(
              updateMarketingPageData.banner2,
            ),
          );
        } else if (
          sec.sectionType === 'headerBanner' &&
          updateMarketingPageData.headerBanner
        ) {
          updateMarketingPageData.headerBanner['marketingPageId'] =
            sec.marketingPageId;
          updateMarketingPageData.headerBanner['marketingPageSectionId'] =
            sec.marketingPageSectionId;
          updtateHeaderBanner = await this.create(
            this.formatNewBanner2(
              updateMarketingPageData.headerBanner,
            ),
          );
        } else if (
          sec.sectionType === 'footerBanner' &&
          updateMarketingPageData.footerBanner
        ) {
          updateMarketingPageData.footerBanner['marketingPageId'] =
            sec.marketingPageId;
          updateMarketingPageData.footerBanner['marketingPageSectionId'] =
            sec.marketingPageSectionId;
          updtateFooterBanner = await this.create(
            this.formatNewBanner2(
              updateMarketingPageData.footerBanner,
            ),
          );
        }
      }

      if (
        sec.sectionType === 'tilePermissions' &&
        updateMarketingPageData.tilePermissions
      ) {
        updtateTilePermission = await this.updateTilePermissions(
          updateMarketingPageData.tilePermissions,
        );
      }
    }

    return {
      updtateMainHeading,
      updtateHeroImage,
      updtateBanner1,
      updtateBanner2,
      updtateHeaderBanner,
      updtateFooterBanner,
      updtateTilePermission,
    };
  }

  /* Get tiles Permission list */
  getTilePermissions(marketingPageSectionId: number, sectionType: string) {
    let titlePerQueryBuilder = getRepository(
      MarketingTilePermissions,
    ).createQueryBuilder('tp');

    if (sectionType == 'tilePermissions') {
      titlePerQueryBuilder.select(
        'tp.titlePermissionsUuid as id, tp.marketingPagePermissionTitle as title, tp.isAnonymous as isAnonymous, tp.isRegistered as isRegistered, tp.marketingPageTilePermissionsPosition as position',
      );
    } else {
      titlePerQueryBuilder.select(
        'tp.titlePermissionsUuid as id, tp.marketingPagePermissionTitle as title, tp.marketingPageTilePermissionsPosition as position',
      );
    }

    titlePerQueryBuilder.andWhere(
      'tp.marketingPageSectionId = :marketingPageSectionId',
      { marketingPageSectionId: marketingPageSectionId },
    );

    return titlePerQueryBuilder.getRawMany();
  }

  /* Update tiles Permission */
  async updateTilePermissions(permissions) {
    let updates = [];
    let list = permissions.list;
    for (let i = 0; i < permissions.length; i++) {
      const updt = await getRepository(MarketingTilePermissions).update(
        { titlePermissionsUuid: permissions[i].id },
        {
          isAnonymous: permissions[i].isAnonymous,
          isRegistered: permissions[i].isRegistered,
        },
      );
      updates.push(updt);
    }
    return updates;
  }

  /*Get Stallion detalis(separately like profile, testimonials, gallery-images) */
  async findStallionDataByUuId(
    marketingPageUuid: string,
    stallionId: string,
    type: string,
    searchOptionsDto = {},
  ) {
    const page = await this.getPageByUuid(marketingPageUuid);
    if (page['pagePrefix'] !== 'stallion_page') {
      throw new NotFoundException('Stallion page not exist!');
    }

    if (type == 'profile') {
      const record = await this.stallionsService.getStallionByUuid(stallionId);
      const wins = await this.horseService.getWins(record.horseId);
      const stallion = await this.stallionsService.findOne(stallionId);
      return {
        ...stallion,
        wins,
      };
    } else if (type == 'testimonials') {
      if (searchOptionsDto && searchOptionsDto['testimonialId']) {
        const stallion = await this.stallionsService.getStallionByUuid(
          stallionId,
        );
        return this.stallionTestimonialsService.getStallionTestimonialsById(
          stallion.id,
          searchOptionsDto['testimonialId'],
        );
      } else {
        return this.stallionsService.getAllTestimonialsByStallionId(stallionId);
      }
    } else if (type == 'gallery-images') {
      return this.stallionsService.getAllStallionGalleryImages(stallionId);
    }
  }

  /*Update Stallion detalis(separately like profile, testimonials, gallery-images) */
  async updateStallionData(
    marketingPageUuid: string,
    stallionId: string,
    updateMarketingStallionDto: UpdateMarketingStallionDto,
  ): Promise<StallionInfoResponseDto> {
    const page = await this.getPageByUuid(marketingPageUuid);
    if (page['pagePrefix'] !== 'stallion_page') {
      throw new NotFoundException('Stallion page not exist!');
    }

    if (updateMarketingStallionDto.profile) {
      delete updateMarketingStallionDto.profile.horseName;
      delete updateMarketingStallionDto.profile.url;
      return this.stallionsService.profileUpdate(
        stallionId,
        updateMarketingStallionDto.profile,
      );
    } else if (updateMarketingStallionDto.galleryImages) {
      return this.stallionsService.galleryUpdate(stallionId, {
        galleryImages: updateMarketingStallionDto.galleryImages,
      });
    }
    return this.stallionsService.overviewUpdate(stallionId, {
      overview: updateMarketingStallionDto.overview,
    });
  }

  /*Add Stallion Testimonial */
  async addStallionTestimonial(
    marketingPageUuid: string,
    stallionId: string,
    createDto: CreatieStallionTestimonialMarketingDto,
  ) {
    const page = await this.getPageByUuid(marketingPageUuid);
    if (page['pagePrefix'] !== 'stallion_page') {
      throw new NotFoundException('Stallion page not exist!');
    }
    const stallion = await this.stallionsService.getStallionByUuid(stallionId);

    let testimonialCount =
      await this.stallionTestimonialsService.getTestimonialCount(stallion.id);
    if (
      testimonialCount >=
      this.configService.get('file.maxLimitStallionTestimonial')
    ) {
      throw new UnprocessableEntityException('Testimonials Limit reached!');
    }

    let createTestimonialDto = new CreateStallionTestimonialDto();
    createTestimonialDto.title = createDto.title;
    createTestimonialDto.description = createDto.description;
    createTestimonialDto.company = createDto.company
    const testimonial = await this.stallionTestimonialsService.create(
      stallion.id,
      createTestimonialDto,
    );

    const media = createDto.testimonialMedia;
    if (media?.mediauuid) {
      if (media?.isDeleted) {
        await this.mediaService.markForDeletionByMediaUuid(media.mediauuid);
      } else {
        // Add Media file
        let mediaRecord = await this.mediaService.create(media.mediauuid);
        await this.stallionTestimonialMediaService.create(
          testimonial.id,
          mediaRecord.id,
        );
      }
    }

    return this.stallionTestimonialsService.getStallionTestimonialsById(
      stallion.id,
      testimonial.id,
    );
  }

  /*Add Testimonial media file(image)*/
  async testimonialsMediaUpload(
    marketingPageUuid: string,
    stallionId: string,
    fileInfo: FileUploadUrlDto,
  ) {
    const page = await this.getPageByUuid(marketingPageUuid);
    if (page['pagePrefix'] !== 'stallion_page') {
      throw new NotFoundException('Stallion page not exist!');
    }
    return await this.stallionsService.testimonialsMediaUpload(
      stallionId,
      fileInfo,
    );
  }

  /*Add stallion Gallery image*/
  async stalionGalleryImageUpload(
    marketingPageUuid: string,
    stallionId: string,
    fileInfo: FileUploadUrlDto,
  ) {
    const page = await this.getPageByUuid(marketingPageUuid);
    if (page['pagePrefix'] !== 'stallion_page') {
      throw new NotFoundException('Stallion page not exist!');
    }
    return await this.stallionsService.galleryImageUpload(stallionId, fileInfo);
  }

  /*Update Stallion Testimonial */
  async updateStallionTestimonial(
    marketingPageUuid: string,
    stallionId: string,
    updateDto: UpdateStallionTestimonialMarketingDto,
  ) {
    const page = await this.getPageByUuid(marketingPageUuid);
    if (page['pagePrefix'] !== 'stallion_page') {
      throw new NotFoundException('Stallion page not exist!');
    }
    const stallion = await this.stallionsService.getStallionByUuid(stallionId);
    const media = updateDto.testimonialMedia;

    if (media?.mediauuid) {
      if (media?.isDeleted) {
        await this.mediaService.markForDeletionByMediaUuid(media.mediauuid);
      } else {
        // Add Media file
        let mediaRecord = await this.mediaService.create(media.mediauuid);
        const stallionTestimonialMedia =
          await this.stallionTestimonialMediaService.findByTestimonialId(
            updateDto.testimonialId,
          );
        if (stallionTestimonialMedia) {
          await this.stallionTestimonialMediaService.updateByTestimonialId(
            updateDto.testimonialId,
            mediaRecord.id,
          );
        } else {
          await this.stallionTestimonialMediaService.create(
            updateDto.testimonialId,
            mediaRecord.id,
          );
        }
      }
    }
    if (updateDto?.isDeleted) {
      return await this.stallionTestimonialsService.delete(
        stallion.id,
        updateDto.testimonialId,
      );
    } else {
      let updateTestimonialDto = new UpdateTestimonialDto();
      updateTestimonialDto.title = updateDto.title;
      updateTestimonialDto.description = updateDto.description;
      updateTestimonialDto.company = updateDto.company;
      return await this.stallionTestimonialsService.update(
        stallion.id,
        updateDto.testimonialId,
        updateTestimonialDto,
      );
    }
  }

  /*Get Farm details separately(profile, media, gallery-images) */
  async findFarmDataByUuId(
    marketingPageUuid: string,
    farmId: string,
    type: string,
    searchOptionsDto = {},
  ) {
    const page = await this.getPageByUuid(marketingPageUuid);
    if (page['pagePrefix'] !== 'farm_page') {
      throw new NotFoundException('Farm page not exist!');
    }

    if (type == 'profile') {
      return this.farmService.getFarmDetails(farmId);
    } else if (type == 'media') {
      if (searchOptionsDto && searchOptionsDto['mediaId']) {
        const farm = await this.farmService.getFarmByUuid(farmId);
        return await this.farmMediaInfoService.getMediaByFarmId(
          farm.id,
          searchOptionsDto['mediaId'],
        );
      } else {
        return this.farmService.getAllFarmMediaByFarmId(farmId);
      }
    } else if (type == 'gallery-images') {
      return this.farmService.getAllGalleryImages(farmId);
    }
  }

  /*Add Farm Media */
  async addFarmMedias(
    marketingPageUuid: string,
    farmId: string,
    createDto: CreatieFarmMediaMarketingDto,
  ) {
    const page = await this.getPageByUuid(marketingPageUuid);
    if (page['pagePrefix'] !== 'farm_page') {
      throw new NotFoundException('Farm page not exist!');
    }

    const farm = await this.farmService.getFarmByUuid(farmId);
    let crtDto = new CreateMediaDto();
    crtDto.title = createDto.title;
    crtDto.description = createDto.description;
    if (createDto?.mediaInfoFiles) {
      crtDto.mediaInfoFiles = createDto.mediaInfoFiles;
    }

    await this.farmService.addNewMediaInfosToFarm(farm['id'], [crtDto]);
    return this.farmService.getAllFarmMediaByFarmId(farmId);
  }

  /*Update Farm details separately(profile, media, gallery-images) */
  async updateFarmData(
    marketingPageUuid: string,
    farmId: string,
    updateMarketingFarmDto: UpdateMarketingFarmDto,
  ): Promise<FarmInfoResDto> {
    const page = await this.getPageByUuid(marketingPageUuid);
    if (page['pagePrefix'] !== 'farm_page') {
      throw new NotFoundException('Farm page not exist!');
    }

    if (updateMarketingFarmDto.profile) {
      return this.farmService.update(farmId, updateMarketingFarmDto.profile);
    } else if (updateMarketingFarmDto.galleryImages) {
      return this.farmService.galleryUpdate(farmId, {
        galleryImages: updateMarketingFarmDto.galleryImages,
      });
    } else if (updateMarketingFarmDto.mediaInfos) {
      return this.farmService.mediaUpdate(farmId, {
        mediaInfos: updateMarketingFarmDto.mediaInfos,
      });
    }
    return this.farmService.overviewUpdate(farmId, {
      overview: updateMarketingFarmDto.overview,
    });
  }

  /*Get Marketing page by page section Id */
  async getMarketingPageByPageSectionId(marketingPageSectionId: string) {
    const query = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as marketingPageSectionId, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionName as sectionName, mrktPageSec.marketingPageSectionType as sectionType',
      )
      .addSelect(
        'marketingPage.marketingPageName as marketingPageName, marketingPage.pagePrefix as pagePrefix',
      )
      .innerJoin('mrktPageSec.marketingPage', 'marketingPage')
      .andWhere(
        'mrktPageSec.marketingPageSectionUuid = :marketingPageSectionUuid',
        { marketingPageSectionUuid: marketingPageSectionId },
      );

    const marketingPage = await query.getRawOne();
    return marketingPage;
  }

  /*Get a Marketing page by Id */
  async getPageById(id: number) {
    let pageQueryBuilder = getRepository(MarketingPage)
      .createQueryBuilder('mrktPage')
      .select(
        'mrktPage.id as marketingPageId, mrktPage.marketingPageName as marketingPageName, mrktPage.pagePrefix as pagePrefix',
      )
      .andWhere('mrktPage.id = :id', { id: id });

    const page = await pageQueryBuilder.getRawOne();
    if (!page) {
      throw new NotFoundException('Page not found!');
    }

    return page;
  }
}
