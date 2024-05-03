import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ExcelService } from 'src/excel/excel.service';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { HorseNameAlias } from 'src/horse-name-alias/entities/horse-name-alias.entity';
import { HorseProfileImage } from 'src/horse-profile-image/entities/horse-profile-image.entity';
import { HorseProfileImageService } from 'src/horse-profile-image/horse-profile-image.service';
import { KeyWordsSearchOptionsDto } from 'src/key-words-search/dto/key-words-search-options.dto';
import { MediaService } from 'src/media/media.service';
import { Member } from 'src/members/entities/member.entity';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationTypeService } from 'src/notification-types/notification-types.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Runner } from 'src/runner/entities/runner.entity';
import { StallionRequestsService } from 'src/stallion-requests/stallion-requests.service';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { getResponseObjectFromEnum } from 'src/utils/common';
import { HORSEDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import {
  DEFAULTMAINHORSEOBJECT,
  DEFAULTPEDIGREEHORSEOBJECT,
} from 'src/utils/constants/horse';
import {
  notificationTemplates,
  notificationTypeList,
} from 'src/utils/constants/notifications';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import {
  Brackets,
  Connection,
  In,
  Not,
  Repository,
  UpdateResult,
  getRepository,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AccuracyProfile } from './accuracy-profile.enum';
import { DamStatus } from './dam-status.enum';
import { CreateAlongWithSireOrDamDto } from './dto/create-along-with-sire-or-dam.dto';
import { CreateHorseDto } from './dto/create-horse.dto';
import { CreateNewHorseWithPedigreeHorseItemDto } from './dto/create-new-horse-with-pedigree-horseitem.dto';
import { DamNameSearchDto } from './dto/dam-name-search.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { HorseNameSearchDto } from './dto/horse-name-search.dto';
import { HorseProfileImageUploadDto } from './dto/horse-profile-image-upload.dto';
import { ProgenyResponseDto } from './dto/progeny-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SireNameSearchDto } from './dto/sire-name-search.dto';
import { UpdateHorseDto } from './dto/update-horse.dto';
import { UpdatePedigreeDto } from './dto/update-pedigree.dto';
import { Eligibility } from './eligibility.enum';
import { HorseBulk } from './entities/horse-bulk.entity';
import { Horse } from './entities/horse.entity';
import { HorseProgenyCountView } from './entities/view/horse-progeny-count-view.entity';
import { RunnerStatus } from './runner-status.enum';
import { SireStatus } from './sire-status.enum';
import { StakesStatus } from './stakes-status.enum';
import { MareRequestsService } from 'src/mare-requests/mare-requests.service';

@Injectable({ scope: Scope.REQUEST })
export class HorsesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Horse)
    private horseRepository: Repository<Horse>,
    @InjectRepository(Stallion)
    private stallionRepository: Repository<Stallion>,
    @InjectRepository(HorseBulk)
    private horseBulkRepository: Repository<HorseBulk>,
    private eventEmitter: EventEmitter2,
    private commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    private readonly connection: Connection,
    private excelService: ExcelService,
    private mediaService: MediaService,
    private fileUploadsService: FileUploadsService,
    private horseProfileImageService: HorseProfileImageService,
    private stallionRequestsService: StallionRequestsService,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    private notificationTypeService: NotificationTypeService,
    private mareRequestsService: MareRequestsService,
    ) {}

  //Create a Horse Record
  async create(createHorseDto: CreateHorseDto) {
    const member = this.request.user;
    const { progenyId } = createHorseDto;
    let pedigree = await this.horseRepository.findOne({ horseUuid: progenyId });
    if (pedigree) {
      pedigree = await this.horseRepository.findOne({ horseUuid: progenyId });
      if (!pedigree) {
        throw new UnprocessableEntityException('Pedigree not exist!');
      }
    }
    if (createHorseDto?.tag) {
      if (createHorseDto?.tag == 'S' && createHorseDto.sex == 'F') {
        throw new UnprocessableEntityException('Sire not valid!');
      }
      if (createHorseDto?.tag == 'D' && createHorseDto.sex == 'M') {
        throw new UnprocessableEntityException('Dam not valid!');
      }
    }
    await this.isHorseExist(createHorseDto);
    createHorseDto.createdBy = member['id'];
    createHorseDto.verifiedBy = member['id'];
    const createDto = {
      ...createHorseDto,
      isVerified: true,
      isActive: true,
    };

    const horseResponse = await this.horseRepository.save(
      this.horseRepository.create(createDto),
    );

    // Set pedigreeId
    await this.setPedigree(horseResponse, pedigree?.id, member['id']);
    //Add New Horse To Pedigree
    await this.addHorseToPedigree(horseResponse.id);

    //Update horse request
    if (createHorseDto?.requestId) {
      createHorseDto['horseId'] = horseResponse.id
      await this.sendNotification(createHorseDto);
    }
    return horseResponse;
  }

  //Create New Horse For Pedigree Position - Add Horse scenarion
  // async createForPedigreePosition(createHorseDto: CreateHorseNoProgenyidDto) {
  //   const member = this.request.user;
  //   if (createHorseDto?.tag) {
  //     if (createHorseDto?.tag == 'S' && createHorseDto.sex == 'F') {
  //       throw new UnprocessableEntityException('Sire not valid!');
  //     }
  //     if (createHorseDto?.tag == 'D' && createHorseDto.sex == 'M') {
  //       throw new UnprocessableEntityException('Dam not valid!');
  //     }
  //   }
  //   await this.isHorseExist(createHorseDto);
  //   createHorseDto.createdBy = member['id'];
  //   createHorseDto.verifiedBy = member['id'];
  //   const createDto = {
  //     ...createHorseDto,
  //     isVerified: true,
  //     isActive: true,
  //   };

  //   const horseResponse = await this.horseRepository.save(
  //     this.horseRepository.create(createDto),
  //   );

  //   //Add New Horse To Pedigree
  //   await this.addHorseToPedigree(horseResponse.id);

  //   //Update horse request
  //   if (createHorseDto?.requestId) {
  //     await this.sendNotification(createHorseDto);
  //   }
  //   return horseResponse;
  // }

  //Create a Horse Record - Along with Sire/Dam
  async createHorseAlongWithSireOrDamData(
    createHorseDto: CreateAlongWithSireOrDamDto,
  ) {
    const member = this.request.user;
    let sireOrDamHorse = null;
    if (createHorseDto.sireData) {
      if (createHorseDto.sireData.horseId) {
        //If SireHorse Exist In DB
        sireOrDamHorse = await this.horseRepository.findOne({
          horseUuid: createHorseDto.sireData.horseId,
        });
        if (!sireOrDamHorse) {
          throw new UnprocessableEntityException('Horse not exist!');
        }
        if (sireOrDamHorse.sex == 'F') {
          throw new UnprocessableEntityException('Sire not valid!');
        }
      } else {
        //If SireHorse Not Exist in DB
        if (createHorseDto.sireData.sex == 'F') {
          throw new UnprocessableEntityException('Sire not valid!');
        }
        await this.isHorseExist(createHorseDto.sireData);
        createHorseDto.createdBy = member['id'];
        createHorseDto.verifiedBy = member['id'];
        const sireCreateDto = {
          ...createHorseDto.sireData,
          isVerified: true,
          isActive: true,
        };

        sireOrDamHorse = await this.horseRepository.save(
          this.horseRepository.create(sireCreateDto),
        );
      }
    } else if (createHorseDto.damData) {
      if (createHorseDto.damData.horseId) {
        //If DamHorse Exist In DB
        sireOrDamHorse = await this.horseRepository.findOne({
          horseUuid: createHorseDto.damData.horseId,
        });
        if (!sireOrDamHorse) {
          throw new UnprocessableEntityException('Horse not exist!');
        }
        if (sireOrDamHorse.sex == 'M') {
          throw new UnprocessableEntityException('Dam not valid!');
        }
      } else {
        //If DamHorse Not Exist in DB
        if (createHorseDto.damData.sex == 'M') {
          throw new UnprocessableEntityException('Dam not valid!');
        }
        await this.isHorseExist(createHorseDto.damData);
        createHorseDto.createdBy = member['id'];
        createHorseDto.verifiedBy = member['id'];
        const damCreateDto = {
          ...createHorseDto.damData,
          isVerified: true,
          isActive: true,
        };

        sireOrDamHorse = await this.horseRepository.save(
          this.horseRepository.create(damCreateDto),
        );
      }
    }
    await this.isHorseExist(createHorseDto);
    createHorseDto.createdBy = member['id'];
    createHorseDto.verifiedBy = member['id'];
    delete createHorseDto.sireData;
    delete createHorseDto.damData;
    const createDto = {
      ...createHorseDto,
      isVerified: true,
      isActive: true,
    };

    const horseResponse = await this.horseRepository.save(
      this.horseRepository.create(createDto),
    );

    // Set pedigreeId
    if (sireOrDamHorse) {
      await this.setPedigree(sireOrDamHorse, horseResponse.id, member['id']);
      //Add New Horse To Pedigree
      await this.addHorseToPedigree(horseResponse.id);
    }

    //Update horse request
    if (createHorseDto?.requestId) {
      createDto['horseId'] = horseResponse.id;
      await this.sendNotification(createHorseDto);
    }
    return horseResponse;
  }

  //Find Horses By Name And Gender
  async findHorsesByNameAndGender(
    searchOptions: HorseNameSearchDto,
  ): Promise<Horse[]> {
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

    const queryBuilder = this.horseRepository
      .createQueryBuilder('horse')
      .select(
        ' horse.horseUuid as horseId, horse.horseName, country.countryCode, horse.yob,horse.sex',
      )
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damId, dam.damName, dam.damYob, dam.damCountryCode')
      .innerJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      );

    if (searchOptions.horseName) {
      queryBuilder.andWhere('horse.horseName like :horseName', {
        horseName: `${searchOptions.horseName}%`,
      });
    }
    if (searchOptions.sex) {
      queryBuilder.andWhere('horse.sex = :sex', { sex: searchOptions.sex });
    }

    queryBuilder
      .andWhere('horse.gelding = :gelding', { gelding: false })
      .andWhere('horse.isActive = :isActive', { isActive: 1 })
      .andWhere('horse.isVerified = :isVerified', { isVerified: 1 });
    if (searchOptions.horseName) {
      let searchName = searchOptions.horseName.replace(/[^a-zA-Z ]/g, '');
      //const orderByCaseData = "CASE WHEN horse.horseName = '" + searchName + "' THEN 0 WHEN horse.horseName LIKE '" + searchName + "%' THEN 1 WHEN horse.horseName LIKE '%" + searchName + "%' THEN 2  WHEN horse.horseName LIKE '%" + searchName + "' THEN 3  ELSE 4 END"
      const orderByCaseData =
        "CASE WHEN horse.horseName = '" +
        searchName +
        "' THEN 0 WHEN horse.horseName LIKE '" +
        searchName +
        "%' THEN 1 ELSE 2 END";
      queryBuilder.addOrderBy(orderByCaseData, searchOptions.order);
      queryBuilder.addOrderBy('horse.yob', 'DESC');
      queryBuilder.addOrderBy('horse.horseName', 'ASC');
    } else {
      queryBuilder.addOrderBy('horse.horseName', 'ASC');
      queryBuilder.addOrderBy('horse.yob', 'DESC');
    }

    // queryBuilder.orderBy('horse.horseName')
    // " CASE WHEN ROW_NUMBER() OVER (PARTITION BY horse.horseName ORDER BY horse.yob DESC) > 1 THEN 1  ELSE 0 END"
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Get Sires By Name
  async findSiresByName(searchOptionsDto: SireNameSearchDto): Promise<Horse[]> {
    let sireQueryBuilder = await getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.yob, sireHorse.id as sirePedigreeId ,country.countryCode',
      )
      .addSelect('colour.colourName as sireColourName')
      .innerJoin('sireHorse.nationality', 'country')
      .innerJoin('sireHorse.colour', 'colour', 'colour.id=sireHorse.colourId')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = await getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damHorse.horseName as damName, damHorse.horseUuid as damId,damHorse.yob, damHorse.id as damPedigreeId,country.countryCode',
      )
      .addSelect('colour.colourName as damColourName')
      .innerJoin('damHorse.nationality', 'country')
      .innerJoin('damHorse.colour', 'colour', 'colour.id=damHorse.colourId')
      .andWhere('damHorse.horseName IS NOT NULL');

    const queryBuilder = this.horseRepository
      .createQueryBuilder('horse')
      .select(
        'DISTINCT(horse.id) as id ,horse.horseUuid as horseId, horse.horseName, horse.yob',
      )
      .addSelect('colour.colourName as colourName')
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect(
        'sire.sireId,sire.sirePedigreeId as sirePedigreeId,sire.sireName ,sire.countryCode as sirecountry,sire.yob as sireyob,sire.sireColourName',
      )
      .addSelect(
        'dam.damId,dam.damPedigreeId as damPedigreeId,dam.damName ,dam.countryCode as damcountry, dam.yob as damyob,dam.damColourName',
      )

      .innerJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sirePedigreeId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damPedigreeId=horse.damId',
      )
      .innerJoin('horse.colour', 'colour', 'colour.id=horse.colourId')
      .andWhere('horse.sex =:sex', { sex: 'M' });

    if (searchOptionsDto.sireName) {
      if (searchOptionsDto.isSireNameExactSearch) {
        queryBuilder.andWhere('horse.horseName =:horseName', {
          horseName: searchOptionsDto.sireName,
        });
      } else {
        queryBuilder.andWhere('horse.horseName like :horseName', {
          horseName: `${searchOptionsDto.sireName}%`,
        });
      }
    }
    if (searchOptionsDto.sireCob) {
      queryBuilder.andWhere('country.countryCode =:countryCode', {
        countryCode: searchOptionsDto.sireCob,
      });
    }
    if (searchOptionsDto.yob) {
      queryBuilder.andWhere('horse.yob =:yob', { yob: searchOptionsDto.yob });
    }
    queryBuilder.orderBy('horse.horseName', searchOptionsDto.order);
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Get Dams By Name
  async findDamsByName(searchOptionsDto: DamNameSearchDto): Promise<Horse[]> {
    let sireQueryBuilder = await getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.yob, sireHorse.id as sirePedigreeId ,country.countryCode',
      )
      .addSelect('colour.colourName as sireColourName')
      .innerJoin('sireHorse.nationality', 'country')
      .innerJoin('sireHorse.colour', 'colour', 'colour.id=sireHorse.colourId')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = await getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damHorse.horseName as damName, damHorse.horseUuid as damId,damHorse.yob, damHorse.id as damPedigreeId,country.countryCode',
      )
      .addSelect('colour.colourName as damColourName')
      .innerJoin('damHorse.nationality', 'country')
      .innerJoin('damHorse.colour', 'colour', 'colour.id=damHorse.colourId')
      .andWhere('damHorse.horseName IS NOT NULL');

    const queryBuilder = this.horseRepository
      .createQueryBuilder('horse')
      .select(
        'DISTINCT(horse.id) as id ,horse.horseUuid as horseId, horse.horseName, horse.yob',
      )
      .addSelect('colour.colourName as colourName')
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect(
        'sire.sireId,sire.sirePedigreeId as sirePedigreeId, sire.sireName ,sire.countryCode as sirecountry,sire.yob as sireyob,sire.sireColourName',
      )
      .addSelect(
        'dam.damId,dam.damPedigreeId as damPedigreeId, dam.damName ,dam.countryCode as damcountry, dam.yob as damyob,dam.damColourName',
      )
      .innerJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sirePedigreeId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damPedigreeId=horse.damId',
      )
      .innerJoin('horse.colour', 'colour', 'colour.id=horse.colourId')
      .andWhere('horse.sex =:sex', { sex: 'F' });

    if (searchOptionsDto.damName) {
      if (searchOptionsDto.isDamNameExactSearch) {
        queryBuilder.andWhere('horse.horseName =:horseName', {
          horseName: searchOptionsDto.damName,
        });
      } else {
        queryBuilder.andWhere('horse.horseName like :horseName', {
          horseName: `${searchOptionsDto.damName}%`,
        });
      }
    }
    if (searchOptionsDto.damCob) {
      queryBuilder.andWhere('country.countryCode =:countryCode', {
        countryCode: searchOptionsDto.damCob,
      });
    }
    if (searchOptionsDto.yob) {
      queryBuilder.andWhere('horse.yob =:yob', { yob: searchOptionsDto.yob });
    }
    queryBuilder.orderBy('horse.horseName', searchOptionsDto.order);
    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  //Get All Horses
  async findAll(searchOptionsDto: SearchOptionsDto): Promise<PageDto<Horse>> {
    let sireQueryBuilder = await getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.yob, sireHorse.id as sirePedigreeId ,country.countryCode',
      )
      .innerJoin('sireHorse.nationality', 'country')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = await getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damHorse.horseName as damName, damHorse.horseUuid as damId,damHorse.yob, damHorse.id as damPedigreeId,country.countryCode',
      )
      .innerJoin('damHorse.nationality', 'country')
      .andWhere('damHorse.horseName IS NOT NULL');

    let progenyCntQueryBuilder = await getRepository(HorseProgenyCountView)
      .createQueryBuilder('hpcv')
      .select('*');

    const queryBuilder = this.horseRepository
      .createQueryBuilder('horse')
      .select(
        'DISTINCT(horse.id) as id ,horse.horseUuid as horseId, horse.horseName, horse.yob, horse.dob, horse.currencyId, horse.totalPrizeMoneyEarned, horse.createdOn, horse.isVerified ,(CASE WHEN pcs.progenyCnt IS NOT NULL THEN pcs.progenyCnt ELSE 0 END + CASE WHEN pcd.progenyCnt IS NOT NULL THEN pcd.progenyCnt ELSE 0 END) as progeny ,horse.isActive,horse.sex as gender ',
      )
      .addSelect(
        "(CASE WHEN (horse.sex='M') THEN 'Male' WHEN (horse.sex = 'F') THEN 'Female' ELSE '' END) as sex",
      )
      .addSelect(
        '(CASE WHEN (runner.horseId IS NOT NULL) THEN CAST(1 as bit) ELSE CAST(0 as bit) END) as runner',
      )
      .addSelect(
        '(CASE WHEN (race.raceStakeId IS NOT NULL) THEN CAST(1 as bit)  ELSE  CAST(0 as bit) END) as stakes',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect(
        'sire.sireId, sire.sireName ,sire.countryCode as sirecountry,sire.yob as sireyob',
      )
      .addSelect(
        'dam.damId, dam.damName ,dam.countryCode as damcountry, dam.yob as damyob',
      )
      .addSelect('member.fullName as userName')
      .addSelect('horseType.horseTypeName as breeding')
      .innerJoin('horse.nationality', 'country')
      .leftJoin('country.states', 'states')
      .leftJoin('horse.member', 'member')
      .leftJoin('horse.runners', 'runner')
      .leftJoin('runner.races', 'race')
      .leftJoin('horse.horseType', 'horseType')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sirePedigreeId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damPedigreeId=horse.damId',
      )
      .leftJoin(
        '(' + progenyCntQueryBuilder.getQuery() + ')',
        'pcs',
        'pcs.sireId=horse.id',
      )
      .leftJoin(
        '(' + progenyCntQueryBuilder.getQuery() + ')',
        'pcd',
        'pcd.damId=horse.id',
      )
      .andWhere('horse.isArchived = :isArchived', { isArchived: 0 });
    if (searchOptionsDto.sex) {
      /* queryBuilder
      .andWhere("horse.sex = :sex", { sex: searchOptionsDto.sex } ) */
    }
    if (searchOptionsDto.stateId) {
      queryBuilder.andWhere('horse.stateId = :stateId', {
        stateId: searchOptionsDto.stateId,
      });
    }
    if (searchOptionsDto.horseType) {
      queryBuilder.andWhere('horse.horseTypeId = :horseTypeId', {
        horseTypeId: searchOptionsDto.horseType,
      });
    }
    if (searchOptionsDto.eligibility) {
      if (searchOptionsDto.eligibility === 'Eligible') {
        queryBuilder.andWhere('horse.isEligible = :isEligible', {
          isEligible: 1,
        });
      } else if (searchOptionsDto.eligibility === 'Ineligible') {
        queryBuilder.andWhere('horse.isEligible = :isEligible', {
          isEligible: 0,
        });
      }
    }
    if (searchOptionsDto.gelding) {
      queryBuilder.andWhere('horse.gelding = :gelding', {
        gelding: searchOptionsDto.gelding,
      });
    }
    if (searchOptionsDto.horseName) {
      if (searchOptionsDto.isHorseNameExactSearch) {
        queryBuilder.andWhere('horse.horseName =:horseName', {
          horseName: searchOptionsDto.horseName,
        });
      } else {
        queryBuilder.andWhere('horse.horseName like :horseName', {
          horseName: '%' + searchOptionsDto.horseName + '%',
        });
      }
    }
    if (searchOptionsDto.countryId) {
      queryBuilder.andWhere('horse.countryId = :countryId', {
        countryId: searchOptionsDto.countryId,
      });
    }
    if (searchOptionsDto.sireId) {
      queryBuilder.andWhere('sire.sireId = :sireId', {
        sireId: searchOptionsDto.sireId,
      });
    }
    if (searchOptionsDto.damId) {
      queryBuilder.andWhere('dam.damId = :damId', {
        damId: searchOptionsDto.damId,
      });
    }
    if (searchOptionsDto.missingYob) {
      queryBuilder.andWhere('horse.yob = 0 OR horse.yob IS NULL');
    }
    if (searchOptionsDto.missingCob) {
      queryBuilder.andWhere('horse.countryId IS NULL OR horse.countryId = 0');
    }
    if (searchOptionsDto.unVerified) {
      queryBuilder.andWhere(
        'horse.isVerified  = 0 OR horse.isVerified IS NULL',
      );
    }
    if (searchOptionsDto.createdBy) {
      queryBuilder.andWhere('horse.createdBy = :createdBy', {
        createdBy: searchOptionsDto.createdBy,
      });
    }
    if (searchOptionsDto.damStatus) {
      if (searchOptionsDto.damStatus === 'Present') {
        queryBuilder.andWhere(
          new Brackets((subQ) => {
            subQ
              .where('dam.damId IS NOT NULL')
              .andWhere('horse.damId !=0');
          }),
        );
      //  queryBuilder.andWhere('dam.damId IS NOT NULL OR horse.damId !=0');
      } else if (searchOptionsDto.damStatus === 'Empty') {
        queryBuilder.andWhere('dam.damId IS NULL');
      } else if (searchOptionsDto.damStatus === 'No Record') {
        queryBuilder.andWhere('horse.damId = 0');
      }
    }
    if (searchOptionsDto.sireStatus) {
      if (searchOptionsDto.sireStatus === 'Present') {
        queryBuilder.andWhere(
          new Brackets((subQ) => {
            subQ
              .where('sire.sireid IS NOT NULL')
              .andWhere('horse.sireid !=0');
          }),
        );
      //  queryBuilder.andWhere('sire.sireid IS NOT NULL');
      } else if (searchOptionsDto.sireStatus === 'Empty') {
        queryBuilder.andWhere('sire.sireid IS NULL');
      } else if (searchOptionsDto.sireStatus === 'No Record') {
        queryBuilder.andWhere('horse.sireid = 0');
      }
    }
    if (searchOptionsDto.sireName) {
      if (searchOptionsDto.isSireNameExactSearch) {
        queryBuilder.andWhere('sire.sireName =:sireName', {
          sireName: searchOptionsDto.sireName,
        });
      } else {
        queryBuilder.andWhere('sire.sireName like :sireName', {
          sireName: '%' + searchOptionsDto.sireName + '%',
        });
      }
    }
    if (searchOptionsDto.damName) {
      if (searchOptionsDto.isDamNameExactSearch) {
        queryBuilder.andWhere('dam.damName =:damName', {
          damName: searchOptionsDto.damName,
        });
      } else {
        queryBuilder.andWhere('dam.damName like :damName', {
          damName: '%' + searchOptionsDto.damName + '%',
        });
      }
    }
    if (searchOptionsDto.runnerStatus) {
      if (searchOptionsDto.runnerStatus === 'Runner') {
        queryBuilder.andWhere('runner.horseId IS NOT NULL');
      } else if (searchOptionsDto.runnerStatus === 'Other') {
        queryBuilder.andWhere('runner.horseId IS NULL');
      }
    }
    if (searchOptionsDto.stakesStatus) {
      if (searchOptionsDto.stakesStatus === 'Stakes Winner') {
        queryBuilder.andWhere('race.raceStakeId IS NOT NULL');
      } else if (searchOptionsDto.stakesStatus === 'Other') {
        queryBuilder.andWhere('race.raceStakeId IS NULL');
      }
    }
    if (searchOptionsDto.yob) {
      const yobRange = searchOptionsDto.yob;
      let yobList = yobRange.split('-');
      if (yobList.length === 2) {
        var minYob = yobList[0];
        var maxYob = yobList[1];
      }
      queryBuilder.andWhere('horse.yob >= :minYob AND horse.yob <= :maxYob', {
        minYob,
        maxYob,
      });
    }
    if (searchOptionsDto.createdDate) {
      const createdDateRange = searchOptionsDto.createdDate;
      let dateList = createdDateRange.split('/');
      if (dateList.length === 2) {
        var minDate = dateList[0];
        var maxDate = dateList[1];
      }
      queryBuilder.andWhere(
        'horse.createdOn  >= CONVERT(date, :minDate) AND horse.createdOn <= CONVERT(date, :maxDate)',
        {
          minDate,
          maxDate,
        },
      );
    }

    if (searchOptionsDto.accuracyProfile) {
      //From vwHorseAccuracyProfile
      queryBuilder.innerJoin('horse.accuracyprofile', 'accuracyprofile');
      queryBuilder.andWhere(
        'accuracyprofile.accuracyRating = :accuracyRating',
        { accuracyRating: searchOptionsDto.accuracyProfile },
      );
    }

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      const byOrder = searchOptionsDto.order;
      if (sortBy.toLowerCase() === 'horsename') {
        queryBuilder.orderBy('horse.horseName', byOrder);
      }
      if (sortBy.toLowerCase() === 'sex') {
        queryBuilder.orderBy('horse.sex', byOrder);
      }
      if (sortBy.toLowerCase() === 'yob') {
        queryBuilder.orderBy('horse.yob', byOrder);
      }
      if (sortBy.toLowerCase() === 'countryname') {
        queryBuilder.orderBy('country.countryName', byOrder);
      }
      if (sortBy.toLowerCase() === 'breeding') {
        queryBuilder.orderBy('sire.sireName', byOrder);
        queryBuilder.addOrderBy('dam.damName', byOrder);
      }
      if (sortBy.toLowerCase() === 'isverified') {
        queryBuilder.orderBy('horse.isVerified', byOrder);
      }
      if (sortBy.toLowerCase() === 'createdon') {
        queryBuilder.orderBy('horse.createdOn ', byOrder);
      }
      if (sortBy.toLowerCase() === 'progeny') {
        queryBuilder.orderBy('progeny ', byOrder);
      }
      if (sortBy.toLowerCase() === 'runner') {
        queryBuilder.orderBy('runner', byOrder);
      }
      if (sortBy.toLowerCase() === 'stakes') {
        queryBuilder.orderBy('stakes', byOrder);
      }
    } else queryBuilder.orderBy('horse.horseName', 'ASC');

    queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    let entities = await queryBuilder.getRawMany();

    for (let horse of entities) {
      horse['horseAlias'] = await this.getHorseAliasNames(horse.horseId);
    }

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  //Get All Horse Alias Names
  async getHorseAliasNames(horseId: string) {
    const queryBuilder: any = getRepository(HorseNameAlias)
      .createQueryBuilder('horseAlias')
      .select(
        'horseAlias.horseName as horseName, horseAlias.isActive, horseAlias.isDefault',
      )
      .leftJoin('horseAlias.horse', 'horse')
      .andWhere('horse.horseUuid = :horseId', { horseId });

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Get Horse Pedigree By Id And ViewType
  async getHorsePedigreeByIdAndViewType(id: string, viewType: string) {
    try {
      const record = await this.horseRepository.findOneOrFail({
        horseUuid: id,
        isArchived: Not(true),
      });
      let results = await this.horseRepository.query(
        `exec proc_SMPSearchPedigreeNew ` + record.id,
      );
      let resultsAfterLegendColor = await this.setHorseLegendColor(results);
      if (viewType === 'tree') {
        return this.treePedigreeByHorseId(record, resultsAfterLegendColor);
      } else {
        return resultsAfterLegendColor;
      }
    } catch (err) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
  }

  //Get Pedigree By horseId
  async treePedigreeByHorseId(record, results) {
    try {
      const options = {
        id: 'id',
        parentId: 'progenyId',
        children: 'children',
      };
      const horsePedigree =
        await this.commonUtilsService.getTreeHierarchyFromFlatData(results);
      let pedigreeTreeLevel = 0;
      if (Array.isArray(results)) {
        const resultCount = results.length;
        pedigreeTreeLevel = results[resultCount - 1].generation;
      }

      const horseRecord2 = await this.findOne(record.horseUuid);

      delete horseRecord2.sireId;
      delete horseRecord2.damId;
      delete horseRecord2.isActive;
      let resultData = {
        ...horseRecord2,
        pedigreeTreeLevel: pedigreeTreeLevel,
        horsePedigrees: horsePedigree[0],
      };
      return resultData;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // async treePedigreeByHorseId(record, results) {
  //   try {
  //     const options = {
  //       id: 'id',
  //       parentId: 'pedigreeid',
  //       children: 'children',
  //     }
  //     const horsePedigree = createTreeHierarchy(results, options);
  //     let horseRecord = {
  //       horseId: record.horseUuid,
  //       horseName: record.horseName,
  //       yob: record.yob,
  //       countryId: record.countryId,
  //       colourId: record.colourId,
  //       sex: record.sex,
  //       gelding: record.gelding,
  //       isLocked: record.isLocked,
  //       horseTypeId: record.horseTypeId,
  //     }
  //     let resultData = {
  //       ...horseRecord,
  //       'horsePedigrees': horsePedigree[0]
  //     }
  //     return resultData;
  //   } catch (err) {
  //     throw new UnprocessableEntityException(err);
  //   }
  // }

  //Get a Horse By id
  async findOne(id: string) {
    await this.horseRepository.findOneOrFail({
      horseUuid: id,
    });
    let run = await getRepository(Runner)
      .createQueryBuilder('runer')
      .select('COUNT(runer.horseId) as run, runer.horseId as wHorseId')
      .innerJoin('runer.races', 'races')
      .innerJoin('runer.horses', 'horse')
      .groupBy('runer.horseId');

    let totalWin = await getRepository(Runner)
      .createQueryBuilder('runer')
      .select('COUNT(runer.horseId) as totalWin, runer.horseId as wHorseId')
      .innerJoin('runer.races', 'races')
      .innerJoin('runer.horses', 'horse')
      .groupBy('runer.horseId');

    let group_1_wins = await getRepository(Runner)
      .createQueryBuilder('runer')
      .select('COUNT(runer.horseId) as group_1_wins, runer.horseId as wHorseId')
      .innerJoin('runer.positions', 'positions', 'positions.id = 1')
      .innerJoin('runer.races', 'races', 'races.raceStakeId = 1')
      .innerJoin('runer.horses', 'horse')
      .groupBy('runer.horseId');

    let group_2_wins = await getRepository(Runner)
      .createQueryBuilder('runer')
      .select('COUNT(runer.horseId) as group_2_wins, runer.horseId as wHorseId')
      .innerJoin('runer.positions', 'positions', 'positions.position = 1')
      .innerJoin('runer.races', 'races', 'races.raceStakeId = 2')
      .innerJoin('runer.horses', 'horse')
      .groupBy('runer.horseId');

    let group_3_wins = await getRepository(Runner)
      .createQueryBuilder('runer')
      .select('COUNT(runer.horseId) as group_3_wins, runer.horseId as wHorseId')
      .innerJoin('runer.positions', 'positions', 'positions.id = 1')
      .innerJoin('runer.races', 'races', 'races.raceStakeId = 3')
      .innerJoin('runer.horses', 'horse')
      .groupBy('runer.horseId');

    let listedWins = await getRepository(Runner)
      .createQueryBuilder('runer')
      .select('COUNT(runer.horseId) as listedWins, runer.horseId as wHorseId')
      .innerJoin('runer.positions', 'positions', 'positions.id = 1')
      .innerJoin('runer.races', 'races', 'races.raceStakeId = 4')
      .innerJoin('runer.horses', 'horse')
      .groupBy('runer.horseId');

    let hpiQueryBuilder = getRepository(HorseProfileImage)
      .createQueryBuilder('hpi')
      .select('hpi.horseId as mediaHorseId, media.mediaUrl as profileMediaUrl')
      .innerJoin(
        'hpi.media',
        'media',
        'media.id=hpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = await this.horseRepository
      .createQueryBuilder('horse')
      .select(
        'horse.id as id ,horse.horseUuid as horseUuid, horse.horseName,horse.sireId,horse.damId,horse.countryId,horse.colourId,horse.horseTypeId,horse.gelding,horse.yob, horse.dob, horse.currencyId, horse.totalPrizeMoneyEarned, horse.isLocked,horse.createdOn, horse.isVerified ,horse.verifiedBy,horse.verifiedOn,horse.modifiedBy,horse.modifiedOn,horse.isActive,horse.sex as sex,member.fullName as createdBy ',
      )
      .addSelect(
        'run.run,totalWin.totalWin,group_1_wins.group_1_wins,group_2_wins.group_2_wins,group_3_wins.group_3_wins,listedWins.listedWins',
      )
      .addSelect(
        'horseType.isEligible as eligibility',
      )
      .addSelect(
        '(CASE WHEN (favouriteStallion.id IS NOT NULL) THEN CAST(1 as bit)  ELSE  CAST(0 as bit) END) as favouriteStallion',
      )
      .addSelect(
        '(CASE WHEN (favBroodmareSire.id IS NOT NULL) THEN CAST(1 as bit)  ELSE  CAST(0 as bit) END) as favBroodmareSire',
      )
      .addSelect(
        '(CASE WHEN (favouriteMare.id IS NOT NULL) THEN CAST(1 as bit)  ELSE  CAST(0 as bit) END) as myMares',
      )
      .addSelect('profileMediaUrl as profilePic')
      .leftJoin('horse.horseType', 'horseType')
      .leftJoin('horse.stallion', 'stallion')
      .leftJoin('stallion.favouriteStallion', 'favouriteStallion')
      .leftJoin('horse.favBroodmareSire', 'favBroodmareSire')
      .leftJoin('horse.favouriteMare', 'favouriteMare')
      .leftJoin('horse.member', 'member')
      .leftJoin(
        '(' + hpiQueryBuilder.getQuery() + ')',
        'horseprofileimage',
        'mediaHorseId=horse.id',
      )
      .leftJoin('(' + run.getQuery() + ')', 'run', 'run.wHorseId = horse.id')
      .leftJoin(
        '(' + totalWin.getQuery() + ')',
        'totalWin',
        'totalWin.wHorseId =horse.id',
      )
      .leftJoin(
        '(' + group_1_wins.getQuery() + ')',
        'group_1_wins',
        'group_1_wins.wHorseId =horse.id',
      )
      .leftJoin(
        '(' + group_2_wins.getQuery() + ')',
        'group_2_wins',
        'group_2_wins.wHorseId =horse.id',
      )
      .leftJoin(
        '(' + group_3_wins.getQuery() + ')',
        'group_3_wins',
        'group_3_wins.wHorseId =horse.id',
      )
      .leftJoin(
        '(' + listedWins.getQuery() + ')',
        'listedWins',
        'listedWins.wHorseId =horse.id',
      )
      .andWhere('horse.horseUuid = :horseUuid', { horseUuid: id })
      .getRawOne();

    return queryBuilder;
  }

  //Update a Horse
  async update(horseUuid: string, updateHorseDto: UpdateHorseDto) {
    try {
      const member = this.request.user;
      const record = await this.horseRepository.findOneOrFail({
        horseUuid: horseUuid,
      });
      if (updateHorseDto?.tag) {
        if (updateHorseDto?.tag == 'S' && updateHorseDto.sex == 'F') {
          throw new UnprocessableEntityException('Sire not valid!');
        }
        if (updateHorseDto?.tag == 'D' && updateHorseDto.sex == 'M') {
          throw new UnprocessableEntityException('Dam not valid!');
        }
      }
      const { progenyId } = updateHorseDto;
      let pedigree: Horse;
      if (pedigree) {
        pedigree = await this.horseRepository.findOne({ horseUuid: progenyId });
        if (!pedigree) {
          throw new UnprocessableEntityException('Pedigree not exist!');
        }
      }
      await this.isHorseExist(updateHorseDto, horseUuid);
      // Set pedigreeId
      await this.setPedigree(record, pedigree?.id, null, member['id']);
      delete updateHorseDto.progenyId;
      updateHorseDto.modifiedBy = member['id'];
      const HorseDto = {
        ...updateHorseDto,
        isActive: true,
        isVerified: true,
      };

      await this.horseRepository.update({ horseUuid }, HorseDto);
      const horseResponse = await this.horseRepository.findOne({ horseUuid });
      return horseResponse;
    } catch (err) {
      console.log(err);
      throw new UnprocessableEntityException(err);
    }
  }

  //Update a Horse - Without Progeny
  // async updateWitoutProgeny(
  //   horseUuid: string,
  //   updateHorseDto: UpdateHorseNoProgenyidDto,
  // ) {
  //   try {
  //     const member = this.request.user;
  //     const record = await this.horseRepository.findOneOrFail({
  //       horseUuid: horseUuid,
  //     });
  //     if (updateHorseDto?.tag) {
  //       if (updateHorseDto?.tag == 'S' && updateHorseDto.sex == 'F') {
  //         throw new UnprocessableEntityException('Sire not valid!');
  //       }
  //       if (updateHorseDto?.tag == 'D' && updateHorseDto.sex == 'M') {
  //         throw new UnprocessableEntityException('Dam not valid!');
  //       }
  //     }
  //     await this.isHorseExist(updateHorseDto, horseUuid);
  //     updateHorseDto.modifiedBy = member['id'];
  //     const HorseDto = {
  //       ...updateHorseDto,
  //       isActive: true,
  //       isVerified: true,
  //     };

  //     await this.horseRepository.update({ horseUuid }, HorseDto);
  //     const horseResponse = await this.horseRepository.findOne({ horseUuid });
  //     return horseResponse;
  //   } catch (err) {
  //     console.log(err);
  //     throw new UnprocessableEntityException(err);
  //   }
  // }

  //Delete a Horse
  async deleteOne(id: string) {
    //isDeleted
    const record = await this.getHorseByUuid(id);
    if (record.isArchived) {
      throw new UnprocessableEntityException(`Horse not exist!.`);
    }
    let progenies = await this.getHorseDirectProgenies(record.id);
    if (progenies.length) {
      throw new UnprocessableEntityException(
        `${record.horseName} (${record.id}) was unable to be archived due to being present within another horses pedigree or within an non-archived stallion.`,
      );
    }
    const horseStallions = await this.stallionRepository.find({
      horseId: record.id,
      isRemoved: Not(true),
    });
    //Validate horse not assosiated with any stallion
    if (horseStallions.length) {
      throw new UnprocessableEntityException(
        `${record.horseName} (${record.id}) was unable to be archived due to being present within another horses pedigree or within an non-archived stallion.`,
      );
    }
    const user = this.request.user;
    const updateResult: UpdateResult = await this.horseRepository.update(
      { horseUuid: id },
      {
        isActive: false,
        isVerified: false,
        isArchived: true,
        modifiedBy: user['id'],
      },
    );
    if (updateResult.affected > 0) {
      await this.eventEmitter.emitAsync('deleteHorseActivity', {
        originalData: this.request,
        record: record,
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Horse is deleted successfully',
      };
    }
  }

  //Check is Horse Exist
  async isHorseExist(horseDto, horseUuid = null) {
    const record = await this.horseRepository.findOne({
      horseName: horseDto.horseName,
      sex: horseDto.sex,
      yob: horseDto.yob,
      countryId: horseDto.countryId,
      isActive: true,
    });
    if (record) {
      if (horseUuid && record.horseUuid == horseUuid) {
        return;
      }
      throw new UnprocessableEntityException('Horse already exists');
    }
  }

  //Set Pedigree
  async setPedigree(
    horseData: Horse,
    pedigreeId = null,
    createdBy = null,
    modifiedBy = null,
  ) {
    this.createPedigree(horseData, pedigreeId, createdBy, modifiedBy);
  }

  //Create Pedigree
  async createPedigree(
    horseData: Horse,
    pedigreeId = null,
    createdBy = null,
    modifiedBy = null,
  ) {
    const member = this.request.user;
    if (pedigreeId) {
      let progenyHorse = await this.horseRepository.findOne({ id: pedigreeId });
      if (horseData.sex == 'M') {
        progenyHorse.sireId = horseData.id;
      }
      if (horseData.sex == 'F') {
        progenyHorse.damId = horseData.id;
      }
      if (createdBy) {
        progenyHorse.createdBy = createdBy;
      }
      if (modifiedBy) {
        progenyHorse.modifiedBy = modifiedBy;
      }
      await progenyHorse.save();
      if (horseData.sex == 'M' || horseData.sex == 'F') {
        let sex = horseData.sex == 'M' ? 'S' : 'D';
        await this.pedigreeProgenyUpdate(progenyHorse.id, horseData.id, sex);
      }
    }
    return horseData;
  }

  //Get Eligibilities
  async getEligibilities() {
    return getResponseObjectFromEnum(Eligibility);
  }

  //Get Stakes Statuses
  async getStakesStatus() {
    return getResponseObjectFromEnum(StakesStatus);
  }

  //Get Runner Statuses
  async getRunnerStatus() {
    return getResponseObjectFromEnum(RunnerStatus);
  }

  //Get Sire Statuses
  async getSireStatus() {
    return getResponseObjectFromEnum(SireStatus);
  }

  //Get Dam Statuses
  async getDamStatus() {
    return getResponseObjectFromEnum(DamStatus);
  }

  //Get Horse AccuracyProfile
  async getAccuracyProfile() {
    return getResponseObjectFromEnum(AccuracyProfile);
  }

  //Update Horse Pedigree
  async updatePedigree(horseId: string, data: UpdatePedigreeDto) {
    const member = this.request.user;
    let oldPedigreeRecord = await this.getHorseByUuid(horseId);
    const { progenyId, newPedigreeId } = data;
    let newPedigreeRecord = await this.getHorseByUuid(newPedigreeId);
    let record = await this.getHorseByUuid(progenyId);
    let horseSexPosition: string
    if (data.pedigreePosition) {
      horseSexPosition = data.pedigreePosition.charAt(data.pedigreePosition.length - 1);
    }
    if (horseSexPosition == 'S') {
      record.sireId = newPedigreeRecord.id;
    }
    if (horseSexPosition == 'D') {
      record.damId = newPedigreeRecord.id;
    }
    record.modifiedBy = member['id'];
    record.modifiedOn = new Date();
    record.save();
    //Pedigree Update Logic
    if (newPedigreeRecord.sex == 'M' || newPedigreeRecord.sex == 'F') {
      let sex = horseSexPosition;
      await this.pedigreeProgenyUpdate(record.id, newPedigreeRecord.id, sex);
    }
    return true;
  }

  //Get Horse by horseUuid
  async getHorseByUuid(horseUuid: string) {
    const record = await this.horseRepository.findOne({ horseUuid });
    if (!record) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
    return record;
  }

  //Get Horses Alias
  async findHorsesAlias(id: string) {
    const searchTerm = await this.horseRepository.findOne(id);
    let queryBuilder = await getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id ,horse.horseName as horseName')
      .where('countryId  != :countryId', {
        countryId: `${searchTerm.countryId}`,
      })
      .andWhere('horseName LIKE :horseName', {
        horseName: `${searchTerm.horseName}`,
      });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Set Default Name for a Horse
  async setDefaultName(horseId, horseName) {
    const user = this.request.user;
    await this.horseRepository.update(
      { id: horseId },
      { horseName: horseName, modifiedBy: user['id'] },
    );
    return 'Default name is updated successfully';
  }

  //Set Default Country of birth for a Horse
  async setDefaultCob(horseId, countryId) {
    const user = this.request.user;
    await this.horseRepository.update(
      { id: horseId },
      { countryId: countryId, modifiedBy: user['id'] },
    );
    return 'Default country is updated successfully';
  }

  //Get Many Horses By Uuids
  async getManyHorsesByUuids(horsesList) {
    const horseUuids = this.getHorseIds(horsesList);
    if (!horseUuids.length) {
      return null;
    }
    return this.horseRepository.find({ where: { horseUuid: In(horseUuids) } });
  }

  getHorseIds(list) {
    let horseIds = [];
    list.forEach((horse) => {
      horseIds.push(horse.horseId);
    });
    return horseIds;
  }

  //Get Horse Dashboard Data
  async getHorseDashboardData(options: DashboardDto) {
    let result = await this.horseRepository.manager.query(
      `EXEC procGetHorseDashboard_new @paramDate1=@0, @paramDate2=@1`,
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

  //Get Dashborad Report Data
  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case HORSEDASHBOARDKPI.TOTAL_HORSES:
        qbQuery = `EXEC procGetHorseDashboardTotalHorsesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.NEW_HORSES:
        qbQuery = `EXEC procGetHorseDashboardNewHorsesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.MISSING_SIRE_OR_DAM:
        qbQuery = `EXEC procGetHorseDashboardMissingSireDamDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.MISSING_YOB_COB_COLOUR:
        qbQuery = `EXEC procGetHorseDashboardMissingYOBCoBColorDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.THOROUGHBREDS:
        qbQuery = `EXEC procGetHorseDashboardThoroughbredsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.NONTHOROUGHBREDS:
        qbQuery = `EXEC procGetHorseDashboardNonThoroughbredsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.INELIGIBLE:
        qbQuery = `EXEC procGetHorseDashboardIneligibleDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.VERIFIED:
        qbQuery = `EXEC procGetHorseDashboardVerifiedDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.RUNNERS:
        qbQuery = `EXEC procGetHorseDashboardRunnersDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.STAKES_WINNERS:
        qbQuery = `EXEC procGetHorseDashboardStakesWinnersDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.WINNERS:
        qbQuery = `EXEC procGetHorseDashboardWinnersDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.COUNTRIES_RUNNERS:
        qbQuery = `EXEC procGetHorseDashboardCountriesRunnersDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.RACES:
        qbQuery = `EXEC procGetHorseDashboardRacesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.STAKES_RACES:
        qbQuery = `EXEC procGetHorseDashboardStakesRacesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.TOTAL_COUNTRIES:
        qbQuery = `EXEC procGetHorseDashboardTotalCountriesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.ELIGIBLECOUNTRIES:
        qbQuery = `EXEC procGetHorseDashboardEligibleCountriesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.API_ADDED:
        qbQuery = `EXEC procGetHorseDashboardAPIAddedDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.USER_REQUESTED:
        qbQuery = `EXEC procGetHorseDashboardUserRequestedDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.THIRD_PARTY_ADDED:
        qbQuery = `EXEC procGetHorseDashboardThirdPartyAddedDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case HORSEDASHBOARDKPI.INTERNALLY_ADDED:
        qbQuery = `EXEC procGetHorseDashboardInternallyAddedDownload @paramDate1=@0, @paramDate2=@1`;
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
      const currentDateTime = new Date();
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

  //Get Horse by horseUuid
  async findHorsesByUuid(horseUuid: string) {
    try {
      const record = await this.horseRepository.findOneOrFail({
        horseUuid,
      });
      if (!record) {
        throw new UnprocessableEntityException('Horse not exist!');
      } else {
        return record;
      }
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  //Get Mare Hypomating Details
  async getMareHypoMatingDetails(mareId: string, generation: number) {
    const mareRecord = await this.findHorsesByUuid(mareId);
    const finalData = await this.horseRepository.manager.query(
      `EXEC proc_SMPPerfectMatch @SireID=@0, @DamID=@1, @level=@2`,
      [mareRecord.sireId, mareRecord.damId, generation],
    );
    let horseTag = await this.horseRepository.manager.query(
      `EXEC proc_HorseInfoInPedigree @phorseId=@0`,
      [mareRecord.id],
    );

    let horseInfoTag = null;
    let horseInfoInFullTag = null;
    if (horseTag.length) {
      horseInfoTag = horseTag[0].FirstTag;
      horseInfoInFullTag = horseTag[0].FirstTaginFull;
    }
    await finalData.map(function getItem(item) {
      item.category = '';
      if (item.generation === 1 && item.childId == null) {
        item.childId = mareRecord.id;
        item.progenyId = mareRecord.horseUuid;
      }
      if (item.generation <= 2) {
        item.category = item.FirstInfo;
      }
      return item;
    });
    let result = [];
    result[0] = [];
    result[0].push({
      horseName: await this.commonUtilsService.toTitleCase(
        mareRecord.horseName,
      ),
      generation: 0,
      hp: 'C',
      tag: 'D',
      colour: null,
      category: horseInfoTag,
      image: `${this.configService.get(
        'file.pathReportTemplateStyles',
      )}/images/horse-image.png`,
    });
    await finalData.reduce(async (promise, record: any) => {
      await promise;
      if (!result[record.generation]) {
        result[record.generation] = [];
      }
      if (record.generation) {
        result[record.generation].push({
          horseName: await this.commonUtilsService.toTitleCase(
            record.horseName,
          ),
          generation: record.generation,
          hp: record.hp,
          tag: record.tag,
          colour: record.ColorCoding,
          category: record.category,
          image: null,
        });
      }
    }, Promise.resolve());
    const perGroup = Math.ceil(result[5].length / 8);
    result[5] = new Array(8)
      .fill('')
      .map((_, i) => result[5].slice(i * perGroup, (i + 1) * perGroup));
    return result;
  }

  //Get a HorseDetails By HorseId And Sex
  async findHorseDetailsByHorseIdAndSex(horseId: string, sex = null) {
    try {
      let sireQueryBuilder = getRepository(Horse)
        .createQueryBuilder('sireHorse')
        .select(
          'sireHorse.horseName as sireName, sireHorse.id as sirePedigreeId',
        );

      let damQueryBuilder = getRepository(Horse)
        .createQueryBuilder('damHorse')
        .select('damHorse.horseName as damName, damHorse.id as damPedigreeId');

      const queryBuilder = this.horseRepository
        .createQueryBuilder('horse')
        .select(
          'horse.id, horse.horseUuid as horseId, horse.horseName, horse.yob, sire.sireName, dam.damName',
        )
        .addSelect('sire.sirePedigreeId as sireId, dam.damPedigreeId as damId')
        .addSelect('country.countryCode as countryCode')
        .leftJoin(
          '(' + sireQueryBuilder.getQuery() + ')',
          'sire',
          'sirePedigreeId=horse.sireId',
        )
        .leftJoin(
          '(' + damQueryBuilder.getQuery() + ')',
          'dam',
          'damPedigreeId=horse.damId',
        )
        .leftJoin('horse.nationality', 'country');
      queryBuilder.andWhere('horse.horseUuid =:horseId', { horseId: horseId });
      if (sex) {
        queryBuilder.andWhere('horse.sex =:sex', { sex: sex });
      }

      let record = await queryBuilder.getRawOne();
      if (!record) {
        throw new UnprocessableEntityException('Horse not exist!');
      } else {
        return record;
      }
    } catch (err) {
      throw err;
    }
  }

  //Get Flat Pedigree Data
  async getFlatPedigreeData(finalData) {
    let pedigreeTreeLevel = 0;
    if (finalData[0].generation === 1) {
      await finalData.map(function getItem(item) {
        item.generation = item.generation - 1;
        return item;
      });
    }
    if (Array.isArray(finalData)) {
      const resultCount = finalData.length;
      pedigreeTreeLevel = finalData[resultCount - 1].generation;
    }
    let result = [];
    finalData.map((record: any) => {
      if (!result[record.generation]) {
        result[record.generation] = [];
      }
      result[record.generation].push(record);
    });
    return {
      pedigree: result,
      pedigreeTreeLevel,
    };
  }

  /*async treePedigreeByHorseId(record, results) {
    try {
      let pedigreeTreeLevel = 0
      if (Array.isArray(results)) {
        const resultCount = results.length
        pedigreeTreeLevel = results[resultCount - 1].generation
      }
      let pedigreeResult = await this.getFlatPedigreeData(results)
      let horseRecord = {
        pedigreeTreeLevel: pedigreeTreeLevel,
        horseId: record.horseUuid,
        horseName: record.horseName,
        yob: record.yob,
        dob: record.dob,
        countryId: record.countryId,
        colourId: record.colourId,
        sex: record.sex,
        gelding: record.gelding,
        isLocked: record.isLocked,
        isVerified: record.isVerified,
        horseTypeId: record.horseTypeId,
        currencyId:record.currencyId,
        totalPrizeMoneyEarned:record.totalPrizeMoneyEarned,
        runs:2,
        group_1_wins:0,
        group_2_wins:4,
        group_3_wins:3,
        listedWins:3,
        totalWins:1,
        eligibility:"yes",
        myMares:"yes",
        favouriteStallions:"yes",
        favouriteBroodmareSire:"yes"
      }
      let resultData = {
        ...horseRecord,
        'pedigree': pedigreeResult.pedigree
      }
      return resultData;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  } */

  //Get Horse HypoMating Details
  async getHypoMatingDetails(sireId, damId, generation: number) {
    const finalData = await this.horseRepository.manager.query(
      `EXEC proc_SMPPerfectMatch @SireID=@0, @DamID=@1, @level=@2`,
      [sireId, damId, generation],
    );
    await finalData.map(function getItem(item) {
      item.category = '';
      if (item.generation <= 2) {
        item.category = item.FirstInfo;
      }
      return item;
    });
    let result = [];
    await finalData.reduce(async (promise, record: any) => {
      await promise;
      if (!result[record.generation - 1]) {
        result[record.generation - 1] = [];
      }
      if (record.generation) {
        let matchResult = null;
        if (
          record.MatchResult == '20/20 MATCH !' ||
          record.MatchResult == '20/20 MATCH'
        ) {
          matchResult = '2020M';
        } else if (
          record.MatchResult == 'A PERFECT MATCH !' ||
          record.MatchResult == 'PERFECT MATCH'
        ) {
          matchResult = 'PM';
        }
        result[record.generation - 1].push({
          horseName: await this.commonUtilsService.toTitleCase(
            record.horseName,
          ),
          generation: record.generation,
          hp: record.hp,
          tag: record.tag,
          colour: record.ColorCoding,
          category: record.category,
          image: null,
          matchResult: matchResult,
        });
      }
    }, Promise.resolve());
    const perGroup = Math.ceil(result[4].length / 8);
    result[4] = new Array(8)
      .fill('')
      .map((_, i) => result[4].slice(i * perGroup, (i + 1) * perGroup));
    return result;
  }

  //Key words search
  async keyWordsSearchService(
    keyWordsSearchOptionsDto: KeyWordsSearchOptionsDto,
  ) {
    const record = await this.horseRepository.manager.query(
      `EXEC proc_SMPSearch @psearchchars=@0`,
      [keyWordsSearchOptionsDto.keyWord],
    );

    return record;
  }

  //Get All Ancester Horse Ids
  async getAllAncestorHorsesByHorseId(horseId: string) {
    let ancestorHorse = await this.findHorsesByUuid(horseId);
    const finalData = await this.horseRepository.manager.query(
      `EXEC proc_SMPIncludeExcludeKeyAncestor 
      @phorseId=@0`,
      [ancestorHorse.id],
    );

    return finalData;
  }

  //Get a horse wins by id
  async getWins(horseId) {
    let raceWins = await this.connection.query(
      `EXEC procGetHorseStakeRaceWinsList @horseId=@0`,
      [horseId],
    );
    return raceWins;
  }

  //Get all Horse Progeny
  async getHorseProgeny(
    horseId,
    searchOptionsDto,
  ): Promise<PageDto<ProgenyResponseDto>> {
    const horse = await this.horseRepository.findOne({ horseUuid: horseId });
    if (!horse) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
    let query = `EXEC proc_SMPAdmHorseDetailsViewProgeny @phorseid=@0`;
    let params: any = [horse.id];

    if (searchOptionsDto.page) {
      query = query + `, @page=@1`;
      params.push(searchOptionsDto.page);
    }

    if (searchOptionsDto.limit) {
      query = query + `, @size=@2`;
      params.push(searchOptionsDto.limit);
    }

    if (searchOptionsDto.sortBy) {
      query = query + `, @sortColumn=@3`;
      if(searchOptionsDto.sortBy === 'stakes'){
        params.push('IsboolStakesWinners');
      }else if(searchOptionsDto.sortBy === 'runner'){
        params.push('IsRunner');
      }else if(searchOptionsDto.sortBy === 'breeding'){
        params.push('sirename '+searchOptionsDto.order + ', damname');
      }else{
        params.push(searchOptionsDto.sortBy);
      }
    }

    if (searchOptionsDto.order) {
      query = query + `, @sortBy=@4`;
      params.push(searchOptionsDto.order);
    }

    let progeny = await this.connection.query(query, params);

    let dataList = [];
    let itemCount = 0;

    await progeny.reduce(async (promise, item) => {
      await promise;
      itemCount = item?.TotalProgenyCount;
      let obj = {
        horseId: item?.horseUuid,
        horseName: item?.horsename,
        sex: item?.sex,
        yob: item?.yob,
        countryName: item?.CountryName,
        countryCode: item?.CountryCode,
        damName: item?.damname,
        sireName: item?.sirename,
        runner: item?.IsRunner,
        stakes: item?.IsboolStakesWinners,
        progeny: 1500,
        createdOn: item?.createdOn,
        isVerified: item?.IsVerified,
      };
      dataList.push(obj);
    }, Promise.resolve());

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(dataList, pageMetaDto);
  }

  //Get Horse Direct Progenies
  async getHorseDirectProgenies(horseId: number) {
    let finalData = [];
    const result = await this.horseRepository.manager.query(
      `EXEC procGetHorseDirectProgenies 
      @horseId=@0`,
      [horseId],
    );
    if (result.length) {
      finalData = result;
    }
    return finalData;
  }

  //Set Horse Legend Color
  async setHorseLegendColor(records: []) {
    let finalLegendColorRecords = [];
    await records.reduce(async (promise, horseRecord: any) => {
      await promise;
      let legendColor = '';
      const childRecord = records.filter(
        (res: any) => res.id === horseRecord.childId,
      );
      let ageDiffFlag = false;
      if (childRecord.length) {
        //Check Is Sire!
        if (horseRecord.id === childRecord[0]['sireId']) {
          let sireAgeDiff = childRecord[0]['yob'] - horseRecord.yob;
          if (sireAgeDiff < 0 || sireAgeDiff > 30) {
            ageDiffFlag = true;
          }
        } else if (horseRecord.id === childRecord[0]['damId']) {
          //Check Is Dam!
          let damAgeDiff = childRecord[0]['yob'] - horseRecord.yob;
          if (damAgeDiff < 0 || damAgeDiff > 26) {
            ageDiffFlag = true;
          }
        }        
      }

      if (!horseRecord.isVerified) {
        legendColor = '#FF9F22'; //Orange
      } else if (
        !horseRecord.yob ||
        !horseRecord.countryId ||
        !horseRecord.colourId
      ) {
        legendColor = '#D80027'; //Red
      } else if (ageDiffFlag) {
        legendColor = '#FF00E5'; //Pink
      } else if (
        (horseRecord.sex == 'M' && horseRecord.tag.slice(-1) == 'D') ||
        (horseRecord.sex == 'F' && horseRecord.tag.slice(-1) == 'S')
      ) {
        legendColor = '#3139DA' //Royal Blue
      } else if (horseRecord.gelding) {
        legendColor = '#00DE8E'; //Green
      }
      horseRecord.legendColor = legendColor;
      finalLegendColorRecords.push(horseRecord);
    }, Promise.resolve());
    return finalLegendColorRecords;
  }

  //Get Presigned Url For Profile Image Upload
  async getProfileImageUploadUrl(
    horseUuid: string,
    fileInfo: FileUploadUrlDto,
  ) {
    let record = await this.getHorseByUuid(horseUuid);
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    //TODO: Validate allowed file format or not
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get('file.s3DirHorseProfileImage')}/${
      record.horseUuid
    }/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //Set Horse Profile Image
  async setHorseProfilePic(record: Horse, fileUuid: string) {
    await this.deleteHorseProfilePic(record);
    // Set Horse Profile Image
    let mediaRecord = await this.mediaService.create(fileUuid);
    return await this.horseProfileImageService.create({
      horseId: record.id,
      mediaId: mediaRecord.id,
    });
  }

  //Delete Profile Image
  async deleteHorseProfilePic(record: Horse) {
    // Check Profile pic already exist, if yes delete it from S3
    let profileImageData = await this.horseProfileImageService.findByHorseId(
      record.id,
    );
    if (profileImageData) {
      //Mark for Deletion - previous profile image
      await this.mediaService.markForDeletion(profileImageData.mediaId);
    }
  }

  //Save Profile Image
  async saveHorseProfilePic(
    horseUuid: string,
    uploadDto: HorseProfileImageUploadDto,
  ) {
    let record = await this.getHorseByUuid(horseUuid);
    if (uploadDto?.profileImageuuid) {
      return await this.setHorseProfilePic(record, uploadDto.profileImageuuid);
    }
  }

  //Delete Profile Image
  async deleteHorseProfileImage(horseUuid: string) {
    let record = await this.getHorseByUuid(horseUuid);
    await this.deleteHorseProfilePic(record);
  }

  //Get Profile Image By Id
  async getHorseProfilePicByHorseId(horseId: number) {
    let hpiQueryBuilder = getRepository(HorseProfileImage)
      .createQueryBuilder('hpi')
      .select('hpi.horseId as mediaHorseId, media.mediaUrl as profileMediaUrl')
      .innerJoin(
        'hpi.media',
        'media',
        'media.id=hpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    const queryBuilder = this.horseRepository
      .createQueryBuilder('horse')
      .select('profileMediaUrl as profilePic')
      .leftJoin(
        '(' + hpiQueryBuilder.getQuery() + ')',
        'horseprofileimage',
        'mediaHorseId=horse.id',
      );
    queryBuilder.andWhere('horse.id = :horseId', { horseId: horseId });
    return await queryBuilder.getRawOne();
  }

  //Add Horse to Pedigree
  async addHorseToPedigree(horseId: number) {
    await this.horseRepository.manager.query(
      `EXEC proc_SMPInitiateAddJobProcess 
      @phorseid=@0`,
      [horseId],
    );
    return;
  }

  /* Get All Horse Locations */
  async getAllHorsesLocations() {
    let data = await this.horseRepository.manager.query(
      `EXEC proc_SMPGetAllHorsesCountries`,
    );
    return data;
  }

  //Send horse approved Notification
  async sendNotification(createHorseDto) {
    const member = this.request.user;
    if(createHorseDto.sex === 'M'){

      const horseRequest = await this.stallionRequestsService.getByUuid(
        createHorseDto?.requestId,
      );
      if (
        horseRequest &&
        horseRequest.horseName === createHorseDto.horseName &&
        horseRequest.yob === createHorseDto.yob &&
        horseRequest.countryId === createHorseDto.countryId
      ) {
        const updateRequest = await this.stallionRequestsService.updateRequest(
          createHorseDto?.requestId,
          { horseId: createHorseDto.horseId, modifiedBy:member['id'], modifiedOn: new Date(),isApproved: true },
        );
        if (updateRequest.isApproved) {
          const requestedMember = await getRepository(Member).findOne(
            updateRequest?.createdBy,
          );
  
          const messageTemplate =
            await this.messageTemplatesService.getMessageTemplateByUuid(
              notificationTemplates.approvedNewHorseRequest,
            );
          const messageText = messageTemplate.messageText.replace(
            '{horseName}',
            updateRequest.horseName,
          );
          const messageTitle = messageTemplate.messageTitle;
          const notificationTypes =
            await this.notificationTypeService.findByNotificationCode(
              notificationTypeList.SYSTEM_NOTIFICATIONS,
            );
  
          this.notificationsService.create({
            createdBy: member['id'],
            messageTemplateId: messageTemplate?.id,
            notificationShortUrl: 'notificationShortUrl',
            recipientId: requestedMember['id'],
            messageTitle,
            messageText,
            isRead: false,
            notificationType: notificationTypes?.id,
          });
        }
      }
    }else{
      const horseRequest = await this.mareRequestsService.getByUuid(
        createHorseDto?.requestId,
      );
      if (
        horseRequest &&
        horseRequest.horseName === createHorseDto.horseName &&
        horseRequest.yob === createHorseDto.yob &&
        horseRequest.countryId === createHorseDto.countryId
      ) {
        const updateRequest = await this.mareRequestsService.updateRequest(
          createHorseDto?.requestId,
          { horseId: createHorseDto.horseId, modifiedBy:member['id'], modifiedOn: new Date(),isApproved: true },
        );
        if (updateRequest.isApproved) {
          const requestedMember = await getRepository(Member).findOne(
            updateRequest?.createdBy,
          );
  
          const messageTemplate =
            await this.messageTemplatesService.getMessageTemplateByUuid(
              notificationTemplates.approvedNewMareRequest,
            );
          const messageText = messageTemplate.messageText.replace(
            '{horseName}',
            updateRequest.horseName,
          );
          const messageTitle = messageTemplate.messageTitle;
          const notificationTypes =
            await this.notificationTypeService.findByNotificationCode(
              notificationTypeList.SYSTEM_NOTIFICATIONS,
            );
  
          this.notificationsService.create({
            createdBy: member['id'],
            messageTemplateId: messageTemplate?.id,
            notificationShortUrl: 'notificationShortUrl',
            recipientId: requestedMember['id'],
            messageTitle,
            messageText,
            isRead: false,
            notificationType: notificationTypes?.id,
          });
        }
      }
    }
  }

  //Get All Horse Pedigree Position Tags
  async defaultHorseDataWithPositions() {
    const horsePedigreePositions = await this.horseRepository.manager.query(
      `EXEC proc_SMPGetHorsePedigreeTags`,
    );
    let initPedigree = [];
    await horsePedigreePositions.map(function (item: { tag: string }) {
      const itemData = {
        tag: item.tag,
        olduuid: null,

        horseData: DEFAULTPEDIGREEHORSEOBJECT,
      };
      initPedigree.push(itemData);
    });
    let pedigree = await this.getFlatPedigreeDataByTag(
      initPedigree,
      DEFAULTPEDIGREEHORSEOBJECT,
    );
    return {
      ...DEFAULTMAINHORSEOBJECT,
      pedigree,
    };
  }

  /* Get Horse Flat Pedigree Data */
  async getFlatPedigreeDataByTag(initPedigree, mainHorse = null) {
    let pedigree = [];
    if (mainHorse) {
      pedigree.push([
        {
          tag: 'MH',
          horseData: mainHorse,
        },
      ]);
    }
    initPedigree.map((record: any) => {
      if (!pedigree[record.tag.length]) {
        pedigree[record.tag.length] = [];
      }
      pedigree[record.tag.length].push(record);
    });
    return pedigree;
  }

  //Get Horse Data From The Input Position
  async getHorseDataFromTheInputPosition(
    horseId: string,
    horsePosition: string,
  ) {
    const record = await this.getHorseByUuid(horseId);
    const dataFromDB = await this.horseRepository.manager.query(
      `EXEC proc_SMPSearchPedigreeAppendInputTag 
      @inputHorseId=@0,
      @position=@1`,
      [record.id, horsePosition],
    );
    let resultsAfterLegendColor = await this.setHorseLegendColor(dataFromDB);
    let pedigreeList = [];
    await resultsAfterLegendColor.map(async (item) => {
      pedigreeList.push({
        tag: item.tag,
        olduuid: item.horseId,
        horseData: {
          horseId: item.horseId,
          horseName: item.horseName,
          sex: item.sex,
          yob: item.yob,
          countryId: item.countryId,
          colourId: item.colourId,
          gelding: item.gelding,
          isLocked: item.isLocked,
          horseTypeId: item.horseTypeId,
          cob: item.cob,
          G1Tag: item.G1Tag,
          G1TagFull: item.G1TagFull,
          isVerified: item.isVerified,
          progenyId: item.progenyId,
          legendColor: item.legendColor,
          isFormDataModified: false,
        },
      });
    });
    let pedigree = await this.getFlatPedigreeDataByTag(pedigreeList);
    const filteredPedigree = pedigree.filter((value) => value !== null);
    return filteredPedigree;
  }

  //Create A New Horse With Pedigree
  async createNewHorseWithPedigree(createDto) {
    // let finalUseCaseMainHorseSireDam = [
    //   [
    //     {
    //       tag: 'MH',
    //       olduuid: null,
    //       horseData: {
    //         horseName: `UseCaseMainHorseSireDam-${new Date()}`,
    //         sex: 'M',
    //         yob: 2021,
    //         countryId: 11,
    //         colourId: 2,
    //         gelding: false,
    //         isLocked: false,
    //         horseTypeId: 2,
    //         dob: null,
    //         currencyId: null,
    //         totalPrizeMoneyEarned: null,
    //         isFormDataModified: true,
    //         requestId: null,
    //       },
    //     },
    //   ],
    //   [
    //     {
    //       tag: 'S',
    //       olduuid: '82A6C840-F552-EE11-AC1E-0A7165323890',
    //       horseData: null,
    //     },
    //     {
    //       tag: 'D',
    //       olduuid: '68796CBC-BF52-EE11-AC1E-0A7165323890',
    //       horseData: null,
    //     },
    //   ],
    // ];
    try {
      if (!createDto.data.length) {
        throw new UnprocessableEntityException('Not a valid data!');
      }
      const batch = createDto.batch;
      const member = this.request.user;
      //New Main Horse - Sire and Dam Selected
      //let dataArray = finalUseCaseMainHorseSireDam.reverse();
      let dataArray = createDto.data.reverse();
      //Capture Existing Identities
      let existingIdentities = [];
      await dataArray.reduce(async (promise, subItem: []) => {
        await promise;
        await subItem.reduce(
          async (
            subItemPromise,
            item: CreateNewHorseWithPedigreeHorseItemDto,
          ) => {
            await subItemPromise;
            if (item.olduuid) {
              existingIdentities.push(item.olduuid);
            }
          },
          Promise.resolve(),
        );
      }, Promise.resolve());

      //Validate Identities
      if (existingIdentities.length) {
        let validationRecords = await this.horseRepository.manager.query(
          `EXEC Proc_SMPValidateHorseIdentities 
          @Identities=@0`,
          [existingIdentities.toString()],
        );
        const invalidRecords = validationRecords.filter(function (item) {
          return item.validationStatus === 0;
        });
        if (invalidRecords.length) {
          //Input - existing Horse Identites are invallid
          throw new UnprocessableEntityException('Data not valid!');
        }
      }
      //Loop the items and insert in temp table
      await dataArray.reduce(async (promise, subItem: []) => {
        await promise;
        await subItem.reduce(async (subItemPromise, item: any) => {
          await subItemPromise;
          // Temp table
          let recData = {
            batch: batch,
            horseName: null,
            countryId: null,
            colourId: null,
            horseTypeId: null,
            yob: null,
            dob: null,
            sex: null,
            gelding: null,
            currencyId: null,
            totalPrizeMoneyEarned: null,
            isLocked: null,
            sireId: item.sireId,
            damId: item.damId,
            existingHorseId: null,
            isFormDataModified: null,
            requestId: null,
          };
          if (!item.olduuid) {
            recData.horseName = item.horseData.horseName;
            recData.countryId = item.horseData.countryId;
            recData.colourId = item.horseData.colourId;
            recData.horseTypeId = item.horseData.horseTypeId;
            recData.yob = item.horseData.yob;
            recData.dob = item.horseData.dob;
            recData.sex = item.horseData.sex;
            recData.gelding = item.horseData.gelding;
            recData.currencyId = item.horseData.currencyId;
            recData.totalPrizeMoneyEarned =
              item.horseData.totalPrizeMoneyEarned;
            recData.isLocked = item.horseData.isLocked;
            recData.sireId = item.sireId;
            recData.damId = item.damId;
            recData.requestId = item.horseData.requestId;
          }
          if (item.olduuid) {
            recData.existingHorseId = item.olduuid;
          }
          let newRecordResponse = await this.horseBulkRepository.save(recData);
          //Horse Created - Got The response from server, appended new identifier to original object
          item.horseId = newRecordResponse.id;
          //Get Horse Position is S or D
          let horseSexPosition = '';
          if (item.tag) {
            horseSexPosition = item.tag.charAt(item.tag.length - 1);
          }
          //Get Child Horse Position if the current Item is a Sire/Dam of any generation
          let progenyTag = '';
          console.log('item.tag', item.tag);
          if (item.tag && item.tag.slice(0, -1) === '') {
            progenyTag = 'MH';
          } else {
            progenyTag = item.tag.slice(0, -1);
          }
          //Get Child Data - Using progenyTag
          let progenyData = this.commonUtilsService.compareKeyInArrayOfArrays(
            dataArray,
            'tag',
            progenyTag,
          );
          //Get Child Data - Using progenyTag - To set sireId/damId
          //Check and Set sireId/damId depends on horseSexPosition
          if (horseSexPosition === 'S') {
            progenyData['sireId'] = item.horseId;
          } else if (horseSexPosition === 'D') {
            progenyData['damId'] = item.horseId;
          }
        }, Promise.resolve());
      }, Promise.resolve());

      //Set Edge cases for existing horses
      //Like end generations sire/dam from the existing horses in Main Horse table tblHorse
      await this.horseRepository.manager.query(
        `EXEC Proc_SMPSetSireAndDamFromExistingMainTableHorse 
          @pBatchId=@0,
          @pBatchStatus=@1`,
        [batch, false],
      );

      //Get Records for the batch from Bulk Table
      let batchRecords = await this.horseRepository.manager.query(
        `EXEC Proc_SMPGetBatchRecordsFromAddNewHorseBatchTable 
          @pBatchId=@0,
          @pBatchStatus=@1`,
        [batch, false],
      );

      let mainHorseData = {};
      await batchRecords.reduce(async (subItemPromise, item: any) => {
        await subItemPromise;
        //To get updated records, need to execute individual sql
        let record = await this.horseBulkRepository.findOneOrFail({
          id: item.id,
        });
        //existingHorseId Is null in bulk table
        if (item.existingHorseId === null) {
          let mainTableRecord = await this.horseRepository.save({
            horseName: record.horseName,
            countryId: record.countryId,
            colourId: record.colourId,
            horseTypeId: record.horseTypeId,
            yob: record.yob,
            dob: record.dob,
            sex: record.sex,
            gelding: record.gelding,
            currencyId: record.currencyId,
            totalPrizeMoneyEarned: record.totalPrizeMoneyEarned,
            isLocked: record.isLocked,
            sireId: record.maintblSireId,
            damId: record.maintblDamId,
            isVerified: true,
            verifiedBy: member['id'],
            verifiedOn: new Date(),
            isActive: true,
            createdBy: member['id'],
            createdOn: new Date(),
          });
          //Set Sire and Dam Positions
          await this.setmainTblSireAndDamData(record.id, mainTableRecord.id);
          //Add New Horse To Pedigree
          await this.addHorseToPedigree(mainTableRecord.id);
          mainHorseData = {
            horseUuid: mainTableRecord.horseUuid,
          };
          //Update horse request
          let createDto = new CreateHorseDto();
          createDto.horseName = record.horseName;
          createDto.countryId = record.countryId;
          createDto.yob = record.yob;
          createDto.sex = record.sex;
          createDto.requestId = record.requestId;
          if (record.requestId) {
            createDto['horseId'] = mainTableRecord.id;
            await this.sendNotification(createDto);
          }
        }

        //existingHorseId Is exist in bulk table
        if (item.existingHorseId) {
          let existingHorserecordInMainTbl =
            await this.horseRepository.findOneOrFail({
              horseUuid: item.existingHorseId,
            });
          //Set Sire and Dam Positions
          await this.setmainTblSireAndDamData(
            record.id,
            existingHorserecordInMainTbl.id,
          );
          //Is Data Not Modified?
          if (!item.isFormDataModified) {
            //Update the positions in the pedigree table
            if (existingHorserecordInMainTbl.sireId !== record.maintblSireId) {
              await this.pedigreeProgenyUpdate(
                existingHorserecordInMainTbl.id,
                record.maintblSireId,
                'S',
              );
            }
            if (existingHorserecordInMainTbl.damId !== record.maintblDamId) {
              await this.pedigreeProgenyUpdate(
                existingHorserecordInMainTbl.id,
                record.maintblDamId,
                'D',
              );
            }
            //Sire/Dam Modified!
            if (
              existingHorserecordInMainTbl.sireId !== record.maintblSireId ||
              existingHorserecordInMainTbl.damId !== record.maintblDamId
            ) {
              existingHorserecordInMainTbl.sireId = record.maintblSireId;
              existingHorserecordInMainTbl.damId = record.maintblDamId;
              existingHorserecordInMainTbl.modifiedBy = member['id']; //get this from token
              existingHorserecordInMainTbl.modifiedOn = new Date();
              existingHorserecordInMainTbl.save();
            }
          }
        }
      }, Promise.resolve());
      //Update Flag For Batch Transaction
      await this.horseBulkRepository.update(
        {
          batch: batch,
        },
        {
          batchStatus: true,
        },
      );
      //Delete Records From Temp Table - Which are having batchStatus as true
      // await this.horseBulkRepository.delete(
      //   {
      //     batchStatus: true,
      //   }
      // );
      //Return Data
      return mainHorseData;
    } catch (error) {
      throw error;
    }
  }

  //Set Main Tbl Sire And Dam Data In Bulk Table
  async setmainTblSireAndDamData(bulkTablePk, mainTablePk) {
    return await this.horseRepository.manager.query(
      `EXEC Proc_SMPSetMaintblPedigreeIdsInBulkProcessTable 
      @pBulkTablePk=@0,
      @pMainTablePk=@1`,
      [bulkTablePk, mainTablePk],
    );
  }

  //Update Pedigree Progeny
  async pedigreeProgenyUpdate(sourceHorseid, targetHorseid, updateLevel) {
    await this.horseRepository.manager.query(
      `EXEC Proc_PedigreeProgenyUpdate 
                     @SourceHorseid=@0,
                     @TargetHorseid=@1,
                     @UpdateLevel=@2`,
      [sourceHorseid, targetHorseid, updateLevel],
    );
    return;
  }

  //Find Horses By Name And Sex
  async findHorsesByNameAndSex(
    searchOptions: HorseNameSearchDto,
  ) {
    return await this.horseRepository.manager.query(
      `EXEC procSearchHorseByNameAndSex 
      @pHorseName=@0,
      @pSex=@1`,
      [searchOptions.horseName, searchOptions.sex],
    );
  }

  //Get Horse Pedigree By Id
  async getHorsePedigreeById(id: string) {
    try {
      const record = await this.horseRepository.findOneOrFail({
        horseUuid: id,
        isArchived: Not(true),
      });
      const mainHorseRecord = await this.findOne(record.horseUuid);
      const dataFromDB = await this.horseRepository.manager.query(
        `EXEC proc_SMPSearchPedigree 
        @Paramid=@0`,
        [record.id],
      );
      let resultsAfterLegendColor = await this.setHorseLegendColor(dataFromDB);
      let pedigreeList = [];
      await resultsAfterLegendColor.map(async (item) => {
        pedigreeList.push({
          tag: item.tag,
          horseId: item.horseId,
          horseName: item.horseName,
          sex: item.sex,
          yob: item.yob,
          countryId: item.countryId,
          colourId: item.colourId,
          gelding: item.gelding,
          isLocked: item.isLocked,
          horseTypeId: item.horseTypeId,
          cob: item.cob,
          G1Tag: item.FirstInfo,
          G1TagFull: item.FirstInfoInFull,
          isVerified: item.isVerified,
          progenyId: item.progenyId,
          legendColor: item.legendColor,
        });
      });
      let pedigree = await this.getFlatPedigreeDataByTag(pedigreeList);
      const filteredPedigree = pedigree.filter((value) => value !== null);
      delete mainHorseRecord.id;
      delete mainHorseRecord.sireId;
      delete mainHorseRecord.damId;
      delete mainHorseRecord.isActive;
      return {
        ...mainHorseRecord,
        horsePedigrees: filteredPedigree,
      };
    } catch (err) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
  }
}
