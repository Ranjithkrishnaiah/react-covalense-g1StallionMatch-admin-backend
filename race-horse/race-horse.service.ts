import {
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
import { ExcelService } from 'src/excel/excel.service';
import { HorsesService } from 'src/horses/horses.service';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Repository } from 'typeorm';
import { CreateRaceHorseDto } from './dto/create-race-horse.dto';
import { RunnerHorseNameSearchDto } from './dto/runner-horse-name-search.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateRaceHorseUrlDto } from './dto/update-race-horse-url.dto';
import { RaceHorse } from './entities/race-horse.entity';

@Injectable({ scope: Scope.REQUEST })
export class RaceHorseService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceHorse)
    private raceHorseRepository: Repository<RaceHorse>,
    private horseService: HorsesService,
    private excelService: ExcelService,
    private configService: ConfigService,
  ) {}

  //Get all race horses list
  async findAll(pageOptionsDto: SearchOptionsDto) {
    const finalData = await this.raceHorseRepository.manager.query(
      `EXEC procGetSMPAdminPortalRaceHorses 
      @IsPagination=@0, @PageNumber=@1, @RowsOfPage=@2, @psortBy=@3, @psortOrder=@4`,
      [
        1,
        pageOptionsDto.page,
        pageOptionsDto.limit,
        pageOptionsDto.orderColumn,
        pageOptionsDto.order,
      ],
    );
    let totalRecCnt = 0;
    if (finalData && finalData.length > 0)
      totalRecCnt = finalData[0].totalCount;
    const pageMetaDto = new PageMetaDto({
      itemCount: totalRecCnt,
      pageOptionsDto: pageOptionsDto,
    });
    return new PageDto(finalData, pageMetaDto);
  }

  //Create a Race Horse Record
  async create(createHorseDto: CreateRaceHorseDto) {
    const member = this.request.user;
    const { horseId } = createHorseDto;
    const horse = await this.horseService.findHorsesByUuid(horseId);
    await this.isRaceHorseExist(horse.id);
    const createDto = {
      horseId: horse.id,
      raceHorseUrl: horse.horseName,
      isActive: true,
      createdBy: member['id'],
    };

    const raceHorseResponse = await this.raceHorseRepository.save(
      this.raceHorseRepository.create(createDto),
    );
    return raceHorseResponse;
  }

  //Check is Race Horse Exist
  async isRaceHorseExist(horseId) {
    const record = await this.raceHorseRepository.findOne({
      horseId: horseId,
    });
    let raceHorseActiveState = 'Active';
    if (record) {
      if (record.isActive === false) {
        raceHorseActiveState = 'InActive';
      }
      throw new UnprocessableEntityException(
        `Race Horse already exists in ${raceHorseActiveState} State!`,
      );
    }
  }

  /* Get Runner Horse By Name */
  async findRunnerHorsesByName(searchOptions: RunnerHorseNameSearchDto) {
    const data = await this.raceHorseRepository.manager.query(
      `EXEC procSearchRunnerHorseByName @raceHorseName=@0`,
      [searchOptions.horseName],
    );

    return data;
  }

  /* Activate/Deactivate Race Horse */
  async activateDeactivateRaceHorse(raceHorseId: string) {
    const member = this.request.user;
    let record = await this.getRaceHorseById(raceHorseId);
    if (record.isActive) {
      record.isActive = false;
    } else {
      record.isActive = true;
    }
    record.modifiedBy = member['id'];
    record.modifiedOn = new Date();
    record.save();
    return record;
  }

  //Check is Race Horse Exist
  async getRaceHorseById(raceHorseId) {
    const record = await this.raceHorseRepository.findOne({
      raceHorseUuid: raceHorseId,
    });
    if (!record) {
      throw new UnprocessableEntityException(`Race Horse not exist!`);
    }
    return record;
  }

  /* Update Race Horse Url */
  async updateUrl(raceHorseId: string, raceHorseDto: UpdateRaceHorseUrlDto) {
    const member = this.request.user;
    let record = await this.getRaceHorseById(raceHorseId);
    record.raceHorseUrl = raceHorseDto.raceHorseUrl;
    record.modifiedBy = member['id'];
    record.modifiedOn = new Date();
    record.save();
    return record;
  }

  async downloadAllDataAsCsv() {
    let qbQuery = `EXEC procGetSMPAdminPortalRaceHorses @IsPagination=@0`;
    let result = await this.raceHorseRepository.manager.query(`${qbQuery}`, [
      0,
    ]);
    let self = this;
    await result.map(async function (item) {
      item.url = `${self.configService.get(
        'app.portalFrontendDomain',
      )}/race-horse${item.url}`;
    });

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
}
