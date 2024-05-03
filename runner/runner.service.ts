import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ExcelService } from 'src/excel/excel.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { Race } from 'src/race/entities/race.entity';
import { RaceService } from 'src/race/race.service';
import { DashboardDto } from 'src/runner/dto/dashboard.dto';
import { RUNNERDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { getRepository, Repository, UpdateResult } from 'typeorm';
import { AccuracyRatingDashboardDto } from './dto/accuracy-rating-dashboard.dto';
import { CreateRunnerDto } from './dto/create-runner.dto';
import { DashboardOptionalCountryDto } from './dto/dashboard-optional-country.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { MatchedHorseSearchDto } from './dto/search-by-horse-name.dto';
import { SearchOptionsDownloadDto } from './dto/search-options-download.dto';
import { SearchOptionsDto } from './dto/search-options-dto';
import { EligibiltyByRaceIdDto } from './dto/update-eligibility-byrace.dto';
import { UpdateRunnerDto } from './dto/update-runner.dto';
import { Runner } from './entities/runner.entity';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RunnerService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @Inject(forwardRef(() => RaceService))
    private raceService: RaceService,
    private horseService: HorsesService,
    @InjectRepository(Runner)
    private runnerRepository: Repository<Runner>,
    private excelService: ExcelService,
    private readonly configService: ConfigService,
    private currenciesService: CurrenciesService,
    private eventEmitter: EventEmitter2,
  ) {}
  /* Get Runner Details */
  async findOne(id: string) {
    const record = await this.runnerRepository.findOne({
      runnerUuid: id,
    });
    if (!record) {
      throw new UnprocessableEntityException('Runner not exist!');
    }
    const details = await this.runnerRepository
      .createQueryBuilder('runner')
      .select(
        'runner.id as runnerId,runner.runnerUuid,runner.raceId,horses.horseUuid as horseUuid,runner.horseId,horses.horseName,runner.number,runner.barrier,runner.finalPositionId,runner.margin,runner.weight,runner.weightUnitId,runner.jockeyId,jockey.displayName,runner.trainerId,trainer.displayName as trainerName,runner.ownerId,owner.displayName as ownerName,runner.prizemoneyWon,runner.startingPrice,runner.currencyId,runner.isApprentice,runner.isScratched,runner.sourceId,runner.isEligible,member.fullName as createdBy,runner.createdOn,mem.fullName as modifiedBy,runner.modifiedOn',
      )
      .addSelect('weightUnit.weightUnitName as weightUnit')
      .addSelect('silksColors.displayName as silksColor')
      .addSelect(
        'race.displayName as raceName,race.raceUuid as raceUuid,race.raceTime as raceTime',
      )
      .innerJoin('runner.horses', 'horses')
      .leftJoin('runner.members', 'member')
      .leftJoin('runner.member', 'mem')
      .leftJoin('horses.nationality', 'nationality')
      .leftJoin('runner.weightUnits', 'weightUnit')
      .leftJoin('runner.silksColors', 'silksColors')
      .leftJoin('runner.owner', 'owner')
      .leftJoin('runner.trainer', 'trainer')
      .leftJoin('runner.jockey', 'jockey')
      .leftJoin('runner.races', 'race', 'race.id = runner.raceId')
      .andWhere('runner.runnerUuid = :runnerUuid', { runnerUuid: id })
      .getRawOne();
    const finalResponse = {
      ...details,
    };
    return finalResponse;
  }
  /* Create Runner */
  async create(createRunnerDto: CreateRunnerDto) {
    const member = this.request.user;
    createRunnerDto.createdBy = member['id'];
    let horse = await getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id as id')
      .andWhere('horse.horseUuid = :horseUuid', {
        horseUuid: createRunnerDto.horseId,
      })
      .getRawOne();
    const record = await this.runnerRepository.findOne({
      horseId: horse.id,
      raceId: createRunnerDto.raceId,
    });
    if (record) {
      throw new UnprocessableEntityException('Runner already exist!');
    }
    createRunnerDto.horseId = horse.id;
    const runnerResponse = await this.runnerRepository.save(
      this.runnerRepository.create(createRunnerDto),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Runner Created successfully',
    };
  }
  /* Get Runner List */
  async findAll(searchOptions: SearchOptionsDto): Promise<PageDto<Runner>> {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    if (searchOptions?.currencyId) {
      let currencyData = await this.currenciesService.findOne(
        searchOptions?.currencyId,
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

    let raceQuery = getRepository(Race)
      .createQueryBuilder('race')
      .select(
        'race.displayName as raceName,race.raceUuid as raceuuid, race.id as raceId,race.raceDate as raceDate,race.venueId as venueId ,venues.countryId as raceCountryId',
      )
      .addSelect('raceclasses.displayName as class')
      .addSelect('venues.displayName as venue ')
      .addSelect(
        'racestakes.displayName as stakes,racestakes.id as racestakesId',
      )
      .leftJoin('race.raceclasses', 'raceclasses')
      .leftJoin('race.venues', 'venues')
      .leftJoin('race.racestakes', 'racestakes');

    const queryBuilder = this.runnerRepository
      .createQueryBuilder('runner')
      .select(
        'runner.runnerUuid as runnerUuid,race.raceUuid as raceUuid,race.raceId as raceId,race.raceName as raceName,race.raceDate as raceDate ,runner.createdOn as createdOn,horses.horseUuid as horseId,runner.isEligible as isEligible,runner.barrier as barrier,runner.number as number,runner.prizeMoneyWon as prizeMoneyWon,runner.margin as margin, runner.weight as weight',
      )
      .addSelect('race.venue as venue')
      .addSelect('race.class as class')
      .addSelect('race.stakes as stakes')
      .addSelect(
        'horses.horseName as horseName, horses.countryId as country,horses.yob as yob,horses.horseTypeId as horseTypeId',
      )
      .addSelect(
        'sire.sireId ,sire.sireName,sire.sireCountryCode,sire.sireYob ',
      )
      .addSelect('dam.damId ,dam.damName, dam.damCountryCode,dam.damYob')
      .addSelect('positions.displayName as position')
      .addSelect('nationality.countryCode as countryCode')
      .addSelect('weightUnit.weightUnitName as weightUnit')
      .addSelect('silksColors.displayName as silksColor')
      .addSelect('accuracyprofile.accuracyRating as accuracyRating')
      .leftJoin('runner.positions', 'positions')
      .innerJoin('runner.horses', 'horses')
      .innerJoin('horses.runneraccuracyprofile', 'accuracyprofile')
      .leftJoin('horses.nationality', 'nationality')
      .leftJoin('runner.weightUnits', 'weightUnit')
      .leftJoin('runner.silksColors', 'silksColors')
      .leftJoin(
        '(' + raceQuery.getQuery() + ')',
        'race',
        'race.raceId=runner.raceId',
      )
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horses.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horses.damId',
      )
      .innerJoin('runner.currency', 'currency')
      .innerJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .innerJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      );

    if (searchOptions.name) {
      if (searchOptions.isNameExactSearch) {
        queryBuilder.andWhere('horses.horseName =:horseName', {
          horseName: searchOptions.name,
        });
      } else {
        queryBuilder.andWhere('horses.horseName like :horseName', {
          horseName: '%' + searchOptions.name + '%',
        });
      }
    }
    if (searchOptions.countryId) {
      queryBuilder.andWhere('race.raceCountryId = :countryId', {
        countryId: searchOptions.countryId,
      });
    }
    if (searchOptions.venue) {
      queryBuilder.andWhere('race.venue like :venue', {
        venue: '%' + searchOptions.venue + '%',
      });
    }
    if (searchOptions.raceId) {
      queryBuilder.andWhere('race.raceUuid = :raceId', {
        raceId: searchOptions.raceId,
      });
    }
    if (searchOptions.class) {
      queryBuilder.andWhere('race.class = :class', {
        class: searchOptions.class,
      });
    }
    if (searchOptions.stakes) {
      let stakes = searchOptions.stakes.split(',');
      let stakesList = stakes.map((res) => parseInt(res));
      queryBuilder.andWhere('race.racestakesId IN (:...racestakesId)', {
        racestakesId: stakesList,
      });
    }
    if (searchOptions.breed) {
      queryBuilder.andWhere('horses.horseTypeId = :horseTypeId', {
        horseTypeId: searchOptions.breed,
      });
    }
    if (searchOptions.sire) {
      if (searchOptions.isSireExactSearch) {
        queryBuilder.andWhere('sire.sireName = :sire', {
          sire: searchOptions.sire,
        });
      } else {
        queryBuilder.andWhere('sire.sireName like :sire', {
          sire: '%' + searchOptions.sire + '%',
        });
      }
    }
    if (searchOptions.dam) {
      if (searchOptions.isDamExactSearch) {
        queryBuilder.andWhere('dam.damName = :dam', { dam: searchOptions.dam });
      } else {
        queryBuilder.andWhere('dam.damName like :dam', {
          dam: '%' + searchOptions.dam + '%',
        });
      }
    }
    if (searchOptions.position) {
      let position = searchOptions.position.split(',');
      let positionList = position.map((res) => parseInt(res));
      queryBuilder.andWhere('runner.finalPositionId IN (:...finalPositionId)', {
        finalPositionId: positionList,
      });
    }

    if (searchOptions.age) {
      const year = new Date().getFullYear();
      queryBuilder.andWhere(year + '-Horses.yob=' + searchOptions.age);
    }
    if (searchOptions.rating) {
      queryBuilder.andWhere(
        'accuracyprofile.accuracyRating = :accuracyRating',
        { accuracyRating: searchOptions.rating },
      );
    }
    if (searchOptions.date) {
      const dateRange = searchOptions.date;
      let dateList = dateRange.split('/');
      if (dateList.length === 2) {
        var minDate = dateList[0];
        var maxDate = dateList[1];
      }
      queryBuilder.andWhere(
        'race.raceDate  >= CONVERT(date, :minDate) AND race.raceDate <= CONVERT(date, :maxDate)',
        {
          minDate,
          maxDate,
        },
      );
    }
    if (searchOptions.prizeMoney) {
      const prizeMoney = searchOptions.prizeMoney;
      let prizeList = prizeMoney.split('-');
      if (prizeList.length === 2) {
        let minPrice = prizeList[0];
        let maxPrice = prizeList[1];
        queryBuilder.andWhere(
          'runner.prizeMoneyWon >= :minPrice AND runner.prizeMoneyWon <= :maxPrice',
          {
            minPrice,
            maxPrice,
          },
        );
      }
    }
    if (searchOptions.priceRange) {
      const priceRange = searchOptions.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        if (searchOptions.includeEmptyField === true) {
          queryBuilder.andWhere(
            '(((runner.prizeMoneyWon * destCurrency.rate/actCurrency.rate) >= :minPrice AND (runner.prizeMoneyWon * destCurrency.rate/actCurrency.rate) <= :maxPrice ) OR runner.prizeMoneyWon=0)',
            {
              minPrice,
              maxPrice,
            },
          );
        } else {
          queryBuilder.andWhere(
            '(runner.prizeMoneyWon * destCurrency.rate/actCurrency.rate) >= :minPrice AND (runner.prizeMoneyWon * destCurrency.rate/actCurrency.rate) <= :maxPrice',
            {
              minPrice,
              maxPrice,
            },
          );
        }
      }
    }

    if (!searchOptions.priceRange && searchOptions.includeEmptyField === true) {
      queryBuilder.andWhere('runner.prizeMoneyWon = :prizeMoneyWon', {
        prizeMoneyWon: 0,
      });
    }

    queryBuilder;
    if (searchOptions.sortBy) {
      const sortBy = searchOptions.sortBy;
      const byOrder = searchOptions.order;
      if (sortBy.toLowerCase() === 'venue') {
        queryBuilder.orderBy('race.venue', byOrder);
      }
      if (sortBy.toLowerCase() === 'raceid') {
        queryBuilder.orderBy('race.raceId', byOrder);
      }
      if (sortBy.toLowerCase() === 'class') {
        queryBuilder.orderBy('race.class', byOrder);
      }
      if (sortBy.toLowerCase() === 'horsename') {
        queryBuilder.orderBy('horses.horseName', byOrder);
      }
      if (sortBy.toLowerCase() === 'sirename') {
        queryBuilder.orderBy('sire.sireName', byOrder);
      }
      if (sortBy.toLowerCase() === 'damname') {
        queryBuilder.orderBy('dam.damName', byOrder);
      }
      if (sortBy.toLowerCase() === 'position') {
        queryBuilder.orderBy('positions.displayName', byOrder);
      }
      if (sortBy.toLowerCase() === 'name') {
        queryBuilder.orderBy('race.raceName', byOrder);
      }
      if (sortBy.toLowerCase() === 'racedate') {
        queryBuilder.orderBy('race.raceDate', byOrder);
      }
    } else {
      queryBuilder.orderBy('race.raceId', searchOptions.order);
    }

    queryBuilder.offset(searchOptions.skip).limit(searchOptions.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptions,
    });

    return new PageDto(entities, pageMetaDto);
  }
  /* Update Runner */
  async update(id: string, updateRunnerDto: UpdateRunnerDto) {
    const member = this.request.user;
    let horseQuery = await getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id as id')
      .andWhere('horse.horseUuid = :horseUuid', { horseUuid: updateRunnerDto.horseId })
      .getRawOne();
    if (!horseQuery) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
    const raceToUpdate = await this.findRaceByIdWithAllFields(id)
    updateRunnerDto.horseId = horseQuery.id
    Object.keys(updateRunnerDto).forEach((key) => {
      if (raceToUpdate.hasOwnProperty(key) && raceToUpdate[key] !== updateRunnerDto[key]) {
        //    raceToUpdate[key] = updateRaceDto[key];
        this.eventEmitter.emit('updateActivityRunner', {
          key: key,
          oldValue: raceToUpdate[key],
          newValue: updateRunnerDto[key]
        });
      }
    });
    
    updateRunnerDto.modifiedBy = member['id'];
    await this.runnerRepository.update({ runnerUuid: id }, updateRunnerDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Runner updated successfully',
    };
  }

  async findRaceByIdWithAllFields(id: string): Promise<Runner> {
    return await this.runnerRepository
      .createQueryBuilder('runner')
      .select([
        'runner.raceId',
        'runner.horseId',
        'runner.number',
        'runner.barrier',
        'runner.finalPositionId',
        'runner.margin',
        'runner.weight',
        'runner.weightUnitId',
        'runner.jockeyId',
        'runner.trainerId',
        'runner.ownerId',
        'runner.currencyId',
        'runner.prizemoneyWon',
        'runner.startingPrice',
        'runner.sourceId',
        'runner.isEligible',
        'runner.isApprentice',
        'runner.isScratched',
        'runner.modifiedBy',
      ])
      .where('runner.runnerUuid = :id', { id })
      .getOne();
  }
  
  /* Update All Runner's Eligibility in Race */
  async updateRace(
    raceId: string,
    eligibiltyByRaceIdDto: EligibiltyByRaceIdDto,
  ) {
    const member = this.request.user;

    eligibiltyByRaceIdDto.modifiedBy = member['id'];

    const race = await this.raceService.findOne(raceId);

    if (!race) {
      throw new UnprocessableEntityException('Race not exist!');
    }

    const updateResult: UpdateResult = await this.runnerRepository.update(
      { raceId: race.raceId },
      eligibiltyByRaceIdDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Runners in race updated successfully',
    };
  }
  /* Update All Runner's Eligibility For Horse */
  async updateAll(runnerId, eligibiltyByRaceIdDto: EligibiltyByRaceIdDto) {
    const member = this.request.user;
    eligibiltyByRaceIdDto.modifiedBy = member['id'];
    const runner = await this.findOne(runnerId);
    if (!runner) {
      throw new UnprocessableEntityException('Runner not exist!');
    }
    const races = await this.runnerRepository
      .createQueryBuilder('runner')
      .select('DISTINCT(runner.raceId)')
      .andWhere('runner.horseId =:horseId ', { horseId: runner.horseId })
      .getRawMany();
    // runners.forEach(async (element) => {
    //   const updateResult: UpdateResult = await this.runnerRepository.update(
    //     { horseId: element.horseId },
    //     eligibiltyByRaceIdDto,
    //   );
    //   if (updateResult.affected > 0) {
    //   }
    // });
    let racesList = [];
    races.forEach(async (element) => {
      racesList.push(element.raceId);
    });
    if (racesList.length) {
      await this.runnerRepository
        .createQueryBuilder()
        .update(Runner)
        .set({
          isEligible: eligibiltyByRaceIdDto.isEligible,
          modifiedBy: eligibiltyByRaceIdDto.modifiedBy,
        })
        .where('raceId IN (:...raceIds)', { raceIds: racesList })
        .execute();
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'All Runners eligibility updated successfully',
    };
  }
  /* Update only Runner */
  async updateOnlyRunner(horseId, eligibiltyByRaceIdDto) {
    const member = this.request.user;
    eligibiltyByRaceIdDto.modifiedBy = member['id'];
    let horseQuery = await getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id as id')
      .andWhere('horse.horseUuid = :horseUuid', { horseUuid: horseId })
      .getRawOne();
    if (!horseQuery) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
    const updateResult: UpdateResult = await this.runnerRepository.update(
      { horseId: horseQuery.id },
      eligibiltyByRaceIdDto,
    );
    if (updateResult.affected > 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Runner eligibility updated successfully',
      };
    }
  }

  /* Searh With RunnerName*/
  async searchByName(searchOptionsDto: MatchedHorseSearchDto) {
    return await this.runnerRepository.manager.query(
      `EXEC procSearchHorseByName
      @pHorseName=@0`,
      [searchOptionsDto.name],
    );
  }

  /* Get Dashboard Data */
  async getRunnerDashboardData(options: DashboardDto) {
    let result = await this.runnerRepository.manager.query(
      `EXEC procGetRunnerDashboard @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`,
      [options.fromDate, options.toDate, options.countryId],
    );
    let respone = [];
    await result.map((record: any) => {
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
  /* Get horse Details */
  async getHorseDetails(horseId: string) {
    const record = await getRepository(Horse).findOne({ horseUuid: horseId });

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

    let wins = await getRepository(Runner)
      .createQueryBuilder('runner')
      .andWhere('runner.horseId = :horseId', { horseId: record.id })
      .andWhere('runner.finalPositionId = :finalPositionId', {
        finalPositionId: 1,
      })
      .getCount();

    let StakeWins = await getRepository(Runner)
      .createQueryBuilder('runner')
      .andWhere('runner.horseId = :horseId', { horseId: record.id })
      .andWhere('runner.finalPositionId = :finalPositionId', {
        finalPositionId: 1,
      })
      .andWhere('race.racestakeId IN (:...racestakeId)', {
        racestakeId: [2, 3, 4, 5],
      })
      .leftJoin('runner.races', 'race')
      .getCount();

    let horseQuery = await getRepository(Runner)
      .createQueryBuilder('runner')
      .select('COUNT(runner.raceId)', 'totalRun')
      .addSelect('SUM(runner.prizemoneyWon)', 'totalPrizemoneyWon')
      .andWhere('runner.horseId = :horseId', { horseId: record.id })
      .getRawOne();

    // let details = await getRepository(Runner)
    //   .createQueryBuilder('runner')
    //   .select('sire.sireId ,sire.sireName')
    //   .addSelect('dam.damId ,dam.damName')
    //   .addSelect(
    //     'nationality.countryCode as cob ,horses.yob,horses.horseUuid as horseId,horses.horseName',
    //   )
    //   .innerJoin('runner.horses', 'horses')
    //   .leftJoin('horses.nationality', 'nationality')
    //   .leftJoin(
    //     '(' + sireQueryBuilder.getQuery() + ')',
    //     'sire',
    //     'sireProgenyId=horses.sireId',
    //   )
    //   .leftJoin(
    //     '(' + damQueryBuilder.getQuery() + ')',
    //     'dam',
    //     'damProgenyId=horses.damId',
    //   )
    //   .andWhere('runner.horseId = :horseId', { horseId: record.id })
    //   .getRawOne();
    let details = await getRepository(Horse)
      .createQueryBuilder('horse')
      .select('sire.sireId ,sire.sireName')
      .addSelect('dam.damId ,dam.damName')
      .addSelect(
        'nationality.countryCode as cob ,horse.yob,horse.horseUuid as horseId,horse.horseName',
      )
      .leftJoin('horse.nationality', 'nationality')
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
      .andWhere('horse.id = :horseId', { horseId: record.id })
      .getRawOne();

    const finalResponse = {
      ...details,
      ...horseQuery,
      totalWins: wins,
      totalStakeWins: StakeWins,
    };
    return finalResponse;
  }

  async getDashboradWorldReachData(options: DashboardOptionalCountryDto) {
    let result = await this.runnerRepository.manager.query(
      `EXEC procGetRunnerDashboardWorldReach @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`,
      [options.fromDate, options.toDate, options.countryId],
    );
    return result;
  }

  async getDashboradMostCommonHorseColoursData(
    options: DashboardOptionalCountryDto,
  ) {
    let result = await this.runnerRepository.manager.query(
      `EXEC procGetRunnerDashboardMostCommonHorseColours @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`,
      [options.fromDate, options.toDate, options.countryId],
    );
    return result;
  }

  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case RUNNERDASHBOARDKPI.TOTAL_RUNNERS:
        qbQuery = `EXEC procGetRunnerDashboardTotalRunnerDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.TOTAL_STAKE_RUNNERS:
        qbQuery = `EXEC procGetRunnerDashboardTotalStakeRunnersDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.TOTAL_NON_STAKE_WINNERS:
        qbQuery = `EXEC procGetRunnerDashboardTotalNonStakeWinnersDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.TOTAL_STAKE_WINNERS:
        qbQuery = `EXEC procGetRunnerDashboardTotalStakeWinnersDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.BEST_SIRE:
        qbQuery = `EXEC procGetRunnerDashboardBestSireDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.BEST_BROODMARE_SIRE:
        qbQuery = `EXEC procGetRunnerDashboardBestBroodMareSireDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.COMMON_SW_ANCESTOR:
        qbQuery = `EXEC procGetRunnerDashboardCommonSWAncestorDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.COMMON_WNR_ANCESTOR:
        qbQuery = `EXEC procGetRunnerDashboardCommonWnrAncestorDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.BEST_SIRE_BROODMARE_SIRE:
        qbQuery = `EXEC procGetRunnerDashboardBestSireBroodMareSireCrossDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.BEST_GRAND_SIRE_BROODMARE_SIRE:
        qbQuery = `EXEC procGetRunnerDashboardBestGrandSireBroodMareSireCrossDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.BEST_2X_INBRED_ANCESTOR:
        qbQuery = `EXEC procGetRunnerDashboardBest2xInbredAncestorDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.BEST_3XPLUS_INBRED_ANCESTOR:
        qbQuery = `EXEC procGetRunnerDashboardBest3xplusInbredAncestorDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.MOST_COMMON_COLOURS_RNRS:
        qbQuery = `EXEC procGetRunnerDashboardMostCommonHorseColoursDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.COMMON_SW_COLOUR:
        qbQuery = `EXEC procGetRunnerDashboardCommonSWColourDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.COMMON_WINNER_COLOUR:
        qbQuery = `EXEC procGetRunnerDashboardCommonWinnerColourDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.SW_SEX_DISTRIBUTION:
        qbQuery = `EXEC procGetRunnerDashboardSWSexDistributionDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.WINNER_SEX_DISTRIBUTION:
        qbQuery = `EXEC procGetRunnerDashboardWinnerSexDistributionDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.SW_AVG_AGE:
        qbQuery = `EXEC procGetRunnerDashboardSWAvgAgeDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.WINNER_AVG_AGE:
        qbQuery = `EXEC procGetRunnerDashboardWinnerAvgAgeDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RUNNERDASHBOARDKPI.ACCURACY_RATING_POOR:
        qbQuery = `EXEC procGetRunnerDashboardTotalRunnersByAccuracyRatingDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2, @pAccuracyRating='Poor'`;
        break;
      case RUNNERDASHBOARDKPI.ACCURACY_RATING_GOOD:
        qbQuery = `EXEC procGetRunnerDashboardTotalRunnersByAccuracyRatingDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2, @pAccuracyRating='Good'`;
        break;
      case RUNNERDASHBOARDKPI.ACCURACY_RATING_EXCELLENT:
        qbQuery = `EXEC procGetRunnerDashboardTotalRunnersByAccuracyRatingDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2, @pAccuracyRating='Excellent'`;
        break;
      case RUNNERDASHBOARDKPI.ACCURACY_RATING_OUTSTANDING:
        qbQuery = `EXEC procGetRunnerDashboardTotalRunnersByAccuracyRatingDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2, @pAccuracyRating='Outstanding'`;
        break;
    }
    if (qbQuery == '') {
      throw new NotFoundException('No Data Exist');
    }
    let result = await this.runnerRepository.manager.query(`${qbQuery}`, [
      options.fromDate,
      options.toDate,
      options.countryId,
    ]);
    if (result.length) {
      let headerList = [];
      let headersData = Object.keys(result[0]);
      await headersData.reduce(async (promise, item) => {
        await promise;
        item;
        let itemObj = {
          header: item,
          key: item, //item.replace(/[^A-Z0-9]+/ig, "_"),
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
  /* Get Horse Rating */
  async findRating(id) {
    try {
      const record = await getRepository(Horse).findOneOrFail({
        horseUuid: id,
      });
      const results = await this.runnerRepository.query(
        `exec procGetAccuracyRatingByHorseId ` + record.id,
      );
      return results;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }
  /* Export Runner List */
  async download(searchOptions: SearchOptionsDownloadDto) {
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

    let raceQuery = getRepository(Race)
      .createQueryBuilder('race')
      .select(
        'race.displayName as raceName,race.raceUuid as raceuuid, race.id as raceId,race.raceDate as raceDate,race.venueId as venueId',
      )
      .addSelect('raceclasses.displayName as class')
      .addSelect('venues.displayName as venue ')
      .addSelect(
        'racestakes.displayName as stakes,racestakes.id as racestakesId',
      )
      .leftJoin('race.raceclasses', 'raceclasses')
      .leftJoin('race.venues', 'venues')
      .leftJoin('race.racestakes', 'racestakes');

    const queryBuilder = this.runnerRepository
      .createQueryBuilder('runner')
      .select(
        'runner.runnerUuid as runnerUuid,race.raceUuid as raceUuid,race.raceId as raceId,race.raceName as raceName,race.raceDate as raceDate ,runner.createdOn as createdOn,horses.horseUuid as horseId,runner.isEligible as isEligible,runner.barrier as barrier,runner.number as number,runner.prizeMoneyWon as prizeMoneyWon,runner.margin as margin, runner.weight as weight',
      )
      .addSelect('race.venue as venue')
      .addSelect('race.class as class')
      .addSelect('race.stakes as stakes')
      .addSelect(
        'horses.horseName as horseName, horses.countryId as country,horses.yob as yob,horses.horseTypeId as horseTypeId',
      )
      .addSelect(
        'sire.sireId ,sire.sireName,sire.sireCountryCode,sire.sireYob ',
      )
      .addSelect('dam.damId ,dam.damName, dam.damCountryCode,dam.damYob')
      .addSelect('positions.displayName as position')
      .addSelect('nationality.countryCode as countryCode')
      .addSelect('weightUnit.weightUnitName as weightUnit')
      .addSelect('silksColors.displayName as silksColor')

      .leftJoin('runner.positions', 'positions')
      .innerJoin('runner.horses', 'horses')
      .leftJoin('horses.nationality', 'nationality')
      .leftJoin('runner.weightUnits', 'weightUnit')
      .leftJoin('runner.silksColors', 'silksColors')
      .leftJoin(
        '(' + raceQuery.getQuery() + ')',
        'race',
        'race.raceId=runner.raceId',
      )
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horses.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horses.damId',
      );

    if (searchOptions.name) {
      if (searchOptions.isNameExactSearch) {
        queryBuilder.andWhere('horses.horseName =:horseName', {
          horseName: searchOptions.name,
        });
      } else {
        queryBuilder.andWhere('horses.horseName like :horseName', {
          horseName: '%' + searchOptions.name + '%',
        });
      }
    }

    if (searchOptions.countryId) {
      queryBuilder.andWhere('horses.countryId = :countryId', {
        countryId: searchOptions.countryId,
      });
    }
    if (searchOptions.venue) {
      queryBuilder.andWhere('race.venue like :venue', {
        venue: '%' + searchOptions.venue + '%',
      });
    }
    if (searchOptions.raceId) {
      queryBuilder.andWhere('race.raceUuid = :raceId', {
        raceId: searchOptions.raceId,
      });
    }
    if (searchOptions.class) {
      queryBuilder.andWhere('race.class = :class', {
        class: searchOptions.class,
      });
    }

    if (searchOptions.stakes) {
      let stakes = searchOptions.stakes.split(',');
      let stakesList = stakes.map((res) => parseInt(res));
      queryBuilder.andWhere('race.racestakesId IN (:...racestakesId)', {
        racestakesId: stakesList,
      });
    }
    if (searchOptions.breed) {
      queryBuilder.andWhere('horses.horseTypeId = :horseTypeId', {
        horseTypeId: searchOptions.breed,
      });
    }
    if (searchOptions.sire) {
      if (searchOptions.isSireExactSearch) {
        queryBuilder.andWhere('sire.sireName = :sire', {
          sire: searchOptions.sire,
        });
      } else {
        queryBuilder.andWhere('sire.sireName like :sire', {
          sire: '%' + searchOptions.sire + '%',
        });
      }
    }
    if (searchOptions.dam) {
      if (searchOptions.isDamExactSearch) {
        queryBuilder.andWhere('dam.damName = :dam', { dam: searchOptions.dam });
      } else {
        queryBuilder.andWhere('dam.damName like :dam', {
          dam: '%' + searchOptions.dam + '%',
        });
      }
    }
    if (searchOptions.position) {
      let position = searchOptions.position.split(',');
      let positionList = position.map((res) => parseInt(res));
      queryBuilder.andWhere('runner.finalPositionId IN (:...finalPositionId)', {
        finalPositionId: positionList,
      });
    }

    if (searchOptions.age) {
      const year = new Date().getFullYear();
      queryBuilder.andWhere(year + '-Horses.yob=' + searchOptions.age);
    }

    if (searchOptions.date) {
      const dateRange = searchOptions.date;
      let dateList = dateRange.split('/');
      if (dateList.length === 2) {
        var minDate = dateList[0];
        var maxDate = dateList[1];
      }
      queryBuilder.andWhere(
        'race.raceDate  >= CONVERT(date, :minDate) AND race.raceDate <= CONVERT(date, :maxDate)',
        {
          minDate,
          maxDate,
        },
      );
    }
    if (searchOptions.prizeMoney) {
      const prizeMoney = searchOptions.prizeMoney;
      let prizeList = prizeMoney.split('-');
      if (prizeList.length === 2) {
        let minPrice = prizeList[0];
        let maxPrice = prizeList[1];
        queryBuilder.andWhere(
          'runner.prizeMoneyWon >= :minPrice AND runner.prizeMoneyWon <= :maxPrice',
          {
            minPrice,
            maxPrice,
          },
        );
      }
    }

    queryBuilder;
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  async getDashboradAccuracyRatingData(options: AccuracyRatingDashboardDto) {
    let result = await this.runnerRepository.manager.query(
      `EXEC procGetRunnerDashboardTotalRunnersByAccuracyRating 
        @paramDate1=@0, @paramDate2=@1, @pCountryId=@2, @pAccuracyRating=@3`,
      [
        options.fromDate,
        options.toDate,
        options.countryId,
        options.accuracyType,
      ],
    );
    let data = {};
    await result.map((record: any) => {
      let diffPercent = 0;
      if (record.PrevValue) {
        diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
      } else {
        diffPercent = Math.round(record.Diff / 0.01);
      }
      data = {
        ...record,
        diffPercent: diffPercent,
      };
    });
    return data;
  }
}
