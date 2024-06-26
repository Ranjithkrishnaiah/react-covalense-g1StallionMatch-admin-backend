import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { Repository } from 'typeorm';
import { ReportTemplatesCommonService } from './report-templates-common.service';

@Injectable()
export class ReportBroodmareAffinityService {
  constructor(
    @InjectRepository(Horse)
    readonly horseRepository: Repository<Horse>,
    readonly commonUtilsService: CommonUtilsService,
    readonly fileUploadsService: FileUploadsService,
    readonly rtCommonService: ReportTemplatesCommonService,
    readonly configService: ConfigService,
  ) {}
  /* Get Ancestors Affinity With BroodMare  */
  async getAncestorsAffinityWithBroodMareSummaryList(
    horseId,
    countryId,
    sPositionStrikeRateRanges,
  ) {
    let entities = await this.horseRepository.manager.query(
      `EXEC proc_SMPStallionAncestorAffinityWithBroodMareComponents 
              @pMareid=@0,
              @pCountryId=@1`,
      [horseId, countryId],
    );

    const sSPositionStrikeRateRanges =
      await this.getBroodmareAffinityStrikeRateRanges('SS');
    const dSPositionStrikeRateRanges =
      await this.getBroodmareAffinityStrikeRateRanges('DS');
    const dSSPositionStrikeRateRanges =
      await this.getBroodmareAffinityStrikeRateRanges('DSS');

    entities = entities.filter((e) => e.H1SideHorseid);
    let data = [];
    let tempList = [];
    let tabelTitles = {};
    let newList = [];
    await entities.reduce(async (promise, element, index) => {
      await promise;
      let elementData = Object.entries(element);
      if (index === 0) {
        let hArr = [
          elementData[7][0],
          elementData[8][0],
          elementData[10][0],
          elementData[9][0],
        ];
        let headerData =
          await this.rtCommonService.setSireDamGrandSireGrandDamSire(hArr);
        tabelTitles = {
          column1: 'NAME',
          column2: 'SWS',
          column3: headerData['column3'],
          column4: headerData['column4'],
          column5: headerData['column5'],
          column6: headerData['column6'],
        };
      }
      let item = await this.formateData(
        elementData,
        sPositionStrikeRateRanges,
        sSPositionStrikeRateRanges,
        dSPositionStrikeRateRanges,
        dSSPositionStrikeRateRanges,
      );
      tempList.push(item);
    }, Promise.resolve());

    // sum stakeWinners If there are duplicate H1SideHorseName
    for (const element of tempList) {
      let index = newList.findIndex(
        (item) => item.h1SideHorseid === element.h1SideHorseid,
      );
      if (index == -1) {
        newList.push(element);
      } else {
        if (newList[index].level <= element.level) {
          newList[index].column2 = newList[index].column2 + element.column2;
        } else {
          element.column2 = newList[index].column2 + element.column2;
          newList[index] = element;
        }
        const keys = Object.keys(element);
        for (let key of keys) {
          if (
            element.column3 ||
            element.column4 ||
            element.column5 ||
            element.column6
          ) {
            if (!newList[index][key] && element[key]) {
              newList[index][key] = element[key];
            }
          }
        }
      }
    }
    // Add Children
    for (let element of newList) {
      let children = await this.getChildren(element, newList);
      for (let item of children) {
        let childs = await this.getChildren(item, newList);
        item['children'] = childs;
      }
      element['children'] = children;
    }

    // Sort by commonsortorder
    newList.sort((a, b) => {
      return b.commonsortorder - a.commonsortorder;
    });

    for (let element of newList) {
      let children = JSON.parse(JSON.stringify(element.children));
      delete element.children;
      data.push(element);
      for (let item of children) {
        item['level'] = 2;
        let childs = JSON.parse(JSON.stringify(item['children']));
        delete item['children'];
        data.push(item);
        for (let ch of childs) {
          ch['level'] = 3;
          delete ch['children'];
          data.push(ch);
        }
      }
    }

    return {
      commonAncestorsTabelTitles: tabelTitles,
      commonAncestorsList: data,
    };
  }
  /* Get Broodmare Affinity Strike Rate Ranges */
  async getBroodmareAffinityStrikeRateRanges(position: string) {
    return await this.horseRepository.manager.query(
      `EXEC Proc_SMPGetMareStrikeRateRangeByPosition 
              @pPosition=@0`,
      [position],
    );
  }
  /* Data Format */
  async formateData(
    elementData,
    sPositionStrikeRateRanges,
    sSPositionStrikeRateRanges,
    dSPositionStrikeRateRanges,
    dSSPositionStrikeRateRanges,
  ) {
    const column3 = elementData[9][1] ? elementData[9][1] : 0;
    const column4 = elementData[10][1] ? elementData[10][1] : 0;
    const column5 = elementData[8][1] ? elementData[8][1] : 0;
    const column6 = elementData[7][1] ? elementData[7][1] : 0;
    return {
      column1: await this.commonUtilsService.toTitleCase(elementData[1][1]),
      column2: elementData[6][1] ? elementData[6][1] : 0,
      column3: column3,
      column4: column4,
      column5: column5,
      column6: column6,
      column3Color:
        await this.rtCommonService.getColourForAncestorsAffinityComponents(
          column3,
          sPositionStrikeRateRanges,
        ),
      column4Color:
        await this.rtCommonService.getColourForAncestorsAffinityComponents(
          column4,
          sSPositionStrikeRateRanges,
        ),
      column5Color:
        await this.rtCommonService.getColourForAncestorsAffinityComponents(
          column5,
          dSPositionStrikeRateRanges,
        ),
      column6Color:
        await this.rtCommonService.getColourForAncestorsAffinityComponents(
          column6,
          dSSPositionStrikeRateRanges,
        ),
      h1SideHorseid: elementData[0][1],
      lvl: elementData[2][1],
      level: 1,
      sex: elementData[3][1],
      parent: elementData[4][1],
      commonsortorder: elementData[5][1],
      children: [],
    };
  }
  /* Get Children */
  async getChildren(item, list) {
    let children = list.filter((ch) => {
      return item.h1SideHorseid === ch.parent;
    });
    for (let item of children) {
      let index = list.findIndex((e) => e === item);
      list.splice(index, 1);
    }
    return children;
  }
  /* Get Broodmare Affinity Top Performing Sirelines */
  async getBroodmareAffinityTopperformingsirelines(
    horseId,
    countryId,
    strikeRateRanges,
  ) {
    let sireLinesData = [];
    let result = await this.horseRepository.manager.query(
      `EXEC proc_SMPBroodMareAffinityTopPerformingSirelines 
              @pMareid=@0,
              @pCountryId=@1`,
      [horseId, countryId],
    );
    await result.reduce(async (promise, item) => {
      await promise;
      sireLinesData.push({
        horseName: item.horseName,
        g1Winners: item.G1Winners,
        stakesWinners: item.StakeWinners,
        runners: item.Runners,
        g1RnrsPercent: item.G1RunnerPerc,
        sWsRnrsPercent: item.SWRunnerPerc,
        //   colour: 'grey'
        colour: await this.rtCommonService.getColourForTopPerformingSireLines(
          item.SWRunnerPerc,
          strikeRateRanges,
        ),
      });
    }, Promise.resolve());

    return sireLinesData;
  }
  /* Get Broodmare Affinity Stake Winners Comparison List*/
  async getBroodmareAffinityStakeWinnersComparisonList(horseId, countryId) {
    let entities = await this.horseRepository.manager.query(
      `EXEC proc_SMPBroodMareAffinityRelatedStakeWinnerComparison 
              @pMareid=@0,
              @pCountryId=@1`,
      [horseId, countryId],
    );

    return entities;
  }
}
