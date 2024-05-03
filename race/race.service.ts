import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ExcelService } from 'src/excel/excel.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { RunnerService } from 'src/runner/runner.service';
import { RACEDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { getRepository, Like, Repository, UpdateResult } from 'typeorm';
import { CreateRaceDto } from './dto/create-race.dto';
import { DashboardExcessDto } from './dto/dashboard-excess.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { SearchByNameDto } from './dto/search-by-name.dto';
import { SearchOptionsDownloadDto } from './dto/search-option-download.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { EligibiltyDto } from './dto/update-eligibility.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { Race } from './entities/race.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
export class RaceService {
  constructor(
    @Inject(forwardRef(() => RunnerService))
    private runnerService: RunnerService,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Race)
    private raceRepository: Repository<Race>,
    private excelService: ExcelService,
    private readonly commonUtilsService: CommonUtilsService,
    private eventEmitter: EventEmitter2,
  ) { }

  /* 'Get Race List */
  async findAll(searchOptions: SearchOptionsDto): Promise<PageDto<Race>> {
    let scntQuery = getRepository(Race)
      .createQueryBuilder('race')
      .select('race.id as id, count(runners.id) totalRunner')
      .leftJoin('race.runners', 'runners')
      .groupBy('race.id');

    const queryBuilder = this.raceRepository
      .createQueryBuilder('race')
      .select(
        'race.id as raceId,race.raceUuid, race.raceDate,race.displayName as raceName, race.isEligible,race.racenumber ',
      )
      .addSelect('venues.displayName as venue')
      .addSelect('country.countryCode as countryCode')
      .addSelect('raceclasses.displayName as class')
      .addSelect('tracktypes.displayName as trackType')
      .addSelect('racestatuses.displayName as racestatus')
      .addSelect('scnt.totalRunner')
      .leftJoin('race.raceclasses', 'raceclasses')
      .leftJoin('race.venues', 'venues')
      .leftJoin('race.racestakes', 'racestakes')
      .leftJoin('race.racestatuses', 'racestatuses')
      .leftJoin('race.tracktypes', 'tracktypes')
      .leftJoin('race.trackconditions', 'trackconditions')
      .leftJoin('race.racetypes', 'racetypes')
      .leftJoin('venues.country', 'country')
      .leftJoin('(' + scntQuery.getQuery() + ')', 'scnt', 'scnt.id=race.id');

    if (searchOptions.displayName) {
      if (searchOptions.isDisplayNameExactSearch) {
        queryBuilder.andWhere('race.displayName =:displayName', {
          displayName: searchOptions.displayName,
        });
      } else {
        queryBuilder.andWhere('race.displayName like :displayName', {
          displayName: '%' + searchOptions.displayName + '%',
        });
      }
    }
    if (searchOptions.raceId) {
      queryBuilder.andWhere('race.raceUuid =:raceUuid', {
        raceUuid: searchOptions.raceId,
      });
    }
    if (searchOptions.countryId) {
      let countryId = searchOptions.countryId.split(',');
      let countryList = countryId.map((res) => parseInt(res));
      queryBuilder.andWhere('venues.countryId IN (:...countryId)', {
        countryId: countryList,
      });
    }
    if (searchOptions.venue) {
      queryBuilder.andWhere('race.venueId = :venueId', {
        venueId: searchOptions.venue,
      });
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
    if (searchOptions.class) {
      queryBuilder.andWhere('race.raceClassId = :raceClassId', {
        raceClassId: searchOptions.class,
      });
    }
    if (searchOptions.trackType) {
      queryBuilder.andWhere('race.trackTypeId = :trackTypeId', {
        trackTypeId: searchOptions.trackType,
      });
    }
    if (searchOptions.status) {
      queryBuilder.andWhere('race.raceStatusId = :raceStatusId', {
        raceStatusId: searchOptions.status,
      });
    }
    if (searchOptions.trackCondition) {
      queryBuilder.andWhere('race.trackConditionId= :trackConditionId', {
        trackConditionId: searchOptions.trackCondition,
      });
    }
    if (searchOptions.isEligible && searchOptions.isEligible != 'All') {
      if (searchOptions.isEligible === 'Eligible') {
        queryBuilder.andWhere('race.isEligible = :Eligible', { Eligible: 1 });
      } else if (searchOptions.isEligible === 'Ineligible') {
        queryBuilder.andWhere('race.isEligible = :Eligible', { Eligible: 0 });
      }
    }
    if (searchOptions.distanceRange) {
      const distanceRange = searchOptions.distanceRange;
      let distanceList = distanceRange.split('-');
      if (distanceList.length === 2) {
        let minDistance = distanceList[0];
        let maxDistance = distanceList[1];
        if (searchOptions.includeEmptyField) {
          queryBuilder.andWhere(
            '((CASE WHEN race.distanceUnitId = 1 THEN "race"."raceDistance" * 201.168 ELSE "race"."raceDistance" END) BETWEEN :minDistance AND :maxDistance) OR (race.raceDistance=0)',
            {
              minDistance,
              maxDistance,
            },
          );
        } else {
          queryBuilder.andWhere(
            '((CASE WHEN race.distanceUnitId = 1 THEN "race"."raceDistance" * 201.168 ELSE "race"."raceDistance" END) BETWEEN :minDistance AND :maxDistance)',
            {
              minDistance,
              maxDistance,
            },
          );
        }
      }
    }
    if (searchOptions.fieldSize) {
      const fieldSize = searchOptions.fieldSize;
      let fieldsize = fieldSize.split('-');
      if (fieldsize.length === 2) {
        let minField = fieldsize[0];
        let maxField = fieldsize[1];
        if (searchOptions.includeEmptyFieldSize) {
          queryBuilder.andWhere(
            'scnt.totalRunner >= :minField AND scnt.totalRunner <= :maxField  OR scnt.totalRunner=0',
            {
              minField,
              maxField,
            },
          );
        } else {
          queryBuilder.andWhere(
            'scnt.totalRunner >= :minField AND scnt.totalRunner <= :maxField',
            {
              minField,
              maxField,
            },
          );
        }
      }
    }
    if (searchOptions.includeEmptyField && !searchOptions.distanceRange) {
      queryBuilder.andWhere(
        'race.raceDistance=0',

      );
    }
    if (searchOptions.includeEmptyFieldSize && !searchOptions.fieldSize) {
      queryBuilder.andWhere(
        'scnt.totalRunner=0',
      );
    }
    if (searchOptions.horseId) {
      const horse = await getRepository(Horse).findOne({
        horseUuid: searchOptions.horseId,
      });
      queryBuilder
        .innerJoin('race.runners', 'runner')
        .andWhere('runner.horseId = :horseId', { horseId: horse.id });
      if (searchOptions.winner === 'yes') {
        queryBuilder.andWhere('runner.finalPositionId = :finalPositionId', {
          finalPositionId: 1,
        });
      }
      if (searchOptions.stakes === 'yes') {
        queryBuilder
          .andWhere('race.racestakeId IN (:...racestakeId)', {
            racestakeId: [2, 3, 4, 5],
          })
          .andWhere('runner.finalPositionId = :finalPositionId', {
            finalPositionId: 1,
          });
      }
    }
    if (searchOptions.racetype) {
      queryBuilder.andWhere('race.raceTypeId = :raceTypeId', {
        raceTypeId: searchOptions.racetype,
      });
    }

    const sortBy = searchOptions.sortBy;
    const byOrder = searchOptions.order;
    if (searchOptions.sortBy) {
      if (sortBy.toLowerCase() === 'class') {
        queryBuilder.orderBy('raceclasses.displayName', byOrder);
      }
      if (sortBy.toLowerCase() === 'country') {
        queryBuilder.orderBy('country.countryName', byOrder);
      }
      if (sortBy.toLowerCase() === 'displayname') {
        queryBuilder.orderBy('race.displayName', byOrder);
      }
      if (sortBy.toLowerCase() === 'trackcondition') {
        queryBuilder.orderBy('trackconditions.displayName', byOrder);
      }
      if (sortBy.toLowerCase() === 'tracktype') {
        queryBuilder.orderBy('tracktypes.displayName', byOrder);
      }
      if (sortBy.toLowerCase() === 'status') {
        queryBuilder.orderBy('racestatuses.displayName', byOrder);
      }
      if (sortBy.toLowerCase() === 'venue') {
        queryBuilder.orderBy('venues.displayName', byOrder);
      }
      if (sortBy.toLowerCase() === 'racestake') {
        queryBuilder.orderBy('racestakes.displayName', byOrder);
      }
      if (sortBy.toLowerCase() === 'id') {
        queryBuilder.orderBy('race.raceNumber', byOrder);
      }
      if (sortBy.toLowerCase() === 'racedate') {
        queryBuilder.orderBy('race.raceDate', byOrder);
      }
      if (sortBy.toLowerCase() === 'runner') {
        queryBuilder.orderBy('totalRunner', byOrder);
      }
      if (sortBy.toLowerCase() === 'eligible') {
        queryBuilder.orderBy('race.isEligible', byOrder);
      }

    } else {
      queryBuilder.orderBy('race.raceNumber', byOrder);
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
  /* Get Race Details */
  async findOne(id: string) {
    let scntQuery = getRepository(Race)
      .createQueryBuilder('race')
      .select('race.id, count(runners.id) totalRunner')
      .innerJoin('race.runners', 'runners')
      .groupBy('race.id');

    let queryBuilder = getRepository(Race)
      .createQueryBuilder('race')
      .select(
        'race.id as raceId,race.raceUuid,race.raceNumber,race.sourceId,race.venueId,race.trackTypeId,race.displayName as raceName, race.raceDate as raceDate,race.raceTime ,race.raceClassId ,race.raceStakeId ,race.raceDistance as raceDistance, race.distanceUnitId ,race.raceAgeRestrictionId,race.isEligible,race.racePrizemoney, race.raceSexRestrictionId ,race.currencyId,race.raceTypeId ,race.raceWeatherId,race.raceStatusId,race.trackConditionId,member.fullName as createdBy,members.fullName as modifiedBy,race.modifiedOn,race.createdOn as createdOn',
      )
      .addSelect('venues.countryId,venues.stateId,venues.displayName as venue')
      .addSelect('scnt.totalRunner as totalRunner')
      .leftJoin('race.venues', 'venues')
      .leftJoin('race.member', 'member')
      .leftJoin('race.members', 'members')
      .leftJoin('(' + scntQuery.getQuery() + ')', 'scnt', 'scnt.id=race.id')
      .andWhere('race.raceUuid = :raceUuid', { raceUuid: id });
    const entities = await queryBuilder.getRawOne();
    return entities;
  }
  /* Create Race */
  async create(createRaceDto: CreateRaceDto) {
    const member = this.request.user;
    createRaceDto.createdBy = member['id'];

    const raceResponse = await this.raceRepository.save(
      this.raceRepository.create(createRaceDto),
    );
    return {
      ...raceResponse,
      statusCode: HttpStatus.OK,
      message: 'Race Created successfully',
    };
  }

  /* Update Race Details */
  async update(id: string, updateRaceDto: UpdateRaceDto) {
    const member = this.request.user
    const raceToUpdate = await this.findRaceByIdWithAllFields(id)
    Object.keys(updateRaceDto).forEach((key) => {
      if (raceToUpdate.hasOwnProperty(key) && raceToUpdate[key] !== updateRaceDto[key]) {
        //    raceToUpdate[key] = updateRaceDto[key];
        this.eventEmitter.emit('updateRaceDetailsActivity', {
          key: key,
          oldValue: raceToUpdate[key],
          newValue: updateRaceDto[key]
        });
      }
    });

    updateRaceDto.modifiedBy = member['id'];
    updateRaceDto.modifiedOn = new Date()
    const updateResponse = await this.raceRepository.update(
      { raceUuid: id },
      updateRaceDto,
    );
    return {
      ...updateResponse,
      statusCode: HttpStatus.OK,
      message: 'Race updated successfully',
    };
  }
  async findRaceByIdWithAllFields(id: string): Promise<Race> {
    return await this.raceRepository
      .createQueryBuilder('race')
      .select([
        'race.raceDate',
        'race.raceTime',
        'race.trackTypeId',
        'race.raceStatusId',
        'race.raceDistance',
        'race.trackConditionId',
        'race.distanceUnitId',
        'race.raceStakeId',
        'race.raceAgeRestrictionId',
        'race.raceSexRestrictionId',
        'race.racePrizemoney',
        'race.venueId',
        'race.raceClassId',
        'race.raceTypeId',
        'race.isEligible',
        'race.currencyId',
        'race.raceNumber',
        'race.displayName',
      ])
      .where('race.raceUuid = :id', { id })
      .getOne();
  }
  /* Get Race Details By Id*/
  async findRaceUuid(id) {
    const record = await this.raceRepository.findOne({
      raceUuid: id,
    });
    if (!record) {
      throw new UnprocessableEntityException('Race not exist!');
    }
    return record;
  }
  /* Search with RaceName */
  async findAllByName(displayName: string, searchByNameDto: SearchByNameDto) {
    return await this.raceRepository.find({
      where: {
        displayName: searchByNameDto?.isDisplayNameExactSearch
          ? displayName
          : Like(`%${displayName}%`),
      },
      take: 20,
    });
  }

  /* Get Brief Race Details with RaceName */
  async findByRaceName(displayName: string, searchByNameDto: SearchByNameDto) {
    return await this.raceRepository.find({
      select: ['displayName', 'raceUuid', 'id', 'isEligible'],
      where: {
        displayName: searchByNameDto?.isDisplayNameExactSearch
          ? displayName
          : Like(`%${displayName}%`),
      },
      take: 20,
    });
  }
  /* Update Race eligibility */
  async updateEligibility(raceId: string, eligibiltyDto: EligibiltyDto) {
    const member = this.request.user;
    const raceToUpdate = await this.findRaceByIdWithAllFields(raceId)
    Object.keys(eligibiltyDto).forEach((key) => {
      if (raceToUpdate.hasOwnProperty(key) && raceToUpdate[key] !== eligibiltyDto[key]) {
        if (key == 'isEligible') {
          this.eventEmitter.emit('updateRaceDetailsActivity', {
            key: key,
            oldValue: raceToUpdate[key],
            newValue: eligibiltyDto[key]
          });
        }
      }
    });
    eligibiltyDto.modifiedBy = member['id'];
    const updateResult: UpdateResult = await this.raceRepository.update(
      { raceUuid: raceId },
      eligibiltyDto,
    );
    if (updateResult.affected > 0) {
      await this.runnerService.updateRace(raceId, eligibiltyDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Runners in race updated successfully',
      };
    }
  }
  /* Get Dashboard Data */
  async getRaceDashboardData(options: DashboardDto) {
    let result = await this.raceRepository.manager.query(
      `EXEC procGetRaceDashboard_new @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`,
      [options.fromDate, options.toDate, options.countryId],
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
  /* Get Dashboard Report */
  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case RACEDASHBOARDKPI.TOTAL_RACES:
        qbQuery = `EXEC procGetRaceDashboardTotalRaceDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.TOTAL_STAKE_RACES:
        qbQuery = `EXEC procGetRaceDashboardTotalStakesRaceDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.COUNTRIES:
        qbQuery = `EXEC procGetRaceDashboardCountriesDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.COUNTRY_BLACKLIST:
        qbQuery = `EXEC procGetRaceDashboardCountryBlacklistDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.TOTAL_TURF_RACES:
        qbQuery = `EXEC procGetRaceDashboardTotalTurfRacesDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.TOTAL_DIRT_RACES:
        qbQuery = `EXEC procGetRaceDashboardTotalDirtRacesDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.TOTAL_SYNTHETIC_RACES:
        qbQuery = `EXEC procGetRaceDashboardTotalSyntheticRacesDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.TOTAL_UNKNOWN_TRACK_TYPE:
        qbQuery = `EXEC procGetRaceDashboardTotalUnknownRacesDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.AVG_DISTANCE_GRAPH:
        qbQuery = `EXEC procGetRaceDashboardAverageDistanceGraphDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.MOST_VALUABLE_RACES:
        qbQuery = `EXEC procGetRaceDashboardMostValuableRacesDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.AVG_PRIZEMONEY:
        qbQuery = `EXEC procGetRaceDashboardAveragePrizeMoneyDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.MOST_RACES:
        qbQuery = `EXEC procGetRaceDashboardMostRacesCountryDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.MOST_COMMON_TRACK_CONDITION:
        qbQuery = `EXEC procGetRaceDashboardMostCommonTrackConditionDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.MOST_POPULAR_JOCKEY:
        qbQuery = `EXEC procGetRaceDashboardMostPopularJockeyDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.MOST_SUCCESSFUL_JOCKEY:
        qbQuery = `EXEC procGetRaceDashboardMostSuccessfulJockeyDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.MOST_SUCCESSFUL_TRAINER:
        qbQuery = `EXEC procGetRaceDashboardMostSuccessfulTrainerDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
      case RACEDASHBOARDKPI.TOP_PRIZEMONEY_VENUE:
        qbQuery = `EXEC procGetRaceDashboardTopPrizeMoneyVenueDownload @paramDate1=@0, @paramDate2=@1, @pCountryId=@2`;
        break;
    }
    if (qbQuery == '') {
      throw new NotFoundException('No Data Exist');
    }
    let result = await this.raceRepository.manager.query(`${qbQuery}`, [
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

  /*Get Dashboard - Most Valuable Races*/
  async getMostValuableRaces(options: DashboardExcessDto) {
    let result = await this.raceRepository.manager.query(
      `EXEC procGetRaceDashboardMostValuableRaces 
      @paramDate1=@0, 
      @paramDate2=@1, 
      @pCountryId=@2`,
      [options.fromDate, options.toDate, options.countryId],
    );
    let finalData = result.slice(0, 6);
    return finalData;
  }

  /*Get Dashboard - Top Prizemoney(Venue)*/
  async getTopPrizemoneyByVenue(options: DashboardExcessDto) {
    let result = await this.raceRepository.manager.query(
      `EXEC procGetRaceDashboardTopPrizeMoneyVenue 
      @paramDate1=@0, 
      @paramDate2=@1, 
      @pCountryId=@2`,
      [options.fromDate, options.toDate, options.countryId],
    );
    let finalData = result.slice(0, 6);
    return finalData;
  }

  /*Get Dashboard - WorldReach*/
  async getWorldReach(options: DashboardExcessDto) {
    let result = await this.raceRepository.manager.query(
      `EXEC procGetRaceDashboardWorldReach 
      @paramDate1=@0, 
      @paramDate2=@1, 
      @pCountryId=@2`,
      [options.fromDate, options.toDate, options.countryId],
    );
    await result.map(async (item) => {
      item.location = [item.latitude, item.longitude];
      return item;
    });
    return result;
  }

  /*Get Dashboard - AverageDistanceGraph*/
  async getAverageDistanceGraph(options: DashboardDto) {
    let result = await this.raceRepository.manager.query(
      `EXEC procGetRaceDashboardAverageDistanceGraph 
      @fromDate=@0, 
      @toDate=@1, 
      @pCountryId=@2`,
      [options.fromDate, options.toDate, options.countryId],
    );
    let currentTotal = 0;
    let previousTotal = 0;
    let finalResult = [];
    let rangeFrom = null;
    let rangeTo = null;
    await result.map(async (item, index) => {
      currentTotal = currentTotal + item.currRegRate;
      previousTotal = previousTotal + item.prevRegRate;
      switch (item.interval) {
        case 'DAY':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getDayFromDate(
              item.currdayDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getDayFromDate(item.currdayDate);
          }
          finalResult.push({
            label: this.commonUtilsService.getDayFromDate(item.currdayDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'WEEK':
          if (index === 0) {
            rangeFrom = `Week ${item.currWeekNumber}`;
          }
          if (index === result.length - 1) {
            rangeTo = `Week ${item.currWeekNumber}`;
          }
          finalResult.push({
            label: `Week ${item.currWeekNumber}`,
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'MONTH':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getMonthFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'YEAR':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getYearFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
      }
    });
    return {
      currentTotal,
      previousTotal,
      rangeFrom,
      rangeTo,
      result: finalResult,
    };
  }
  /* Export Race List*/
  async download(searchOptions: SearchOptionsDownloadDto) {
    let scntQuery = getRepository(Race)
      .createQueryBuilder('race')
      .select('race.id as id, count(runners.id) totalRunner')
      .innerJoin('race.runners', 'runners')
      .groupBy('race.id');

    const queryBuilder = this.raceRepository
      .createQueryBuilder('race')
      .select(
        'race.raceNumber as race#, race.raceDate as raceId,race.displayName as name, race.isEligible as eligible',
      )
      .addSelect('venues.displayName as venue')
      .addSelect('country.countryCode as country')
      .addSelect('raceclasses.displayName as class')
      .addSelect('tracktypes.displayName as trackType')
      .addSelect('racestatuses.displayName as racestatus')
      .addSelect('scnt.totalRunner as runners')
      .leftJoin('race.raceclasses', 'raceclasses')
      .leftJoin('race.venues', 'venues')
      .leftJoin('race.racestakes', 'racestakes')
      .leftJoin('race.racestatuses', 'racestatuses')
      .leftJoin('race.tracktypes', 'tracktypes')
      .leftJoin('race.trackconditions', 'trackconditions')
      .leftJoin('race.racetypes', 'racetypes')
      .leftJoin('venues.country', 'country')
      .leftJoin('(' + scntQuery.getQuery() + ')', 'scnt', 'scnt.id=race.id');

    if (searchOptions.displayName) {
      if (searchOptions.isDisplayNameExactSearch) {
        queryBuilder.andWhere('race.displayName =:displayName', {
          displayName: searchOptions.displayName,
        });
      } else {
        queryBuilder.andWhere('race.displayName like :displayName', {
          displayName: '%' + searchOptions.displayName + '%',
        });
      }
    }
    if (searchOptions.countryId) {
      let countryId = searchOptions.countryId.split(',');
      let countryList = countryId.map((res) => parseInt(res));
      queryBuilder.andWhere('venues.countryId IN (:...countryId)', {
        countryId: countryList,
      });
    }
    if (searchOptions.venue) {
      queryBuilder.andWhere('race.venueId = :venueId', {
        venueId: searchOptions.venue,
      });
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
    if (searchOptions.class) {
      queryBuilder.andWhere('race.raceClassId = :raceClassId', {
        raceClassId: searchOptions.class,
      });
    }
    if (searchOptions.trackType) {
      queryBuilder.andWhere('race.trackTypeId = :trackTypeId', {
        trackTypeId: searchOptions.trackType,
      });
    }
    if (searchOptions.status) {
      queryBuilder.andWhere('race.raceStatusId = :raceStatusId', {
        raceStatusId: searchOptions.status,
      });
    }
    if (searchOptions.trackCondition) {
      queryBuilder.andWhere('race.trackConditionId= :trackConditionId', {
        trackConditionId: searchOptions.trackCondition,
      });
    }
    if (searchOptions.isEligible && searchOptions.isEligible != 'All') {
      if (searchOptions.isEligible === 'Eligible') {
        queryBuilder.andWhere('race.isEligible = :Eligible', { Eligible: 1 });
      } else if (searchOptions.isEligible === 'Ineligible') {
        queryBuilder.andWhere('race.isEligible = :Eligible', { Eligible: 0 });
      }
    }
    if (searchOptions.distanceRange) {
      const distanceRange = searchOptions.distanceRange;
      let distanceList = distanceRange.split('-');
      if (distanceList.length === 2) {
        let minPrice = distanceList[0];
        let maxPrice = distanceList[1];
        if (searchOptions.includeEmptyField) {
          queryBuilder.andWhere(
            'race.raceDistance >= :minPrice AND race.raceDistance <= :maxPrice OR race.raceDistance=0',
            {
              minPrice,
              maxPrice,
            },
          );
        } else {
          queryBuilder.andWhere(
            'race.raceDistance >= :minPrice AND race.raceDistance <= :maxPrice',
            {
              minPrice,
              maxPrice,
            },
          );
        }
      }
    }
    if (searchOptions.fieldSize) {
      const fieldSize = searchOptions.fieldSize;
      let fieldsize = fieldSize.split('-');
      if (fieldsize.length === 2) {
        let minPrice = fieldsize[0];
        let maxPrice = fieldsize[1];
        if (searchOptions.includeEmptyFieldSize) {
          queryBuilder.andWhere(
            'scnt.totalRunner >= :minPrice AND scnt.totalRunner <= :maxPrice  OR scnt.totalRunner=0',
            {
              minPrice,
              maxPrice,
            },
          );
        } else {
          queryBuilder.andWhere(
            'scnt.totalRunner >= :minPrice AND scnt.totalRunner <= :maxPrice',
            {
              minPrice,
              maxPrice,
            },
          );
        }
      }
    }
    const byOrder = searchOptions.order;
    queryBuilder.orderBy('race.raceNumber', byOrder);
    const entities = await queryBuilder.getRawMany();
    return entities;
  }
}
