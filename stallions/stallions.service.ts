import {
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { readFileSync } from 'fs';
import * as path from 'path';
import { ActivityEntity } from 'src/activity-module/activity.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { CountryService } from 'src/country/service/country.service';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { ExcelService } from 'src/excel/excel.service';
import { FarmLocationsService } from 'src/farm-locations/farm-locations.service';
import { FarmsService } from 'src/farms/farms.service';
import { FavouriteBroodmareSire } from 'src/favourite-broodmare-sires/entities/favourite-broodmare-sire.entity';
import { FavouriteFarm } from 'src/favourite-farms/entities/favourite-farm.entity';
import { TrackedStallionSearchDto } from 'src/favourite-stallions/dto/tracked-stallion-search.dto';
import { FavouriteStallion } from 'src/favourite-stallions/entities/favourite-stallion.entity';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { MediaService } from 'src/media/media.service';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { HtmlToPdfService } from 'src/report-templates/html-to-pdf.service';
import { SearchStallionMatchService } from 'src/search-stallion-match/search-stallion-match.service';
import { StallionGalleryImageDto } from 'src/stallion-gallery-images/dto/stallion-gallery-image.dto';
import { StallionGalleryImageService } from 'src/stallion-gallery-images/stallion-gallery-image.service';
import { CreateStallionLocationDto } from 'src/stallion-locations/dto/create-stallion-location.dto';
import { UpdateStallionLocationDto } from 'src/stallion-locations/dto/update-stallion-location.dto';
import { StallionLocation } from 'src/stallion-locations/entities/stallion-location.entity';
import { StallionLocationsService } from 'src/stallion-locations/stallion-locations.service';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { StallionProfileImageService } from 'src/stallion-profile-image/stallion-profile-image.service';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { StallionPromotionService } from 'src/stallion-promotions/stallion-promotions.service';
import { CreateStallionServiceFeeDto } from 'src/stallion-service-fees/dto/create-stallion-service-fee.dto';
import { pageOptionsDto } from 'src/stallion-service-fees/dto/page-option.dto';
import { UpdateStallionServiceFeeDto } from 'src/stallion-service-fees/dto/update-stallion-service-fee.dto';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
import { StallionServiceFeesService } from 'src/stallion-service-fees/stallion-service-fees.service';
import { StallionTestimonialMediaDto } from 'src/stallion-testimonial-media/dto/stallion-testimonial-media.dto';
import { StallionTestimonialMediaService } from 'src/stallion-testimonial-media/stallion-testimonial-media.service';
import { CreateStallionTestimonialDto } from 'src/stallion-testimonials/dto/create-stallion-testimonial.dto';
import { UpdateTestimonialDto } from 'src/stallion-testimonials/dto/update-testimonial.dto';
import { StallionTestimonialsService } from 'src/stallion-testimonials/stallion-testimonials.service';
import {
  CommonFeeStatus,
  CommonFeeStatusList,
  CommonPromotionsStatus,
} from 'src/utils/common';
import { STALLIONDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import {
  Brackets,
  Connection,
  getRepository,
  In,
  Not,
  Repository,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateStallionDto } from './dto/create-stallion.dto';
import { DamSireNameSearchDto } from './dto/dam-sire-name-search.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { FeeRangeSearchDto } from './dto/fee-range-search.dto.';
import { PriceMinMaxOptionsDto } from './dto/price-min-max-options.dto';
import { ProgenyTrackerPageOptionsDto } from './dto/progeny-tracker-page-options.dto';
import { SearchOptionsDownloadDto } from './dto/search-options-for-download.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SireNameSearchDto } from './dto/sire-name-search.dto';
import { StallionInfoResponseDto } from './dto/stallion-info-response.dto';
import { StallionNameSearchDto } from './dto/stallion-name-search.dto';
import { UpdateStallionGalleryDto } from './dto/update-stallion-gallery.dto';
import { UpdateStallionOverviewDto } from './dto/update-stallion-overview.dto';
import { UpdateStallionProfileDto } from './dto/update-stallion-profile.dto';
import { UpdateStallionTestimonialDto } from './dto/update-stallion-testimonial';
import { UpdateStallionDto } from './dto/update-stallion.dto';
import { Stallion } from './entities/stallion.entity';
import { FeeUpdateEnum } from './fee-update.enum';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class StallionsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @Inject(forwardRef(() => StallionPromotionService))
    private stallionPromotionService: StallionPromotionService,
    @InjectRepository(Stallion)
    private stallionRepository: Repository<Stallion>,
    private stallionLocationService: StallionLocationsService,
    private stallionServiceFeeService: StallionServiceFeesService,
    private horseService: HorsesService,
    private stallionProfileImageService: StallionProfileImageService,
    private mediaService: MediaService,
    private farmService: FarmsService,
    private readonly fileUploadsService: FileUploadsService,
    private commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    private currenciesService: CurrenciesService,
    private countryService: CountryService,
    private stallionGalleryImageService: StallionGalleryImageService,
    private farmLocationsService: FarmLocationsService,
    private stallionTestimonialsService: StallionTestimonialsService,
    private stallionTestimonialMediaService: StallionTestimonialMediaService,
    private excelService: ExcelService,
    private readonly connection: Connection,
    private readonly htmlToPdfService: HtmlToPdfService,
    private readonly searchSMService: SearchStallionMatchService,
  ) {}

  //Create a stallion
  async create(createStallionDto: CreateStallionDto) {
    const member = this.request.user;
    const { farmId, horseId, countryId, isActive } = createStallionDto;
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    let farm = await this.farmService.getFarmByUuid(farmId);
    if (!farm) {
      throw new UnprocessableEntityException('Farm not found');
    }
    let country = await this.countryService.getCountryById(countryId);

    createStallionDto.createdBy = member['id'];
    const createDto = {
      ...createStallionDto,
      horseId: horse.id,
      farmId: farm.id,
      isVerified: true,
      isActive: isActive,
    };
    const existResult = await this.isStallionExist(horse.id, farm.id);
    if (existResult.isRemoved == false) {
      throw new UnprocessableEntityException('Stallion already exists');
    }

    if (!createStallionDto?.forceCreateNew) {
      const conflictedStallions =
        await this.getAllStallionsByHorseIdAndRegionId(
          horse.id,
          country.regionId,
        );
      if (conflictedStallions.length) {
        return {
          status: 200,
          message: 'CONFLICT_ERROR',
          data: conflictedStallions,
        };
      }
    }
    const stallionResponse = await this.stallionRepository.save(
      this.stallionRepository.create(createDto),
    );
    if (createStallionDto.startDate) {
      var endDate = new Date(createStallionDto.startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      const createPromotionDto = {
        stallionId: stallionResponse.id,
        createdBy: member['id'],
        createdOn: new Date(),
        modifiedOn: new Date(),
        modifiedBy: member['id'],
        startDate: createStallionDto.startDate,
        endDate: endDate,
        promotedCount: 1,
        isAdminPromoted: true,
      };

      const result = await getRepository(StallionPromotion).save(
        createPromotionDto,
      );
    }
    //Set ProfilePic
    if (createStallionDto?.profileImageuuid) {
      await this.setStallionProfilePic(
        stallionResponse,
        createStallionDto.profileImageuuid,
      );
    }

    let locationData = new CreateStallionLocationDto();
    locationData.countryId = createStallionDto.countryId;
    locationData.stateId = createStallionDto.stateId;
    locationData.stallionId = stallionResponse.id;
    locationData.createdBy = member['id'];
    const loc = await this.stallionLocationService.create(locationData);
    let feeData = new CreateStallionServiceFeeDto();
    feeData.currencyId = createStallionDto.currencyId;
    feeData.fee = createStallionDto.fee;
    feeData.isPrivateFee = createStallionDto.isPrivateFee;
    feeData.feeYear = createStallionDto.feeYear;
    feeData.feeUpdatedFrom = FeeUpdateEnum.SMInternalUpdate; //Admin Update
    feeData.stallionId = stallionResponse.id;
    feeData.createdBy = member['id'];
    const fee = await this.stallionServiceFeeService.create(feeData);
    return {
      status: 200,
      message: 'Stallion created successfully!',
      data: 'Stallion created successfully!',
    };
  }

  //Get All Stallions By HorseId And RegionId
  async getAllStallionsByHorseIdAndRegionId(horseId: number, regionId: number) {
    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select('spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    let stallionIdQb = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id')
      .andWhere('stallion.horseId=:horseId', { horseId: horseId });

    let tslQb = getRepository(StallionLocation)
      .createQueryBuilder('tsl')
      .select('tsl.stallionId')
      .innerJoin('tsl.country', 'tc')
      .andWhere('tsl.stallionId IN(' + stallionIdQb.getQuery() + ')')
      .andWhere('tc.regionId=:regionId', { regionId: regionId })
      .setParameters(stallionIdQb.getParameters());

    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('ts')
      .select(
        'ts.stallionUuid as stallionId, th.horseName, th.yob, thc.countryCode, tf.farmName, tflc.countryName as farmCountry, mediaUrl as profilePic',
      )
      .innerJoin('ts.horse', 'th')
      .innerJoin('th.nationality', 'thc')
      .innerJoin('ts.farm', 'tf')
      .innerJoin('tf.farmlocations', 'tfl')
      .innerJoin('tfl.country', 'tflc')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=ts.id',
      );

    queryBuilder
      .andWhere('ts.id IN(' + tslQb.getQuery() + ')')
      .setParameters(tslQb.getParameters());

    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  //Get all Stallions By Name
  async findStallionsByName(
    searchOptions: StallionNameSearchDto,
  ): Promise<Stallion[]> {
    const data = await this.stallionRepository.manager.query(
      `EXEC procSearchStallionByName @stallionName=@0`,
      [searchOptions.stallionName],
    );

    return data;
  }

  //Get Stallions By Sire Name
  async findSiresByName(searchOptions: SireNameSearchDto) {
    let isSireNameExactSearch = 0;
    if (searchOptions.isSireNameExactSearch) {
      isSireNameExactSearch = 1;
    }
    return await this.stallionRepository.manager.query(
      `EXEC proc_SMPGetStallionBySireName
          @SireName=@0,
          @SortOrder=@1,
          @isNameExactSearch=@2`,
      [searchOptions.sireName, searchOptions.order, isSireNameExactSearch],
    );
  }

  //Get all stallions
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Stallion>> {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    if (searchOptionsDto?.currency) {
      let currencyData = await this.currenciesService.findOne(
        searchOptionsDto?.currency,
      );
      if (currencyData) {
        destinationCurrencyCode = currencyData.currencyCode;
      }
    }
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let stallionPromotionQueryBuilder = getRepository(StallionPromotion)
      .createQueryBuilder('stallionpromotion')
      .select(
        'DISTINCT stallionpromotion.stallionId as promotedStallionId,stallionpromotion.id as stallionPromotionId, stallionpromotion.startDate, stallionpromotion.endDate, CASE WHEN ((getutcdate() BETWEEN stallionpromotion.startDate AND stallionpromotion.endDate) AND (op.promotionId IS NOT NULL OR stallionpromotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=stallionpromotion.id',
      );

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'MAX(studFee.id) as studFeeId, studFee.stallionId as feeStallionId',
      )
      .groupBy('studFee.stallionId');

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select(
        'spi.stallionId as mediaStallionId, media.mediaUrl as profileMediaUrl',
      )
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'stallion.stallionUuid as stallionId, stallion.url,  profileMediaUrl as profilePic, stallion.height,stallion.reasonId, stallion.yearToStud, stallion.yearToRetired, stallion.isActive ,stallion.modifiedOn as last_updated ,stallion.overview, 50 as profileRating',
      )
      .addSelect('horse.horseName, horse.yob, horse.horseUuid as horseId')
      .addSelect('member.fullName as userName')
      .addSelect('colour.colourName as colourName')
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect('farm.farmName as farmName,farm.farmUuid as farmId')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.fee as fee,stallionservicefee.feeYear as feeYear,stallionservicefee.feeUpdatedFrom as feeUpdatedFrom, stallionservicefee.currencyId as currencyId,stallionservicefee.isPrivateFee as isPrivateFee',
      )
      .addSelect('country.countryName as countryName')
      .addSelect('state.stateName as stateName,state.id as stateId')
      .addSelect(
        'promotion.startDate, promotion.endDate as expiryDate, promotion.stallionPromotionId,promotion.isPromoted',
      )
      .innerJoin('stallion.farm', 'farm')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('horse.colour', 'colour')
      .leftJoin('stallion.member', 'member')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .leftJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .leftJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .leftJoin('stallionservicefee.currency', 'currency')
      .leftJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .innerJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )
      .leftJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      )
      .leftJoin(
        '(' + stallionPromotionQueryBuilder.getQuery() + ')',
        'promotion',
        'promotedStallionId=stallion.id AND promotion.isPromoted=1',
      )
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      );

    if (searchOptionsDto.stallionName) {
      if (searchOptionsDto.isStallionNameExactSearch) {
        queryBuilder.andWhere('horse.horseName =:stallionName', {
          stallionName: searchOptionsDto.stallionName,
        });
      } else {
        queryBuilder.andWhere('horse.horseName like :stallionName', {
          stallionName: `%${searchOptionsDto.stallionName}%`,
        });
      }
    }
    if (searchOptionsDto.farmName) {
      if (searchOptionsDto.isFarmNameExactSearch) {
        queryBuilder.andWhere('farm.farmName =:farmName', {
          farmName: searchOptionsDto.farmName,
        });
      } else {
        queryBuilder.andWhere('farm.farmName like :farmName', {
          farmName: `%${searchOptionsDto.farmName}%`,
        });
      }
    }
    if (searchOptionsDto.stallionId) {
      queryBuilder.andWhere('stallion.stallionUuid = :stallionId', {
        stallionId: searchOptionsDto.stallionId,
      });
    }
    if (searchOptionsDto.farmId) {
      queryBuilder.andWhere('farm.farmUuid = :farmId', {
        farmId: searchOptionsDto.farmId,
      });
    }
    if (searchOptionsDto.country) {
      queryBuilder.andWhere('stallionlocation.countryId = :country', {
        country: searchOptionsDto.country,
      });
    }
    if (searchOptionsDto.state) {
      queryBuilder.andWhere('stallionlocation.stateId = :state', {
        state: searchOptionsDto.state,
      });
    }
    if (searchOptionsDto.colour) {
      queryBuilder.andWhere('colour.id = :colour', {
        colour: searchOptionsDto.colour,
      });
    }
    if (searchOptionsDto.currency) {
      queryBuilder.andWhere('stallionservicefee.currencyId = :currency', {
        currency: searchOptionsDto.currency,
      });
    }
    if (searchOptionsDto.sireName) {
      queryBuilder.andWhere('sireName like :sireName', {
        sireName: `%${searchOptionsDto.sireName}%`,
      });
    }
    if (searchOptionsDto.feeYear) {
      queryBuilder.andWhere('stallionservicefee.feeYear = :feeYear', {
        feeYear: searchOptionsDto.feeYear,
      });
    }
    if (searchOptionsDto.fee) {
      queryBuilder.andWhere('stallionservicefee.fee = :fee', {
        fee: searchOptionsDto.fee,
      });
    }
    if (searchOptionsDto.feeUpdatedBy) {
      queryBuilder.andWhere(
        'stallionservicefee.feeUpdatedFrom = :feeUpdatedFrom',
        { feeUpdatedFrom: searchOptionsDto.feeUpdatedBy },
      );
    }
    if (searchOptionsDto.feeStatus) {
      let feeStatus = searchOptionsDto.feeStatus == 1 ? 1 : 0;
      queryBuilder.andWhere('stallionservicefee.isPrivateFee = :isPrivateFee', {
        isPrivateFee: feeStatus,
      });
    }
    if (searchOptionsDto.promoted == 'Promoted') {
      queryBuilder.andWhere('promotion.isPromoted= :isPromoted', {
        isPromoted: 1,
      });
    }
    if (searchOptionsDto.promoted == 'Non-Promoted') {
      queryBuilder.andWhere(
        new Brackets((subQ) => {
          subQ
            .where('promotion.isPromoted= :isPromoted', { isPromoted: 0 })
            .orWhere('promotion.isPromoted IS NULL');
        }),
      );
    }
    if (searchOptionsDto.promoted == 'All') {
      queryBuilder.andWhere(
        new Brackets((subQ) => {
          subQ
            .where('promotion.isPromoted= :isPromoted', { isPromoted: 0 })
            .orWhere('promotion.isPromoted= :isPromoted', { isPromoted: 1 })
            .orWhere('promotion.isPromoted IS NULL');
        }),
      );
    }
    if (searchOptionsDto.startDate) {
      const createdDateRange = searchOptionsDto.startDate;
      let dateList = createdDateRange.split('/');
      if (dateList.length === 2) {
        var minDate = dateList[0];
        var maxDate = dateList[1];
      }
      queryBuilder.andWhere(
        'promotion.startDate >= CONVERT(date, :minDate) AND promotion.endDate <= CONVERT(date, :maxDate)',
        {
          minDate,
          maxDate,
        },
      );
    }

    if (searchOptionsDto.priceRange) {
      const priceRange = searchOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        if (searchOptionsDto.includePrivateFee) {
          if (maxPrice === '1000000') {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * destCurrency.rate/actCurrency.rate) >= :minPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
              },
            );
          } else {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * destCurrency.rate/actCurrency.rate) >= :minPrice AND (stallionservicefee.fee * destCurrency.rate/actCurrency.rate) <= :maxPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
                maxPrice,
              },
            );
          }
        } else {
          if (maxPrice === '1000000') {
            queryBuilder.andWhere(
              '(stallionservicefee.fee * destCurrency.rate/actCurrency.rate) >= :minPrice AND stallionservicefee.isPrivateFee=0',
              {
                minPrice,
              },
            );
          } else {
            queryBuilder.andWhere(
              '(stallionservicefee.fee * destCurrency.rate/actCurrency.rate) >= :minPrice AND (stallionservicefee.fee * destCurrency.rate/actCurrency.rate) <= :maxPrice AND stallionservicefee.isPrivateFee=0',
              {
                minPrice,
                maxPrice,
              },
            );
          }
        }
      }
    }

    if (!searchOptionsDto.priceRange && searchOptionsDto.includePrivateFee) {
      queryBuilder.andWhere('stallionservicefee.isPrivateFee = :isPrivateFee', {
        isPrivateFee: 0,
      });
    }

    const entitiesWithoutLimit = await queryBuilder.getRawMany();
    const min = Math.min(...entitiesWithoutLimit.map((item) => item.fee));
    const max = Math.max(...entitiesWithoutLimit.map((item) => item.fee));
    //Addition of filtering stallions by key Ancestors
    if (searchOptionsDto.keyAncestor) {
      let keyAncestorHorses =
        await this.horseService.getAllAncestorHorsesByHorseId(
          searchOptionsDto.keyAncestor,
        );
      let ancestorHorsesList = [];
      await keyAncestorHorses.map(async (item) => {
        ancestorHorsesList.push(item.horseId);
      });

      if (ancestorHorsesList.length) {
        queryBuilder.andWhere('stallion.horseId IN(:...ancestorHorsesList)', {
          ancestorHorsesList: ancestorHorsesList,
        });
      }
    }
    queryBuilder.andWhere('stallion.isRemoved= :isRemoved', { isRemoved: 0 });
    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      const byOrder = searchOptionsDto.order;
      if (sortBy.toLowerCase() === 'horsename') {
        queryBuilder.orderBy('horse.horseName', byOrder);
      }
      if (sortBy.toLowerCase() === 'stallionname') {
        queryBuilder.orderBy('horse.horseName', byOrder);
      }
      if (sortBy.toLowerCase() === 'farmname') {
        queryBuilder.orderBy('farm.farmName', byOrder);
      }

      if (sortBy.toLowerCase() === 'countryname') {
        queryBuilder.orderBy('country.countryName', byOrder);
      }
      if (sortBy.toLowerCase() === 'statename') {
        queryBuilder.orderBy('state.stateName', byOrder);
      }
      if (sortBy.toLowerCase() === 'colour') {
        queryBuilder.orderBy('colour.id ', byOrder);
      }
      if (sortBy.toLowerCase() === 'currency') {
        queryBuilder.orderBy('stallionservicefee.currencyId', byOrder);
      }
      if (sortBy.toLowerCase() === 'ispromoted') {
        queryBuilder.orderBy('promotion.isPromoted', byOrder);
      }
      if (sortBy.toLowerCase() === 'isactive') {
        queryBuilder.orderBy('stallion.isActive', byOrder);
      }
      if (sortBy.toLowerCase() === 'feeyear') {
        queryBuilder.orderBy('stallionservicefee.feeYear', byOrder);
      }
      if (sortBy.toLowerCase() === 'fee') {
        queryBuilder.orderBy('stallionservicefee.fee', byOrder);
      }

      if (sortBy.toLowerCase() === 'sirename') {
        queryBuilder.orderBy('sire.sireName', byOrder);
      }
      if (sortBy.toLowerCase() === 'last_updated') {
        queryBuilder.orderBy('stallion.modifiedOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'available nominations') {
        queryBuilder.orderBy('stallionnomination.id', byOrder);
      }
      if (sortBy.toLowerCase() === 'yeartostud') {
        queryBuilder.orderBy('stallion.yearToStud', byOrder);
      }

      if (sortBy.toLowerCase() === 'yob') {
        queryBuilder.orderBy('horse.yob', byOrder);
      }
      if (sortBy.toLowerCase() === 'colourname') {
        queryBuilder.orderBy('colour.colourName ', byOrder);
      }
      if (sortBy.toLowerCase() === 'yeartoretired') {
        queryBuilder.orderBy('stallion.yearToRetired', byOrder);
      }
      if (sortBy.toLowerCase() === 'currencycode') {
        queryBuilder.orderBy('currency.currencyCode', byOrder);
      }
      if (sortBy.toLowerCase() === 'sireyob') {
        queryBuilder.orderBy('sire.sireYob', byOrder);
      }
      if (sortBy.toLowerCase() === 'sirecountrycode') {
        queryBuilder.orderBy('sire.sireCountryCode', byOrder);
      }
      if (sortBy.toLowerCase() === 'currencycode') {
        queryBuilder.orderBy('currency.currencyCode', byOrder);
      }
    }

    queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    let entities = await queryBuilder.getRawMany();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });
    let finalResult = new PageDto(entities, pageMetaDto);
    finalResult['priceRange'] = { max: max, min: min };
    return finalResult;
  }

  //Get stallion by id
  async findOne(id: string) {
    const record = await this.getStallionByUuid(id);
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let stallionPromotionQueryBuilder = getRepository(StallionPromotion)
      .createQueryBuilder('stallionpromotion')
      .select(
        'DISTINCT stallionpromotion.id, stallionpromotion.stallionId as promotedStallionId, stallionpromotion.startDate, stallionpromotion.endDate, CASE WHEN ((getutcdate() BETWEEN stallionpromotion.startDate AND stallionpromotion.endDate) AND (op.promotionId IS NOT NULL OR stallionpromotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=stallionpromotion.id',
      );

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'MAX(studFee.id) as studFeeId, studFee.stallionId as feeStallionId',
      )
      .groupBy('studFee.stallionId');

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select('spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'stallion.id as id, stallion.stallionUuid as stallionId, mediaUrl as profilePic, stallion.url, stallion.height, stallion.yearToStud, stallion.yearToRetired, stallion.reasonId, stallion.isActive, colour.id as colourId, colour.colourName, CASE WHEN promotion.isPromoted IS NULL THEN CAST(0 as bit) ELSE CAST(1 as bit) END as isPromoted, stallion.overview, 0 as profileRating,member.fullName as createdBy,stallion.createdOn,modifiedby.fullName as modifiedBy,stallion.modifiedOn',
      )
      .addSelect('horse.horseName, horse.yob,horse.horseUuid as horseId')
      .addSelect('farm.farmUuid as farmId, farm.farmName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.feeYear as feeYear, stallionservicefee.currencyId as currencyId, stallionservicefee.fee as fee, stallionservicefee.isPrivateFee as isPrivateFee',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode, country.id as countryId',
      )
      .addSelect('state.stateName as stateName ,state.id as stateId')
      .addSelect('sire.sireName, sire.sireYob, sire.sireCountryCode')
      .addSelect('dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect(
        'promotion.startDate, promotion.endDate as expiryDate, promotion.id as stallionPromotionId',
      )
      .innerJoin('stallion.farm', 'farm')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('horse.colour', 'colour')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .leftJoin('stallionservicefee.currency', 'currency')
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
      .leftJoin('stallion.member', 'member')
      .leftJoin('stallion.modifiedby', 'modifiedby')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      )
      .leftJoin(
        '(' + stallionPromotionQueryBuilder.getQuery() + ')',
        'promotion',
        'promotedStallionId=stallion.id AND promotion.isPromoted=1',
      )
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .andWhere('stallion.stallionUuid = :stallionUuid', { stallionUuid: id })
      .orderBy('stallionservicefee.id', 'DESC');

    let entity = await queryBuilder.getRawOne();
    if (entity) {
      await this.addProfileRating(entity);
    }
    return entity;
  }

  //Add profile rating for a stallion
  async addProfileRating(stallion) {
    const sgImages = await this.getAllStallionGalleryImages(
      stallion.stallionId,
    );
    stallion.profileRating = this.calculateRatingPercentage(stallion, sgImages);
    this.deleteExtraFiels(stallion);
    return stallion;
  }

  //Calculate Rating Percentage
  calculateRatingPercentage(stallion, gImages) {
    const totalRequiredFields = this.configService.get(
      'file.totalRequiredFields',
    );
    const completePercentage = this.configService.get(
      'file.completePercentage',
    );
    const {
      profilePic,
      horseName,
      farmName,
      yob,
      colourName,
      fee,
      feeYear,
      countryCode,
      yearToStud,
      height,
      overview,
      testimonialTitle,
      testimonialTCompany,
      testimonialTDescription,
    } = stallion;
    const stallionData = {
      profilePic,
      horseName,
      farmName,
      yob,
      colourName,
      fee,
      feeYear,
      countryCode,
      yearToStud,
      height,
      overview,
    };
    const testimonialData = {
      testimonialTitle,
      testimonialTCompany,
      testimonialTDescription,
    };
    let completedCount = 0;
    let profileRating = 0;

    for (let value of Object.values(stallionData)) {
      if (value) completedCount++;
    }

    completedCount = completedCount + this.checkTestimonial(testimonialData);

    if (gImages && gImages.length >= 8) {
      completedCount++;
    }

    if (completedCount) {
      profileRating = Number(
        ((completedCount / totalRequiredFields) * completePercentage).toFixed(
          2,
        ),
      );
    }

    return profileRating;
  }

  //Check Testimonial Count
  checkTestimonial(testimonial) {
    let count = 0;
    for (let value of Object.values(testimonial)) {
      if (value) count++;
    }
    return count == 3 ? 1 : 0;
  }

  //Delete
  deleteExtraFiels(data) {
    delete data['testimonialTitle'];
    delete data['testimonialTCompany'];
    delete data['testimonialTDescription'];
  }

  //Update a stallion
  async update(stallionUuid: string, updateStallionDto: UpdateStallionDto) {
    const member = this.request.user;
    let record = await this.getStallionByUuid(stallionUuid);
    const { horseId, farmId, isActive, isPromotionUpdated } = updateStallionDto;
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    let farm = await this.farmService.findOne(farmId);

    if (!farm) {
      throw new UnprocessableEntityException('Farm not found');
    }
    //Check Horse Already Attached with same farm, other than same stallion record
    const stallionDuplicationCheck =
      await this.getStallionByStallionIdHorseIdAndFarmId(
        record.id,
        horse.id,
        farm.id,
      );
    if (stallionDuplicationCheck) {
      throw new ConflictException('Stallion with the farm already exist!');
    }
    // Delete Stallion Profilepic
    if (updateStallionDto?.isProfileImageDeleted) {
      await this.deleteStallionProfilePic(record);
    }
    //Set ProfilePic
    if (updateStallionDto?.profileImageuuid) {
      await this.setStallionProfilePic(
        record,
        updateStallionDto.profileImageuuid,
      );
    }
    updateStallionDto.modifiedBy = member['id'];
    const updateDto = {
      ...updateStallionDto,
      horseId: horse.id,
      farmId: farm.id,
      isVerified: true,
      isActive: isActive,
    };
    let locationData = new UpdateStallionLocationDto();
    locationData.countryId = updateStallionDto.countryId;
    locationData.stateId = updateStallionDto.stateId;
    locationData.modifiedBy = member['id'];

    let feeData = new UpdateStallionServiceFeeDto();
    feeData.currencyId = updateStallionDto.currencyId;
    feeData.fee = updateStallionDto.fee;
    feeData.feeUpdatedFrom = FeeUpdateEnum.SMInternalUpdate; //Admin Update
    feeData.isPrivateFee = updateStallionDto.isPrivateFee;
    let feeDataCreate = new CreateStallionServiceFeeDto();
    feeDataCreate.currencyId = updateStallionDto.currencyId;
    feeDataCreate.fee = updateStallionDto.fee;
    feeDataCreate.feeUpdatedFrom = FeeUpdateEnum.SMInternalUpdate; //Admin Update
    feeDataCreate.isPrivateFee = updateStallionDto.isPrivateFee;
    (feeDataCreate.feeYear = updateStallionDto.feeYear),
      (feeDataCreate.createdBy = member['id']);
    delete updateDto.countryId;
    delete updateDto.stateId;
    delete updateDto.currencyId;
    delete updateDto.fee;
    delete updateDto.feeYear;
    delete updateDto.isPrivateFee;
    delete updateDto.profileImageuuid;
    delete updateDto.startDate;
    delete updateDto.forceCreateNew;
    delete updateDto.isProfileImageDeleted;
    delete updateDto.isPromotionUpdated;

    await this.stallionRepository.update({ id: record.id }, updateDto);
    const stallionResponse = await this.stallionRepository.findOne({
      id: record.id,
    });

    locationData.stallionId = stallionResponse.id;

    await this.stallionLocationService.update(
      stallionResponse.id,
      locationData,
    );

    let feeHistory = await getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'MAX(studFee.id) as studFeeId, studFee.stallionId as feeStallionId',
      )
      .andWhere('studFee.stallionId =:stallionId',{stallionId:record.id})
      .groupBy('studFee.stallionId')
      .getRawOne();

    let history =  await getRepository(StallionServiceFee)
     .createQueryBuilder('history')
     .select('history.fee,history.feeYear,history.currencyId,history.isPrivateFee')
     .andWhere('history.id =:id',{id:feeHistory.studFeeId})
     .getRawOne();
   
    feeData.stallionId = stallionResponse.id;
    feeDataCreate.stallionId = stallionResponse.id;
    if (
      history.fee != feeData.fee ||
      history.feeYear != feeDataCreate.feeYear ||
      history.currencyId != feeData.currencyId ||
      history.isPrivateFee != feeData.isPrivateFee
    )
     {
    let resp =   await this.stallionServiceFeeService.create(feeDataCreate);
    } 
  
    // else {
    //   await this.stallionServiceFeeService.update(stallionResponse.id, feeData);
    // }
    // if(updateStallionDto.isStudFeeUpdated == true)
    // {
    //   await this.stallionServiceFeeService.create(feeDataCreate);
    // } 
    if(isPromotionUpdated){
      await this.promoteStallionOrStop(updateStallionDto, stallionResponse);
    }
    return {
      status: 200,
      message: 'Stallion Updated successfully!',
      data: 'Stallion Updated successfully!',
    };
  }

  //Start/Stop a Stallion Promotion
  async promoteStallionOrStop(updateStallionDto, stallionResponse) {
    const member = this.request.user;
    let endDate = new Date(updateStallionDto.startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    let updateStallionPomotion = {
      endDate: endDate,
      startDate: updateStallionDto.startDate,
    };
    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let promoteRes = await getRepository(StallionPromotion)
      .createQueryBuilder('sp')
      .select(
        'sp.id,sp.stallionId,CASE WHEN ((getutcdate() BETWEEN sp.startDate AND sp.endDate) AND (op.promotionId IS NOT NULL OR sp.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted, sp.promotedCount promotedCount',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=sp.id',
      )
      .andWhere('sp.stallionId = :stallionId', {
        stallionId: stallionResponse.id,
      })
      .getRawOne();
    if (!promoteRes) {
      updateStallionPomotion['stallionId'] = stallionResponse.id;
      updateStallionPomotion['createdBy'] = member['id'];
      updateStallionPomotion['isAdminPromoted'] = true;

      await getRepository(StallionPromotion).save(updateStallionPomotion);
    } else if (promoteRes && updateStallionDto.startDate) {
      updateStallionPomotion['modifiedBy'] = member['id'];
      updateStallionPomotion['promotedCount'] = parseInt(
        promoteRes.promotedCount + 1,
      );
      updateStallionPomotion['isAdminPromoted'] = true;
      await getRepository(StallionPromotion).update(
        promoteRes.id,
        updateStallionPomotion,
      );
    } else if (promoteRes && !updateStallionDto.startDate) {
      updateStallionPomotion['endDate'] = new Date();
      delete updateStallionPomotion['startDate'];
      updateStallionPomotion['isAdminPromoted'] = false;
      await getRepository(StallionPromotion).update(
        promoteRes.id,
        updateStallionPomotion,
      );
    }
  }

  //Check Stallion Exist by horseId and farmId
  async isStallionExist(horseId: number, farmId: number) {
    const record = await this.stallionRepository.findOne({
      horseId,
      farmId,
      isRemoved: false,
    });
    if (record) return record;
    else {
      const record = {
        isRemoved: true,
      };
      return record;
    }
  }

  //Get PromotionsStatus List
  async getPromotionsStatusList() {
    return CommonPromotionsStatus();
  }

  //Get FeeStatus List
  async getFeeStatusList() {
    return CommonFeeStatus();
  }

  //Get FeeStatus
  async getFeeStatus() {
    return CommonFeeStatusList();
  }

  //Get Stallion By GrandSires Name
  async findGrandSiresByName(searchOptions: SireNameSearchDto) {
    let isSireNameExactSearch = 0;
    if (searchOptions.isSireNameExactSearch) {
      isSireNameExactSearch = 1;
    }
    return await this.stallionRepository.manager.query(
      `EXEC proc_SMPGetStallionByGrandSireName
          @GrandSireName=@0,
          @SortOrder=@1,
          @isNameExactSearch=@2`,
      [searchOptions.sireName, searchOptions.order, isSireNameExactSearch],
    );
  }

  //Set Stallion Profile Pic
  async setStallionProfilePic(record: Stallion, fileUuid: string) {
    await this.deleteStallionProfilePic(record);
    // Set Stallion Profile Image
    let mediaRecord = await this.mediaService.create(fileUuid);
    return await this.stallionProfileImageService.create({
      stallionId: record.id,
      mediaId: mediaRecord.id,
    });
  }

  //Get stallion by stallionUuid
  async getStallionByUuid(stallionUuid: string) {
    const record = await this.stallionRepository.findOne({ stallionUuid });
    if (!record) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    return record;
  }

  //Get Stallion By StallionId HorseId And FarmId
  async getStallionByStallionIdHorseIdAndFarmId(
    stallionId: number,
    horseId: number,
    farmId: number,
  ) {
    const record = await this.stallionRepository.findOne({
      where: {
        id: Not(stallionId),
        horseId: horseId,
        farmId: farmId,
        isRemoved: 0,
      },
    });
    return record;
  }

  //Get presigedurl for Profile image upload
  async profileImageUpload(fileInfo: FileUploadUrlDto) {
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
      'file.s3DirStallionProfileImage',
    )}/${uuid()}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Delete a Stallion ProfilePic
  async deleteStallionProfilePic(record: Stallion) {
    // Check Profile pic already exist, if yes delete it from S3
    let profileImageData =
      await this.stallionProfileImageService.findByStallionId(record.id);
    if (profileImageData) {
      //Mark for Deletion - previous profile image
      await this.mediaService.markForDeletion(profileImageData.mediaId);
    }
  }

  //Update a stallion record
  async updateStallion(stallionId: number, data) {
    return this.stallionRepository.update({ id: stallionId }, data);
  }

  //Get Stallions Fee Range
  async getStallionsMinMaxFee(priceMinMaxOptionsDto: PriceMinMaxOptionsDto) {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    let fromCurrencyRate: number | null;
    let toCurrencyRate: number | null;
    let minInputPrice: number | null;
    let maxInputPrice: number | null;
    if (priceMinMaxOptionsDto?.fromCurrency) {
      let fromCurrencyData =
        await this.currenciesService.findCurrencyRateByCurrencyId(
          priceMinMaxOptionsDto?.fromCurrency,
        );
      if (fromCurrencyData) {
        fromCurrencyRate = fromCurrencyData.rate;
      }
    }
    if (priceMinMaxOptionsDto?.toCurrency) {
      let toCurrencyData =
        await this.currenciesService.findCurrencyRateByCurrencyId(
          priceMinMaxOptionsDto?.toCurrency,
        );
      if (toCurrencyData) {
        toCurrencyRate = toCurrencyData.rate;
        destinationCurrencyCode = toCurrencyData.currencyCode;
      }
    }

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'MAX(studFee.id) as studFeeId, studFee.stallionId as feeStallionId',
      )
      .groupBy('studFee.stallionId');

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'MIN(CEILING(stallionservicefee.fee * destCurrency.rate/actCurrency.rate)) minPrice, MAX(CEILING(stallionservicefee.fee * destCurrency.rate/actCurrency.rate)) maxPrice',
      )
      .innerJoin('stallion.farm', 'farm')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('horse.colour', 'colour')
      .innerJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .innerJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )
      .innerJoin('stallionlocation.country', 'country');

    let data = await queryBuilder.getRawOne();
    if (!data) {
      return {
        scaleRange: 0,
        minPrice: 0,
        maxPrice: 0,
        minInputPrice: null,
        maxInputPrice: null,
      };
    }

    if (priceMinMaxOptionsDto?.priceRange) {
      const priceRange = priceMinMaxOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2 && fromCurrencyRate && toCurrencyRate) {
        minInputPrice = Math.round(
          parseInt(priceList[0]) * (toCurrencyRate / fromCurrencyRate),
        );
        maxInputPrice = Math.round(
          parseInt(priceList[1]) * (toCurrencyRate / fromCurrencyRate),
        );
      }
    }
    let scaleRange = Math.round(data.maxPrice / 100);
    return {
      scaleRange: scaleRange,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      minInputPrice: minInputPrice,
      maxInputPrice: maxInputPrice,
    };
  }

  //Get All Stallion Gallery Images
  async getAllStallionGalleryImages(stallionUuid: string) {
    const stallion = await this.getStallionByUuid(stallionUuid);
    return await this.stallionGalleryImageService.getAllStallionGalleryImages(
      stallion.id,
    );
  }

  //Get presignedurl for uploading a gallery image
  async galleryImageUpload(stallionUuid: string, fileInfo: FileUploadUrlDto) {
    let record = await this.getStallionByUuid(stallionUuid);
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
      'file.s3DirStallionGalleryImage',
    )}/${record.stallionUuid}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Profile Update
  async profileUpdate(stallionUuid: string, data: UpdateStallionProfileDto) {
    const member = this.request.user;
    let record = await this.getStallionByUuid(stallionUuid);
    const { farmId } = data;
    let farm = await this.farmService.getFarmByUuid(farmId);
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }
    //Check Horse Already Attached with same farm, other than same stallion record
    const stallionDuplicationCheck =
      await this.getStallionByStallionIdHorseIdAndFarmId(
        record.id,
        record.horseId,
        farm.id,
      );
    if (stallionDuplicationCheck) {
      throw new ConflictException('Stallion with the farm already exist!');
    }
    //delete ProfilePic
    if (data?.isProfileImageDeleted) {
      await this.deleteStallionProfilePic(record);
    }
    //Set ProfilePic
    if (data?.profileImageuuid) {
      await this.setStallionProfilePic(record, data.profileImageuuid);
    }
    // Check Farm, If Farm Changed!
    if (record.farmId !== farm.id) {
      let farmLocation = await this.farmLocationsService.findByFarmId(farm.id);
      let locationData = new UpdateStallionLocationDto();
      // Capture farmLocation Details
      locationData.countryId = farmLocation.countryId;
      locationData.stateId = farmLocation.stateId;

      locationData.stallionId = record.id;
      locationData.modifiedBy = member['id'];
      await this.stallionLocationService.update(record.id, locationData);
    }

    let feeData = new CreateStallionServiceFeeDto();
    feeData.currencyId = data.currencyId;
    feeData.feeYear = data.feeYear;
    feeData.fee = data.fee;
    feeData.feeUpdatedFrom = FeeUpdateEnum.FarmUpdate; //Farm Update

    delete data?.isProfileImageDeleted;
    
    const updateDto = {
      ...data,
      farmId: farm.id,
    };

    const horseName = updateDto?.horseName;
    delete updateDto.currencyId;
    delete updateDto.fee;
    delete updateDto.feeYear;
    delete updateDto.feeUpdatedFrom;
    delete updateDto.profileImageuuid;
    delete updateDto?.horseName;
    updateDto.modifiedBy = member['id'];

    await this.stallionRepository.update(
      { stallionUuid: stallionUuid },
      updateDto,
    );
    if (horseName) {
      await this.horseService.setDefaultName(record.horseId, horseName);
    }
    feeData.stallionId = record.id;
    feeData.createdBy = member['id'];
    await this.stallionServiceFeeService.create(feeData);
    return await this.getCompleteStallionInfo(stallionUuid);
  }

  //Get Complete Stallion Info By stallionUuid
  async getCompleteStallionInfo(
    stallionUuid: string,
  ): Promise<StallionInfoResponseDto> {
    const record = await this.getStallionByUuid(stallionUuid);
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'MAX(studFee.id) as studFeeId, studFee.stallionId as feeStallionId',
      )
      .groupBy('studFee.stallionId');

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select('spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0',
      );

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'stallion.stallionUuid as stallionId, mediaUrl as profilePic, stallion.url, stallion.height, stallion.yearToStud, stallion.yearToRetired, colour.id as colourId, colour.colourName, stallion.overview',
      )
      .addSelect('horse.horseName, horse.yob')
      .addSelect('farm.farmUuid as farmId, farm.farmName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.feeYear as feeYear, stallionservicefee.currencyId as currencyId, stallionservicefee.fee as fee, stallionservicefee.isPrivateFee as isPrivateFee',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect('sire.sireName, sire.sireYob, sire.sireCountryCode')
      .addSelect('dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .innerJoin('stallion.farm', 'farm')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('horse.colour', 'colour')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .leftJoin('stallionservicefee.currency', 'currency')
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      )
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .andWhere('stallion.id = :id', { id: record.id })
      .orderBy('stallionservicefee.id', 'DESC');
    return await queryBuilder.getRawOne();
  }

  //Get All Testimonials By StallionId
  async getAllTestimonialsByStallionId(stallionUuid: string) {
    const stallion = await this.getStallionByUuid(stallionUuid);
    let records =
      await this.stallionTestimonialsService.getAllTestimonialsByStallionId(
        stallion.id,
      );
    return records;
  }

  //Stallion gallery update
  async galleryUpdate(stallionUuid: string, data: UpdateStallionGalleryDto) {
    const record = await this.getStallionByUuid(stallionUuid);
    if (data?.galleryImages) {
      await this.setGalleryImages(record.id, data.galleryImages);
    }
    return await this.getCompleteStallionInfo(stallionUuid);
  }

  //Set Gallery Images
  async setGalleryImages(
    stallionId: number,
    galleryImages: StallionGalleryImageDto[],
  ) {
    let newImages = [];
    let deletedImages = [];
    await galleryImages.reduce(
      async (promise, galleryImage: StallionGalleryImageDto) => {
        await promise;
        if (galleryImage.mediauuid) {
          if (galleryImage.isDeleted) {
            deletedImages.push(galleryImage.mediauuid);
          } else {
            newImages.push(galleryImage.mediauuid);
          }
        }
      },
      Promise.resolve(),
    );
    // Validate Count
    let itemCount =
      await this.stallionGalleryImageService.getImagesCountByStallionId(
        stallionId,
      );
    itemCount = itemCount + newImages.length - deletedImages.length;
    if (itemCount > this.configService.get('file.maxLimitGalleryImage')) {
      throw new UnprocessableEntityException('Max limit reached!');
    }
    let stallionGalleryImageService = this.stallionGalleryImageService;
    await galleryImages.reduce(
      async (promise, galleryImage: StallionGalleryImageDto) => {
        await promise;
        if (galleryImage.mediauuid) {
          if (galleryImage.isDeleted) {
            await this.mediaService.markForDeletionByMediaUuid(
              galleryImage.mediauuid,
            );
          } else {
            let mediaRecord = await this.mediaService.create(
              galleryImage.mediauuid,
            );
            await stallionGalleryImageService.create(
              stallionId,
              mediaRecord.id,
              galleryImage.position,
            );
          }
        }
      },
      Promise.resolve(),
    );
  }

  //Overview Update
  async overviewUpdate(stallionUuid: string, data: UpdateStallionOverviewDto) {
    const member = this.request.user;
    await this.getStallionByUuid(stallionUuid);
    let updateDto = {
      ...data,
      modifiedBy: member['id'],
    };

    await this.stallionRepository.update(
      { stallionUuid: stallionUuid },
      updateDto,
    );
    return await this.getCompleteStallionInfo(stallionUuid);
  }

  //Testimonial Update
  async testimonialUpdate(
    stallionUuid: string,
    data: UpdateStallionTestimonialDto,
  ) {
    const record = await this.getStallionByUuid(stallionUuid);
    //Validate and Set GalleryImage
    if (data?.testimonials) {
      await this.setTestimonials(record.id, data.testimonials);
    }
    return await this.getCompleteStallionInfo(stallionUuid);
  }

  //Set Testimonials
  async setTestimonials(
    stallionId: number,
    testimonials: CreateStallionTestimonialDto[],
  ) {
    let createdTestimonials = [];
    let updatedTestimonials = [];
    let deletedTestimonials = [];
    await testimonials.reduce(
      async (promise, testimonial: CreateStallionTestimonialDto) => {
        await promise;
        if (testimonial.testimonialId) {
          if (testimonial.isDeleted) {
            //Delete Testimonial
            deletedTestimonials.push(testimonial);
          } else {
            //Update Testimonial
            updatedTestimonials.push(testimonial);
          }
        } else {
          //Create Testimonial
          createdTestimonials.push(testimonial);
        }
      },
      Promise.resolve(),
    );

    // Validate Count is Under this.configService.get('file.maxLimitStallionTestimonial')
    let testimonialCount =
      await this.stallionTestimonialsService.getTestimonialCount(stallionId);
    testimonialCount =
      testimonialCount +
      createdTestimonials.length -
      deletedTestimonials.length;
    if (
      testimonialCount >
      this.configService.get('file.maxLimitStallionTestimonial')
    ) {
      throw new UnprocessableEntityException('Testimonials Limit reached!');
    }

    //Delete Testimonials
    await this.deleteTestimonialsFromStallion(stallionId, deletedTestimonials);
    //Update Testimonials
    await this.updateTestimonialsToStallion(stallionId, updatedTestimonials);
    //Add New Testimonials
    await this.addNewTestimonialsToStallion(stallionId, createdTestimonials);
  }

  //Delete Testimonial
  async deleteTestimonialsFromStallion(
    stallionId: number,
    deletedTestimonials: CreateStallionTestimonialDto[],
  ) {
    await deletedTestimonials.reduce(
      async (promise, testimonial: CreateStallionTestimonialDto) => {
        await promise;
        await testimonial?.testimonialMedia.reduce(
          async (promise, media: StallionTestimonialMediaDto) => {
            await promise;
            if (media?.mediauuid && media.isDeleted) {
              await this.mediaService.markForDeletionByMediaUuid(
                media.mediauuid,
              );
            }
          },
          Promise.resolve(),
        );
        await this.stallionTestimonialsService.delete(
          stallionId,
          testimonial.testimonialId,
        );
      },
      Promise.resolve(),
    );
  }

  //Update Testimonial
  async updateTestimonialsToStallion(
    stallionId: number,
    updatedTestimonials: CreateStallionTestimonialDto[],
  ) {
    await updatedTestimonials.reduce(
      async (promise, testimonial: CreateStallionTestimonialDto) => {
        await promise;
        await testimonial?.testimonialMedia.reduce(
          async (promise, media: StallionTestimonialMediaDto) => {
            await promise;
            if (media?.mediauuid) {
              if (media.isDeleted) {
                await this.mediaService.markForDeletionByMediaUuid(
                  media.mediauuid,
                );
              } else {
                // Add Media file
                let mediaRecord = await this.mediaService.create(
                  media.mediauuid,
                );
                await this.stallionTestimonialMediaService.create(
                  testimonial.testimonialId,
                  mediaRecord.id,
                );
              }
            }
          },
          Promise.resolve(),
        );
        let updateTestimonialDto = new UpdateTestimonialDto();
        updateTestimonialDto.title = testimonial.title;
        updateTestimonialDto.description = testimonial.description;
        await this.stallionTestimonialsService.update(
          stallionId,
          testimonial.testimonialId,
          updateTestimonialDto,
        );
      },
      Promise.resolve(),
    );
  }

  //Create Testimonial
  async addNewTestimonialsToStallion(
    stallionId: number,
    createdTestimonials: CreateStallionTestimonialDto[],
  ) {
    await createdTestimonials.reduce(
      async (promise, testimonial: CreateStallionTestimonialDto) => {
        await promise;
        let createTestimonialDto = new CreateStallionTestimonialDto();
        createTestimonialDto.title = testimonial.title;
        // createTestimonialDto.company = testimonial.company
        createTestimonialDto.description = testimonial.description;
        let testimonialRecord = await this.stallionTestimonialsService.create(
          stallionId,
          createTestimonialDto,
        );
        await testimonial?.testimonialMedia.reduce(
          async (promise, media: StallionTestimonialMediaDto) => {
            await promise;
            if (!media.isDeleted) {
              if (media?.mediauuid) {
                // Create Mediafile
                let mediaRecord = await this.mediaService.create(
                  media.mediauuid,
                );
                await this.stallionTestimonialMediaService.create(
                  testimonialRecord['id'],
                  mediaRecord.id,
                );
              }
            }
          },
          Promise.resolve(),
        );
      },
      Promise.resolve(),
    );
  }

  //Get presigned url for testimonial image upload
  async testimonialsMediaUpload(
    stallionUuid: string,
    fileInfo: FileUploadUrlDto,
  ) {
    const record = await this.getStallionByUuid(stallionUuid);
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyVideosAndImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirStallionTestimonialImage',
    )}/${record.stallionUuid}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Get Year To Stud List
  async getYearToStudList() {
    const currentYear = new Date().getFullYear();

    let list = await this.getYearsList(currentYear, 2000, -1);

    let result = [];
    list.map(function (element) {
      result.push({
        id: element,
        value: element,
      });
    });

    return result;
  }

  //Get Years List
  async getYearsList(start, stop, step) {
    let data = Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step,
    );
    return data;
  }

  async findDamSireByName(searchOptions: DamSireNameSearchDto) {
    return await this.stallionRepository.manager.query(
      `EXEC proc_SMPGetStallionDamSireName
          @DamSireName=@0,
          @SortOrder=@1`,
      [searchOptions.damSireName, searchOptions.order],
    );
  }

  async findDamSireBySearchedByMare(searchOptions: DamSireNameSearchDto) {
    const response = await this.stallionRepository.manager.query(
      `EXEC proc_SMPGetSearchedMareDamSireName
          @DamSireName=@0,
          @SortOrder=@1`,
      [searchOptions.damSireName, searchOptions.order],
    );
    var resArr = [];
    response.filter(function (item) {
      var i = resArr.findIndex(
        (x) => x.sireUuid == item.sireUuid && x.sireName == item.sireName,
      );
      if (i <= -1) {
        resArr.push(item);
      }
      return null;
    });

    return resArr;
  }

  //Get Stallions By stallionsIds
  async getManyByUuids(stallionsList) {
    const stallionsIds = this.getStallionsIds(stallionsList);
    if (!stallionsIds.length) {
      return null;
    }
    return this.stallionRepository.find({
      where: { stallionUuid: In(stallionsIds) },
    });
  }

  //Get StallionsIds
  getStallionsIds(list) {
    let stallionsIds = [];
    list.forEach((stallion) => {
      stallionsIds.push(stallion.stallionId);
    });
    return stallionsIds;
  }

  //Get a stallion by id
  async findOneById(id: number) {
    return await this.stallionRepository.findOne({
      id: id,
    });
  }

  //Get Stallion Dashboard Data
  async getStallionDashboardData(options: DashboardDto) {
    let result = await this.stallionRepository.manager.query(
      `EXEC procGetstallionDashboard_new @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let respone = [];
    await result.map(async (record: any) => {
      let diffPercent = 0;
      if (record.PrevValue) {
        diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
      } else {
        diffPercent = Math.round(record.Diff / 0.01);
      }
      respone.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return respone;
  }

  //Get WorldReach Stallions
  async getWorldReachStallions(options: DashboardDto) {
    let result = await this.stallionRepository.manager.query(
      `EXEC procGetStallionDashboardWorlReachStallions @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );

    for (let item of result) {
      item.location = [item.latitude, item.longitude];
    }

    return result;
  }

  //Get Dashborad Report Data
  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case STALLIONDASHBOARDKPI.TOTAL_ACTIVE_STALLIONS:
        qbQuery = `EXEC procGetStallionDashboardTotalStallionsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.TOTAL_PROMOTED_STALLIONS:
        qbQuery = `EXEC procGetStallionDashboardTotalPromotionsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.NEW_STALLIONS:
        qbQuery = `EXEC procGetStallionDashboardTotalNewStallionsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.CHURNED_STALLIONS:
        qbQuery = `EXEC procGetStallionDashboardChurnedStallionsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.MOST_SEARCHED_STALLION:
        qbQuery = `EXEC procGetStallionDashboardMostSearchedStallionsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.LARGEST_NOMINATIONS_SOLD_STALLION:
        qbQuery = `EXEC procGetStallionDashboardLargestNominationsSoldStallionDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.MOST_MESSAGED_STALLION:
        qbQuery = `EXEC procGetStallionDashboardMostMessagedStallionDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.MOST_VIEWED_PROFILE_PAGE:
        qbQuery = `EXEC procGetStallionDashboardMostViewedProfileDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.MOST_ENGAGED_STALLION:
        qbQuery = `EXEC procGetStallionDashboardMostEngagedStallionDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.TOP_REFERRER_STALLION:
        qbQuery = `EXEC procGetstallionDashboardTopReferrerDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.MOST_ACTIVE_STALLION:
        qbQuery = `EXEC procGetStallionDashboardMostActiveStallionDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case STALLIONDASHBOARDKPI.MOST_SUCCESSFUL_STALLION:
        qbQuery = `EXEC procGetStallionDashboardMostSuccessfullStallionDownload @paramDate1=@0, @paramDate2=@1`;

        break;
    }
    if (qbQuery == '') {
      throw new NotFoundException('No Data Exist');
    }
    let result = await this.connection.query(`${qbQuery}`, [
      options.fromDate,
      options.toDate,
    ]);
    if (result.length) {
      let headerList = [];
      let headersData = Object.keys(result[0]);
      await headersData.reduce(async (promise, item) => {
        await promise;
        item;
        let itemObj = {
          header: item,
          key: item,
          width: 30,
        };
        headerList.push(itemObj);
      }, Promise.resolve());
      let file = await this.excelService.generateReport(
        `Report`,
        headerList,
        result,
      );
      return file;
    } else {
      throw new NotFoundException('Data not found for the given date range!');
    }
  }

  //Get Stallion Progeny Tracker
  async getStallionProgenyTracker(
    searchOptionsDto: ProgenyTrackerPageOptionsDto,
    isPagination = 1,
  ) {
    const record = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.horseId as horseId')
      .andWhere('stallion.stallionUuid=:stallionId', {
        stallionId: searchOptionsDto.stallionId,
      })
      .getRawOne();
    if (!record) {
      throw new HttpException('Stallion not found', HttpStatus.NOT_FOUND);
    }
    let entities = await this.stallionRepository.manager.query(
      `EXEC proc_SMPProgenyTracker 
                     @phorseid=@0,
                     @pFromDate=@1,
                     @pToDate=@2,
                     @IsPagination=@3,
                     @page=@4,
                     @size=@5`,
      [
        record.horseId,
        searchOptionsDto.fromDate,
        searchOptionsDto.toDate,
        isPagination,
        searchOptionsDto.page,
        searchOptionsDto.limit,
      ],
    );
    const records = await entities.filter((res) => res.filterType == 'record');
    const countRecord = await entities.filter(
      (res) => res.filterType == 'total',
    );
    if (isPagination) {
      const pageMetaDto = new PageMetaDto({
        itemCount: countRecord[0].totalRecords,
        pageOptionsDto: searchOptionsDto,
      });
      return new PageDto(records, pageMetaDto);
    } else {
      return records;
    }
  }

  //Download stallion records
  async download(searchOptionsDto: SearchOptionsDownloadDto) {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    if (searchOptionsDto?.currency) {
      let currencyData = await this.currenciesService.findOne(
        searchOptionsDto?.currency,
      );
      if (currencyData) {
        destinationCurrencyCode = currencyData.currencyCode;
      }
    }
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let stallionPromotionQueryBuilder = getRepository(StallionPromotion)
      .createQueryBuilder('stallionpromotion')
      .select(
        'DISTINCT stallionpromotion.stallionId as promotedStallionId,stallionpromotion.id as stallionPromotionId, stallionpromotion.startDate, stallionpromotion.endDate, CASE WHEN ((getutcdate() BETWEEN stallionpromotion.startDate AND stallionpromotion.endDate) AND (op.promotionId IS NOT NULL OR stallionpromotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=stallionpromotion.id',
      );

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'MAX(studFee.id) as studFeeId, studFee.stallionId as feeStallionId',
      )
      .groupBy('studFee.stallionId');

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select('spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'stallion.stallionUuid as stallionId, stallion.url,  mediaUrl as profilePic, stallion.height,stallion.reasonId, stallion.yearToStud, stallion.yearToRetired, stallion.isActive ,stallion.modifiedOn as last_updated ,stallion.overview, 50 as profileRating',
      )
      .addSelect('horse.horseName, horse.yob, horse.horseUuid as horseId')
      .addSelect('member.fullName as userName')
      .addSelect('colour.colourName as colourName')
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect('farm.farmName as farmName,farm.farmUuid as farmId')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.fee as fee,stallionservicefee.feeYear as feeYear,stallionservicefee.feeUpdatedFrom as feeUpdatedFrom, stallionservicefee.currencyId as currencyId,stallionservicefee.isPrivateFee as isPrivateFee',
      )
      .addSelect('country.countryName as countryName')
      .addSelect('state.stateName as stateName,state.id as stateId')
      .addSelect(
        'promotion.startDate, promotion.endDate as expiryDate, promotion.stallionPromotionId,promotion.isPromoted',
      )
      .innerJoin('stallion.farm', 'farm')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('horse.colour', 'colour')
      .leftJoin('stallion.member', 'member')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .innerJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      )
      .leftJoin(
        '(' + stallionPromotionQueryBuilder.getQuery() + ')',
        'promotion',
        'promotedStallionId=stallion.id AND promotion.isPromoted=1',
      )
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      );

    if (searchOptionsDto.stallionName) {
      if (searchOptionsDto.isStallionNameExactSearch) {
        queryBuilder.andWhere('horse.horseName =:stallionName', {
          stallionName: searchOptionsDto.stallionName,
        });
      } else {
        queryBuilder.andWhere('horse.horseName like :stallionName', {
          stallionName: `%${searchOptionsDto.stallionName}%`,
        });
      }
    }
    if (searchOptionsDto.farmName) {
      if (searchOptionsDto.isFarmNameExactSearch) {
        queryBuilder.andWhere('farm.farmName =:farmName', {
          farmName: searchOptionsDto.farmName,
        });
      } else {
        queryBuilder.andWhere('farm.farmName like :farmName', {
          farmName: `%${searchOptionsDto.farmName}%`,
        });
      }
    }
    if (searchOptionsDto.stallionId) {
      queryBuilder.andWhere('stallion.stallionUuid = :stallionId', {
        stallionId: searchOptionsDto.stallionId,
      });
    }
    if (searchOptionsDto.farmId) {
      queryBuilder.andWhere('farm.farmUuid = :farmId', {
        farmId: searchOptionsDto.farmId,
      });
    }
    if (searchOptionsDto.country) {
      queryBuilder.andWhere('stallionlocation.countryId = :country', {
        country: searchOptionsDto.country,
      });
    }
    if (searchOptionsDto.state) {
      queryBuilder.andWhere('stallionlocation.stateId = :state', {
        state: searchOptionsDto.state,
      });
    }
    if (searchOptionsDto.colour) {
      queryBuilder.andWhere('colour.id = :colour', {
        colour: searchOptionsDto.colour,
      });
    }
    if (searchOptionsDto.currency) {
      queryBuilder.andWhere('stallionservicefee.currencyId = :currency', {
        currency: searchOptionsDto.currency,
      });
    }
    if (searchOptionsDto.sireName) {
      queryBuilder.andWhere('sireName like :sireName', {
        sireName: `%${searchOptionsDto.sireName}%`,
      });
    }
    if (searchOptionsDto.feeYear) {
      queryBuilder.andWhere('stallionservicefee.feeYear = :feeYear', {
        feeYear: searchOptionsDto.feeYear,
      });
    }
    if (searchOptionsDto.fee) {
      queryBuilder.andWhere('stallionservicefee.fee = :fee', {
        fee: searchOptionsDto.fee,
      });
    }
    if (searchOptionsDto.feeUpdatedBy) {
      queryBuilder.andWhere(
        'stallionservicefee.feeUpdatedFrom = :feeUpdatedFrom',
        { feeUpdatedFrom: searchOptionsDto.feeUpdatedBy },
      );
    }
    if (searchOptionsDto.feeStatus) {
      let feeStatus = searchOptionsDto.feeStatus == 1 ? 1 : 0;
      queryBuilder.andWhere('stallionservicefee.isPrivateFee = :isPrivateFee', {
        isPrivateFee: feeStatus,
      });
    }

    if (searchOptionsDto.promoted == true) {
      queryBuilder.andWhere('promotion.isPromoted= :isPromoted', {
        isPromoted: 1,
      });
    }
    if (searchOptionsDto.promoted == false) {
      queryBuilder.andWhere(
        new Brackets((subQ) => {
          subQ
            .where('promotion.isPromoted= :isPromoted', { isPromoted: 0 })
            .orWhere('promotion.isPromoted IS NULL');
        }),
      );
    }
    if (searchOptionsDto.startDate) {
      const createdDateRange = searchOptionsDto.startDate;
      let dateList = createdDateRange.split('/');
      if (dateList.length === 2) {
        var minDate = dateList[0];
        var maxDate = dateList[1];
      }
      queryBuilder.andWhere(
        'promotion.startDate >= CONVERT(date, :minDate) AND promotion.endDate <= CONVERT(date, :maxDate)',
        {
          minDate,
          maxDate,
        },
      );
    }
    if (searchOptionsDto.priceRange) {
      const priceRange = searchOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        if (searchOptionsDto.includePrivateFee) {
          queryBuilder.andWhere(
            '((stallionservicefee.fee * destCurrency.rate/actCurrency.rate) >= :minPrice AND (stallionservicefee.fee * destCurrency.rate/actCurrency.rate) <= :maxPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1',
            {
              minPrice,
              maxPrice,
            },
          );
        } else {
          queryBuilder.andWhere(
            '(stallionservicefee.fee * destCurrency.rate/actCurrency.rate) >= :minPrice AND (stallionservicefee.fee * destCurrency.rate/actCurrency.rate) <= :maxPrice',
            {
              minPrice,
              maxPrice,
            },
          );
        }
      }
    }
    if (!searchOptionsDto.priceRange && searchOptionsDto.includePrivateFee) {
      queryBuilder.andWhere('stallionservicefee.isPrivateFee = :isPrivateFee', {
        isPrivateFee: 1,
      });
    }

    let entities = await queryBuilder.getRawMany();
    let stallionsIds = [];
    let newList = [];

    entities.forEach((st) => {
      if (!stallionsIds.includes(st.stallionId)) {
        stallionsIds.push(st.stallionId);
        newList.push(st);
      }
    });

    return newList;
  }

  //Get Stallions By CountryId
  async findStallionsByCountryId(countryId: number) {
    const queryBuilder = await this.stallionRepository
      .createQueryBuilder('stallion')
      .select('stallion.id as id, stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName, horse.yob, horse.horseUuid as horseId')
      .addSelect('country.countryName as countryName')
      .innerJoin('stallion.horse', 'horse')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin('stallionlocation.country', 'country')
      .andWhere('stallionlocation.countryId = :countryId', {
        countryId: countryId,
      })
      .getRawMany();

    return queryBuilder;
  }

  //Get All Stallions Searched By Users
  async getAllStallionsSearchedByUsers(
    searchOptionsDto: TrackedStallionSearchDto,
  ) {
    let searchedStallionsQueryBuilder = await getRepository(ActivityEntity)
      .createQueryBuilder('activity')
      .select(
        'DISTINCT activity.stallionId, horse.horseName as stallionName, activity.farmId as farmId, farmlocations.countryId as countryId',
      )
      .innerJoin('activity.farm', 'farm')
      .innerJoin('farm.farmlocations', 'farmlocations')
      .innerJoin('activity.stallion', 'stallion')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('activity.activityTypeId = :activityType', { activityType: ACTIVITY_TYPE.READ })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: true })
      .andWhere('stallion.isActive = :isActive', { isActive: true });
    if (searchOptionsDto.stallionName) {
      searchedStallionsQueryBuilder.andWhere(
        'horse.horseName like :stallionName',
        { stallionName: '%' + searchOptionsDto.stallionName + '%' },
      );
    }
    if (searchOptionsDto.farmIds && searchOptionsDto.farmIds.length > 0) {
      searchedStallionsQueryBuilder.andWhere(
        'activity.farmId IN(:...farmIds)',
        { farmIds: searchOptionsDto.farmIds },
      );
    }
    if (searchOptionsDto.countries && searchOptionsDto.countries.length > 0) {
      searchedStallionsQueryBuilder.andWhere(
        'farmlocations.countryId IN(:...countryIds)',
        { countryIds: searchOptionsDto.countries },
      );
    }
    const entities1 = await searchedStallionsQueryBuilder.getRawMany();

    const favStallionsQueryBuilder = await getRepository(FavouriteStallion)
      .createQueryBuilder('favouriteStallion')
      .select(
        'distinct stallion.stallionUuid as stallionId, horse.horseName as stallionName, farm.farmUuid farmId, farmlocations.countryId',
      )
      .innerJoin('favouriteStallion.stallion', 'stallion')
      .innerJoin('stallion.farm', 'farm')
      .innerJoin('farm.farmlocations', 'farmlocations')
      .innerJoin('stallion.horse', 'horse');
    if (searchOptionsDto.stallionName) {
      favStallionsQueryBuilder.andWhere('horse.horseName like :horseName', {
        horseName: '%' + searchOptionsDto.stallionName + '%',
      });
    }
    if (searchOptionsDto.farmIds && searchOptionsDto.farmIds.length > 0) {
      favStallionsQueryBuilder.andWhere('farm.farmUuid IN(:...farmIds)', {
        farmIds: searchOptionsDto.farmIds,
      });
    }
    if (searchOptionsDto.countries && searchOptionsDto.countries.length > 0) {
      favStallionsQueryBuilder.andWhere(
        'farmlocations.countryId IN(:...countryIds)',
        { countryIds: searchOptionsDto.countries },
      );
    }
    const entities2 = await favStallionsQueryBuilder.getRawMany();

    const trackedFarmsQueryBuilder = await getRepository(FavouriteFarm)
      .createQueryBuilder('favouriteFarm')
      .select(
        'distinct farm.farmUuid as farmId, farm.farmName as farmName, farmlocations.countryId',
      )
      .innerJoin('favouriteFarm.farm', 'farm')
      .innerJoin('farm.farmlocations', 'farmlocations');
    if (searchOptionsDto.stallionName) {
      trackedFarmsQueryBuilder.andWhere('farm.farmName like :farmName', {
        farmName: '%' + searchOptionsDto.farmName + '%',
      });
    }
    if (searchOptionsDto.farmIds && searchOptionsDto.farmIds.length > 0) {
      trackedFarmsQueryBuilder.andWhere('farm.farmUuid IN(:...farmIds)', {
        farmIds: searchOptionsDto.farmIds,
      });
    }

    if (searchOptionsDto.countries && searchOptionsDto.countries.length > 0) {
      trackedFarmsQueryBuilder.andWhere(
        'farmlocations.countryId IN(:...countryIds)',
        { countryIds: searchOptionsDto.countries },
      );
    }

    const entities3 = await trackedFarmsQueryBuilder.getRawMany();

    const trackedDamsireQueryBuilder = await getRepository(
      FavouriteBroodmareSire,
    )
      .createQueryBuilder('favouriteBroodmareSire')
      .select(
        'distinct horse.horseUuid as horseId, horse.horseName, horse.countryId',
      )
      .innerJoin('favouriteBroodmareSire.horse', 'horse', 'horse.isVerified=1');

    if (searchOptionsDto.stallionName) {
      trackedDamsireQueryBuilder.andWhere('horse.horseName like :horseName', {
        horseName: '%' + searchOptionsDto.damSireName + '%',
      });
    }
    if (searchOptionsDto.countries && searchOptionsDto.countries.length > 0) {
      trackedDamsireQueryBuilder.andWhere(
        'horse.countryId IN(:...countryIds)',
        { countryIds: searchOptionsDto.countries },
      );
    }
    const entities4 = await trackedDamsireQueryBuilder.getRawMany();

    let searchedFarmCountriesQueryBuilder = await getRepository(ActivityEntity)
      .createQueryBuilder('activity')
      .select('DISTINCT country.id, country.countryName, farm.farmUuid farmId')
      .innerJoin('activity.farm', 'farm')
      .innerJoin('farm.farmlocations', 'farmlocations')
      .innerJoin('farmlocations.country', 'country');

    if (searchOptionsDto.farmIds && searchOptionsDto.farmIds.length > 0) {
      searchedFarmCountriesQueryBuilder.andWhere(
        'activity.farmId IN(:...farmIds)',
        { farmIds: searchOptionsDto.farmIds },
      );
    }
    const entities5 = await searchedFarmCountriesQueryBuilder.getRawMany();

    return {
      searchedStallions: entities1,
      TrackedStallions: entities2,
      TrackedFarms: entities3,
      TrackedDamsire: entities4,
      countries: entities5,
    };
  }

  //Get Analytics Download
  async analyticsDownload(searchOptionsDto: DashboardDto) {
    const queryBuilder = await this.findOne(searchOptionsDto.stallionId);

    let keyStatistics = await this.getKeyStatisticsForReport(searchOptionsDto);
    let closeAnalytics = await this.getCloseAnalyticsForReport(
      searchOptionsDto,
    );
    let matchedMares = await this.findMatchedMares(searchOptionsDto);
    await matchedMares.reduce(async (promise, item) => {
      await promise;
      item.totalPrizeMoneyEarned = await this.commonUtilsService.insertCommas(
        item.totalPrizeMoneyEarned,
      );
      item.mareName = await this.commonUtilsService.toTitleCase(item.mareName);
      item.sireName = await this.commonUtilsService.toTitleCase(item.sireName);
      item.damName = await this.commonUtilsService.toTitleCase(item.damName);
    }, Promise.resolve());
    await matchedMares.sort((a, b)=>{
      if (a.mareName < b.mareName) {return -1;}
      if (a.mareName > b.mareName) {return 1;}
      return 0;
    });
    let progenyDto = new ProgenyTrackerPageOptionsDto();
    progenyDto.fromDate = searchOptionsDto.fromDate;
    progenyDto.toDate = searchOptionsDto.toDate;
    progenyDto.stallionId = searchOptionsDto.stallionId;
    let progenyTracker = await this.getStallionProgenyTracker(progenyDto, 0);
    let stallionMatchActivity =
      await this.searchSMService.stallionMatchActivity(searchOptionsDto);

    var month = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    let smSearchesDataset = [],
      ttMatchesDataset = [],
      perfectMatchesDataset = [],
      lablesOfLineChart = [];
    let xKey = stallionMatchActivity[0].xKey;
    stallionMatchActivity[0].data.forEach((item) => {
      let label = '';
      if (xKey === 'days') {
        let index: any = new Date().getMonth();
        label = item.createdOn + ' ' + month[index];
      } else if (xKey === 'months') {
        label = month[item.createdOn - 1];
      } else if (xKey === 'years' || xKey === 'year') {
        label = item.createdOn;
      }
      lablesOfLineChart.push(label !== '' ? label : item.createdOn);
      ttMatchesDataset.push(item.ttMatches);
      smSearchesDataset.push(item.smSearches);
      perfectMatchesDataset.push(item.perfectMatches);
    });
    if (searchOptionsDto.filterBy?.toLowerCase() === 'today' || (smSearchesDataset.length == 1 && ttMatchesDataset.length == 1 && perfectMatchesDataset.length == 1)) {
      lablesOfLineChart.push('');
    }

    let data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathPortalReportTemplateStyles',
      ),
      stallionName: await this.commonUtilsService.toTitleCase(
        queryBuilder?.horseName,
      ),
      // serviceFee: queryBuilder?.currencySymbol + queryBuilder?.fee,
      serviceFee:
        queryBuilder?.currencySymbol +
        (await this.commonUtilsService.insertCommas(queryBuilder?.fee)),
      yob: queryBuilder?.yob,
      profilePic: queryBuilder?.profilePic
        ? queryBuilder?.profilePic
        : process.env.DEFAULT_STALLION_PROFILE_IMAGE,
      infoIcon: process.env.INFO_ICON,
      profileRating: queryBuilder?.profileRating
        ? queryBuilder?.profileRating
        : 0,
      reportDateRange:
        (await this.commonUtilsService.dateFormate(
          new Date(searchOptionsDto.fromDate),
        )) +
        ' - ' +
        (await this.commonUtilsService.dateFormate(
          new Date(searchOptionsDto.toDate),
        )),
      keyStatistics: await this.setKeyStatisticsNullToZero(keyStatistics[0]),
      matchedMares: matchedMares,
      progenyTracker: progenyTracker,
      closeAnalytics: await this.setNullToZero(closeAnalytics[0]),
    };

    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/stallion-report.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `SM_SEARCHES_DATA`,
      `SM_SEARCHES_DATA = ` + JSON.stringify(smSearchesDataset),
    );
    contents = contents.replace(
      `TT_MATCHES_DATA`,
      `TT_MATCHES_DATA = ` + JSON.stringify(ttMatchesDataset),
    );
    contents = contents.replace(
      `PERFECT_MATCHES_DATA`,
      `PERFECT_MATCHES_DATA = ` + JSON.stringify(perfectMatchesDataset),
    );
    contents = contents.replace(
      `LABLES_OF_LINE_CHART`,
      `LABLES_OF_LINE_CHART = ` + JSON.stringify(lablesOfLineChart),
    );
    contents = contents.replace(
      `PROGRESS_BAR`,
      `PROGRESS_BAR = ` +
        JSON.stringify(
          queryBuilder?.profileRating ? queryBuilder?.profileRating : 0,
        ),
    );
    let pdfObj = `reports/${uuid()}/stallion-report.pdf`
   let pdfObj2 = `${this.configService.get(
    'file.s3DirStallionReportPdf',
  )}/${pdfObj}`
    let s3ReportLocation = await this.htmlToPdfService.generatePDFTwo(
      contents,
      `${this.configService.get(
        'file.s3DirStallionReportPdf',
      )}/${pdfObj}`,
      data,
      [],
    );
    return [
      {
        downloadUrl: await this.fileUploadsService.generateGetPresignedUrl(
          s3ReportLocation,
        ),
        pdfObj:pdfObj2
      },
    ];
  }

  async setNullToZero(closeAnalytics) {
    for (const key in closeAnalytics) {
      if (closeAnalytics.hasOwnProperty(key)) {
        if (!closeAnalytics[key]) {
          closeAnalytics[key] = 0;
        }else{
          closeAnalytics[key] = parseInt(closeAnalytics[key]);
        }
      }
    }
       
    closeAnalytics['SMSearchesDiff'] = Math.abs(closeAnalytics['SMSearches']-closeAnalytics['PreviousSMSearches']);
    closeAnalytics['TwentyTwentyMatchesDiff'] = Math.abs(closeAnalytics['TwentyTwentyMatches']-closeAnalytics['PreviousTwentyTwentyMatches']);
    closeAnalytics['PerfectMatchesDiff'] = Math.abs(closeAnalytics['PerfectMatches']-closeAnalytics['PreviousPerfectMatches']);
    closeAnalytics['PageViewsDiff'] = closeAnalytics['PageViews']-closeAnalytics['PreviousPageViews'];
    closeAnalytics['MessagesDiff'] = closeAnalytics['Messages']-closeAnalytics['PreviousMessages'];
    closeAnalytics['NominationsDiff'] = closeAnalytics['Nominations']-closeAnalytics['PreviousNominations'];
    
    if (closeAnalytics['PreviousPageViews']) {
      closeAnalytics['PageViewsDiffPercent'] = Math.round((closeAnalytics['PageViewsDiff'] / closeAnalytics['PreviousPageViews']) * 100);
    } else {
      closeAnalytics['PageViewsDiffPercent'] = Math.round(closeAnalytics['PageViewsDiff'] / 0.01);
    }

    if (closeAnalytics['PreviousMessages']) {
      closeAnalytics['MessagesDiffPercent'] = Math.round((closeAnalytics['MessagesDiff'] / closeAnalytics['PreviousMessages']) * 100);
    } else {
      closeAnalytics['MessagesDiffPercent'] = Math.round(closeAnalytics['MessagesDiff'] / 0.01);
    }
    if (closeAnalytics['PreviousNominations']) {
      closeAnalytics['NominationsDiffPercent'] = Math.round((closeAnalytics['NominationsDiff'] / closeAnalytics['PreviousNominations']) * 100);
    } else {
      closeAnalytics['NominationsDiffPercent'] = Math.round(closeAnalytics['NominationsDiff'] / 0.01);
    }

    closeAnalytics['PageViewsDiff'] = Math.abs(closeAnalytics['PageViewsDiff']);
    closeAnalytics['MessagesDiff'] = Math.abs(closeAnalytics['MessagesDiff']);
    closeAnalytics['NominationsDiff'] = Math.abs(closeAnalytics['NominationsDiff']);
    
    return closeAnalytics;
  }

  async setKeyStatisticsNullToZero(keyStatistics) {

    for (const key in keyStatistics[0]) {
      if (keyStatistics.hasOwnProperty(key)) {
        if (!keyStatistics[key]) {
          keyStatistics[key] = 0;
        }else{
          keyStatistics[key] = parseInt(keyStatistics[key]);
        }
      }
    }
    
    keyStatistics['TotalRunnersDiff'] = Math.abs(keyStatistics['TotalRunners']-keyStatistics['PreviousTotalRunners']);
    keyStatistics['TotalWinnersDiff'] = Math.abs(keyStatistics['TotalWinners']-keyStatistics['PreviousTotalWinners']);
    keyStatistics['TotalStakeWinnersDiff'] = Math.abs(keyStatistics['TotalStakeWinners']-keyStatistics['PreviousTotalStakeWinners']);
    keyStatistics['StakeWinnersRunnersPercDiff'] = Math.abs(keyStatistics['StakeWinnersRunnersPerc']-keyStatistics['PreviousStakeWinnersRunnersPerc']);
    keyStatistics['MaleRunnersDiff'] = Math.abs(keyStatistics['MaleRunners']-keyStatistics['PreviousMaleRunners']);
    keyStatistics['FemaleRunnersDiff'] = Math.abs(keyStatistics['FemaleRunners']-keyStatistics['PreviousFemaleRunners']);
    keyStatistics['WinnersRunnersPercDiff'] = Math.abs(keyStatistics['WinnersRunnersPerc']-keyStatistics['PreviousWinnersRunnersPerc']);
         
    keyStatistics['MaleRunnersCurrPerc'] = await this.getPercValue(keyStatistics['MaleRunners'],keyStatistics['FemaleRunners']);
    keyStatistics['PreviousMaleRunnersPerc'] = await this.getPercValue(keyStatistics['PreviousMaleRunners'],keyStatistics['PreviousFemaleRunners']);

    return keyStatistics;
  }

  async getPercValue(a: any, b: any) {
    let percValue: any = 0;
    if (a && b) {
      percValue = ((a / b) * 100).toFixed(2);
    }
    if (!b) {
      percValue = 0;
    }
    return percValue;
  }

  //Stud fee History Download
  async studfeeHistoryDownload(searchOptionsDto: DashboardDto) {
    const queryBuilder = await this.findOne(searchOptionsDto.stallionId);
    let pageOptionsDtoNew = new pageOptionsDto();
    if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
      pageOptionsDtoNew.date = `${searchOptionsDto.fromDate}-${searchOptionsDto.toDate}`;
    }
    pageOptionsDtoNew.skip;
    let studFeeHistory: any =
      await this.stallionServiceFeeService.studFeeHistory(
        searchOptionsDto.stallionId,
        pageOptionsDtoNew,
        0,
      );
    await studFeeHistory.reduce(async (promise, item) => {
      await promise;
      item.previousFee = await this.commonUtilsService.insertCommas(
        item.previousFee,
      );
      item.updatedFee = await this.commonUtilsService.insertCommas(
        item.updatedFee,
      );
      item.updatedOn = await this.commonUtilsService.parseDateAsDotFormat(
        item.updatedOn,
      );
      item.updatedBy = await this.commonUtilsService.toTitleCase(
        item.updatedBy,
      );
    }, Promise.resolve());
    let studFeeChart = await this.stallionServiceFeeService.studFeeChart(
      searchOptionsDto.stallionId,
      pageOptionsDtoNew,
    );
    let priceDataset = [];
    let lablesOfLineChart = [];
    if (studFeeChart) {
      priceDataset = studFeeChart.price;
      lablesOfLineChart = studFeeChart.year;
    }

    let data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      pathPortalReportTemplateStyles: this.configService.get(
        'file.pathPortalReportTemplateStyles',
      ),
      stallionName: await this.commonUtilsService.toTitleCase(
        queryBuilder?.horseName,
      ),
      serviceFee:
        queryBuilder?.currencySymbol +
        (await this.commonUtilsService.insertCommas(queryBuilder?.fee)),
      yob: queryBuilder?.yob,
      profilePic: queryBuilder?.profilePic
        ? queryBuilder?.profilePic
        : this.configService.get('file.reportHorseProfileDefaultImage'),
      profileRating: queryBuilder?.profileRating
        ? queryBuilder?.profileRating
        : 0,
      studFeeHistory: studFeeHistory,
    };

    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/studfee-history.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `PRICE_DATA`,
      `PRICE_DATA = ` + JSON.stringify(priceDataset),
    );
    contents = contents.replace(
      `LABLES_OF_LINE_CHART`,
      `LABLES_OF_LINE_CHART = ` + JSON.stringify(lablesOfLineChart),
    );
    contents = contents.replace(
      `PROGRESS_BAR`,
      `PROGRESS_BAR = ` +
        JSON.stringify(
          queryBuilder?.profileRating ? queryBuilder?.profileRating : 0,
        ),
    );
   let pdfObj = `studfee-history/${uuid()}/studfee-history.pdf`
   let pdfObj2 = `${this.configService.get(
    'file.s3DirStallionReportPdf',
  )}/${pdfObj}`
    let s3ReportLocation = await this.htmlToPdfService.generatePDFTwo(
      contents,
      `${this.configService.get(
        'file.s3DirStallionReportPdf',
      )}/${pdfObj}`,
      data,
      [],
    );
    return [
      {
        downloadUrl: await this.fileUploadsService.generateGetPresignedUrl(
          s3ReportLocation,
        ),
        pdfObj:pdfObj2
      },
    ];
  }

  //Get KeyStatistics For Report
  async getKeyStatisticsForReport(searchOptionsDto: DashboardDto) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId')
      .addSelect('horse.id as horseId')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: searchOptionsDto.stallionId,
      })
      .getRawOne();
    if (!entities) {
      throw new NotFoundException('Stallion not found');
    }

    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    const curr = new Date(); // get current date
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        // toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
        toDate = curr;
      }else if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        fromDate = new Date(curr.setDate(first));
        toDate = new Date();
      }else if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        // toDate = new Date(curr.getFullYear(), 11, 31);
        toDate = curr;
      }else if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
        }
      }
    }

    fromDate = await this.commonUtilsService.setHoursZero(fromDate);
    toDate = await this.commonUtilsService.setToMidNight(toDate);
    const finalData = await this.stallionRepository.manager.query(
      `EXEC proc_StallionReportKeyStatistics
                   @pStallionId=@0,
                   @pFromDate=@1,
                   @pToDate=@2
                   `,
      [entities.stallionId,fromDate,toDate ],
    );
    return finalData;
  }

  //Get CloseAnalytics For Report
  async getCloseAnalyticsForReport(searchOptionsDto: DashboardDto) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId')
      .addSelect('horse.id as horseId')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: searchOptionsDto.stallionId,
      })
      .getRawOne();
    if (!entities) {
      throw new NotFoundException('Stallion not found');
    }

    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    const curr = new Date(); // get current date
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        // toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
        toDate = curr;
      }else if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        fromDate = new Date(curr.setDate(first));
        toDate = new Date();
      }
      if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        // toDate = new Date(curr.getFullYear(), 11, 31);
        toDate = curr;
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
        }
      }
    }

    fromDate = await this.commonUtilsService.setHoursZero(fromDate);
    toDate = await this.commonUtilsService.setToMidNight(toDate);

    const finalData = await this.stallionRepository.manager.query(
      `EXEC proc_StallionReportCloseAnalytics
                   @pStallionId=@0,
                   @pFromDate=@1,
                   @pToDate=@2`,
        [entities.stallionId, fromDate, toDate],
    );

    if(finalData.length){
      await this.setNullToZero(finalData[0])
    }
    return finalData;
  }

  //Get all Matched Mares
  async findMatchedMares(searchOptionsDto: DashboardDto) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId')
      .addSelect('horse.id as horseId')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: searchOptionsDto.stallionId,
      })
      .getRawOne();

    if (!entities) {
      throw new NotFoundException('Stallion not found');
    }
    const items = await this.stallionRepository.manager.query(
      `EXEC proc_SMPMatchMareStallionMatch
                     @pstallionid=@0,
                     @pFromDate=@1,
                     @pToDate=@2,
                     @IsPagination=@3
                     `,
      [
        entities.stallionId,
        await this.commonUtilsService.setHoursZero(searchOptionsDto.fromDate),
        await this.commonUtilsService.setToMidNight(searchOptionsDto.toDate),
        0,
      ],
    );
    return items;
  }

  //Get Stallion With Farm By stallionId
  async getStallionWithFarm(stallionId: string) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as id, stallion.stallionUuid as stallionId')
      .addSelect('horse.id as horseId, horse.horseName as horseName')
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('stallion.farm', 'farm')
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: stallionId,
      })
      .getRawOne();

    if (!entities) {
      throw new NotFoundException('Stallion not found');
    }
    return entities;
  }
  /* Get Stallions By Fee Range */
  async findStallionsInFeeRange(searchOptionsDto: FeeRangeSearchDto) {
    if (!searchOptionsDto.country || !searchOptionsDto.currency) {
      throw new UnprocessableEntityException('Missing country/currency data!');
    }
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    if (searchOptionsDto?.currency) {
      let currencyData = await this.currenciesService.findOne(
        searchOptionsDto?.currency,
      );
      if (currencyData) {
        destinationCurrencyCode = currencyData.currencyCode;
      }
    }

    let studFeeSubQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'studFee.stallionId as stallionId, MAX(studFee.feeYear) as studFeeYear',
      )
      .groupBy('studFee.stallionId');

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('t1')
      .select('MAX(t1.id) studFeeId, t1.stallionId feeStallionId')
      .innerJoin(
        '(' + studFeeSubQueryBuilder.getQuery() + ')',
        't2',
        't2.stallionId=t1.stallionId and t1.feeYear=t2.studFeeYear',
      )
      .groupBy('t1.stallionId');

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select('stallion.stallionUuid AS stallionId')
      .addSelect('horse.horseName AS horseName')
      .addSelect(
        'stallionservicefee.fee AS fee, (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) AS convFee',
      )
      .addSelect(
        'stallionservicefee.feeYear AS feeYear, stallionservicefee.isPrivateFee AS isPrivateFee',
      )
      .innerJoin(
        'stallion.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('horse.colour', 'colour')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .innerJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )
      .innerJoin('stallionlocation.country', 'country');

    queryBuilder
      .andWhere('stallion.isActive=:isActive', { isActive: 1 })
      .andWhere('stallion.isVerified=:isVerified', { isVerified: 1 });

    const countryList = searchOptionsDto.country.split(',');
    if (countryList.length > 0) {
      queryBuilder.andWhere('stallionlocation.countryId IN (:...countryList)', {
        countryList: countryList,
      });
    }
    if (searchOptionsDto.priceRange) {
      const priceRange = searchOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        if (searchOptionsDto.includePrivateFee) {
          if (maxPrice === '1000000') {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
              },
            );
          } else {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
                maxPrice,
              },
            );
          }
        } else {
          if (maxPrice === '1000000') {
            queryBuilder.andWhere(
              '(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND stallionservicefee.isPrivateFee=0',
              {
                minPrice,
              },
            );
          } else {
            queryBuilder.andWhere(
              '(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0',
              {
                minPrice,
                maxPrice,
              },
            );
          }
        }
      }
    } else {
      if (!searchOptionsDto.includePrivateFee) {
        queryBuilder.andWhere(
          'stallionservicefee.isPrivateFee = :isPrivateFee',
          {
            isPrivateFee: 0,
          },
        );
      }
    }
    queryBuilder.orderBy('horse.horseName', searchOptionsDto.order);
    const entitiesWithoutLimit = await queryBuilder.getRawMany();
    const nonPrivateFeeStallions = entitiesWithoutLimit.filter(
      (obj) => obj.isPrivateFee === false,
    );
    let min = 0,
      max = 1000000;
    if (
      searchOptionsDto.currency ||
      searchOptionsDto.country ||
      searchOptionsDto.priceRange ||
      searchOptionsDto.includePrivateFee ||
      !searchOptionsDto.includePrivateFee
    ) {
      min = Math.min(...nonPrivateFeeStallions.map((item) => item.convFee));
      max = Math.max(...nonPrivateFeeStallions.map((item) => item.convFee));
    }

    return {
      data: entitiesWithoutLimit,
      priceRange: { min, max },
      length: entitiesWithoutLimit.length,
    };
  }

  /* Get All Stallion Locations */
  async getAllStallionLocations() {
    let data = await this.stallionRepository.manager.query(
      `EXEC proc_SMPGetAllStallionsCountries`,
    );
    return await this.commonUtilsService.getCountryStatesFromFilter(data);
  }
}
