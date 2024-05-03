import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { HorsePageSettingsDto } from './dto/horse-page-settings.dto';
import { MarketingPageSettingsDto } from './dto/marketing-page-settings.dto';
import { MemberPageSettingsDto } from './dto/member-page-settings.dto';
import { MessagesPageSettingsDto } from './dto/messages-page-settings.dto';
import { RacePageSettingsDto } from './dto/race-page-settings.dto';
import { ReportPageSettingsDto } from './dto/reports-page-settings.dto';
import { RunnerPageSettingsDto } from './dto/runner-page-settings.dto';
import { UpdatePageSettingsDto } from './dto/update-page-settings.dto';
import { PageSettings } from './entities/page-settings.entity';
import { IdentitiesList } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class PageSettingsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(PageSettings)
    private pageSettingsRepository: Repository<PageSettings>,
  ) {}
  /* Get Page Settings */
  findAll() {
    return this.pageSettingsRepository.find();
  }
  /*  Get Page Setting */
  async findOne(fields) {
    let response = await this.pageSettingsRepository.findOne({
      where: fields,
    });
    if (response) {
      //For Race Settings
      if (response.moduleId === IdentitiesList.PAGE_SETTING_ID_RACE) {
        let eligibleRaceCountries =
          await this.pageSettingsRepository.manager.query(
            `EXEC procGetAllEligibleRaceCountries`,
          );
        let eligibleRaceTypes = await this.pageSettingsRepository.manager.query(
          `EXEC procGetAllEligibleRaceTypes`,
        );
        let raceTypes = [];
        let raceCountries = [];
        if (eligibleRaceTypes.length > 0) {
          raceTypes = eligibleRaceTypes.map((obj) => obj.id);
        }
        if (eligibleRaceCountries.length > 0) {
          raceCountries = eligibleRaceCountries.map((obj) => obj.id);
        }
        response.settingsResponse = {
          eligibleRaceTypes: raceTypes,
          eligibleRaceCountries: raceCountries,
          ...JSON.parse(response.settingsResponse),
        };
        return response;
      } else if (response.moduleId === IdentitiesList.PAGE_SETTING_ID_RUNNER) {
        let eligibleRunnerCobCountries =
          await this.pageSettingsRepository.manager.query(
            `EXEC procGetAllEligibleRunnerCOBCountries`,
          );
        let runnerCobCountries = [];
        if (eligibleRunnerCobCountries.length > 0) {
          runnerCobCountries = eligibleRunnerCobCountries.map((obj) => obj.id);
        }
        response.settingsResponse = {
          eligibleRunnerCobCountries: runnerCobCountries,
          ...JSON.parse(response.settingsResponse),
        };
        return response;
      }else if(response.moduleId === IdentitiesList.PAGE_SETTING_ID_HORSE){
        let eligibleHorserBreed = await this.pageSettingsRepository.manager.query(
          `EXEC procGetAllEligibleHorseBreed`,
        );
        let horserBreed = [];
        if (eligibleHorserBreed.length > 0) {
          horserBreed = eligibleHorserBreed.map((obj) => obj.id);
        }
        response.settingsResponse = {
          breed: horserBreed,
          ...JSON.parse(response.settingsResponse),
        };
        return response;
      }
      response.settingsResponse = JSON.parse(response.settingsResponse);
    }
    return response;
  }
  /* Update Horse Settings */
  async updateHorseSettings(horsePageSettingsDto: HorsePageSettingsDto) {
    const member = this.request.user;
    let settingsResponse = ` {
  "defaultDisplay" : { 
  "options": [
  { "name": "Horse", "value": "HorseName" },
  { "name": "Sex", "value": "Sex"},
  { "name": "YOB", "value": "YOB"},
  { "name": "Country", "value": "Country"},
  { "name": "Breeding", "value": "Breeding"},
  { "name": "Stakes", "value": "Stakes" },
  { "name": "Verified", "value": "Verified" },
  { "name": "Progeny", "value": "Progeny" }
  ],
  "selectedOption" : ${
    horsePageSettingsDto.defaultDisplay
      ? JSON.stringify(horsePageSettingsDto.defaultDisplay)
      : null
  }
  },
  "generation" : {
  "options": [
    { "name": 1, "value": 1 },
    { "name": 2, "value": 2},
    { "name": 3, "value": 3},
    { "name": 4, "value": 4},
    { "name": 5, "value": 5},
    { "name": 6, "value": 6}
  ],
  "selectedOption" : ${
    horsePageSettingsDto.generation
      ? JSON.stringify(horsePageSettingsDto.generation)
      : null
  }
  },
  "source" : {
      "options": [
        { "name": "Internal", "value": "Internal" },
        { "name": "DB", "value": "DB"},
        { "name": "Other", "value": "Other"}
       ],
      "selectedOption" : ${
        horsePageSettingsDto.source
          ? JSON.stringify(horsePageSettingsDto.source)
          : null
      }
      },
    "verifyStatus" : ${
            horsePageSettingsDto.verifyStatus
              ? JSON.stringify(horsePageSettingsDto.verifyStatus)
              : null
          },
  
  "startDate": ${
    horsePageSettingsDto.startDate
      ? JSON.stringify(horsePageSettingsDto.startDate)
      : null
  }

  }
`;

// "verifyStatus" : {
//   "options": [
//     { "name": "Verified", "value": "Verified", "isSelected": 1 },
//     { "name": "UnVerified", "value": "Un verified", "isSelected": 1 }
//    ],
//   "selectedOption" : ${
//     horsePageSettingsDto.verifyStatus
//       ? JSON.stringify(horsePageSettingsDto.verifyStatus)
//       : null
//   }
//   },
// "breed" : {
//   "options": [
//     { "name": "Thoroughbreed", "value": "Thoroughbreed" },
//     { "name": "Other", "value": "Other"}
//    ],
//   "selectedOption" : ${
//     horsePageSettingsDto.breed
//       ? JSON.stringify(horsePageSettingsDto.breed)
//       : null
//   }
//   },

    //return settingsResponse;
    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: settingsResponse,
    };

    //Set Eligible Horse Breed
    if (horsePageSettingsDto.breed.length) {
      await this.pageSettingsRepository.manager.query(
        `EXEC Proc_SMPUpdateHorseEligibleBreed @horseBreeds=@0, @memberId=@1`,
        [horsePageSettingsDto.breed.toString(), member['id']],
      );
    } else {
      await this.pageSettingsRepository.manager.query(
        `EXEC Proc_SMPUpdateHorseEligibleBreed @horseBreeds=@0, @memberId=@1`,
        ['', member['id']],
      );
    }

    return await this.pageSettingsRepository.update(
      { pageSettingsUuid: horsePageSettingsDto.id },
      updateDto,
    );
  }
  /* Update Page Settings */
  async updatePageSettings(updatePageSettingsDto: UpdatePageSettingsDto) {
    const member = this.request.user;
    const { moduleId, payload } = updatePageSettingsDto;

    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: JSON.stringify(payload),
    };

    return await this.pageSettingsRepository.update(
      { moduleId: moduleId },
      updateDto,
    );
  }
  /* Update Member Settings */
  async updateMemberSettings(memberPageSettingsDto: MemberPageSettingsDto) {
    const member = this.request.user;
    let settingsResponse = `{
  "defaultDisplay" : { 
  "options": [
  { "name": "Name", "value": "Name" },
  { "name": "Email", "value": "Email" },
  { "name": "Country", "value": "Country"},
  { "name": "MemberSince", "value": "Member Since"},
  { "name": "LastActive", "value": "Last Active"},
  { "name": "Permission", "value": "Permission"},
  { "name": "Verified", "value": "Verified" }
  ],
  "selectedOption" : ${
    memberPageSettingsDto.defaultDisplay
      ? JSON.stringify(memberPageSettingsDto.defaultDisplay)
      : null
  }
  }
  }
`;

    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: settingsResponse,
    };

    return await this.pageSettingsRepository.update(
      { pageSettingsUuid: memberPageSettingsDto.id },
      updateDto,
    );
  }
  /* Update Farm Settings */
  async updateFarmSettings(farmPageSettingsDto: MemberPageSettingsDto) {
    const member = this.request.user;
    let settingsResponse = `{
  "defaultDisplay" : { 
  "options": [
  { "name": "Name", "value": "Name" },
  { "name": "Country", "value": "Country"},
  { "name": "State", "value": "State"},
  { "name": "TotalStallions", "value": "Total Stallions"},
  { "name": "Promoted", "value": "Promoted"},
  { "name": "Users", "value": "Users" },
  { "name": "LastActive", "value": "Last Active" }
  ],
  "selectedOption" : ${
    farmPageSettingsDto.defaultDisplay
      ? JSON.stringify(farmPageSettingsDto.defaultDisplay)
      : null
  }
  }
  }
`;
    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: settingsResponse,
    };

    return await this.pageSettingsRepository.update(
      { pageSettingsUuid: farmPageSettingsDto.id },
      updateDto,
    );
  }
  /* Update Message Settings */
  async updateMessagesSettings(
    messagesPageSettingsDto: MessagesPageSettingsDto,
  ) {
    const member = this.request.user;
    let settingsResponse = `{
  "retainTrashPeriod" : ${
    messagesPageSettingsDto.retainTrashPeriod
      ? messagesPageSettingsDto.retainTrashPeriod
      : 0
  },
  "boostExpiryLength" : ${
    messagesPageSettingsDto.boostExpiryLength
      ? messagesPageSettingsDto.boostExpiryLength
      : 0
  }
  }
`;

    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: settingsResponse,
    };

    return await this.pageSettingsRepository.update(
      { pageSettingsUuid: messagesPageSettingsDto.id },
      updateDto,
    );
  }

  /* Update Race Settings */
  async updateRaceSettings(racePageSettingsDto: RacePageSettingsDto) {
    const member = this.request.user;
    let settingsResponse = `{
      "defaultDisplay": ${
        racePageSettingsDto.defaultDisplay
          ? JSON.stringify(racePageSettingsDto.defaultDisplay)
          : null
      },
      "eligibleRaceStartDate":${
        racePageSettingsDto.eligibleRaceStartDate
          ? JSON.stringify(racePageSettingsDto.eligibleRaceStartDate)
          : null
      },
      "minimumStakesLevelIncluded":${
        racePageSettingsDto.minimumStakesLevelIncluded
          ? JSON.stringify(racePageSettingsDto.minimumStakesLevelIncluded)
          : null
      }
    }`;
    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: settingsResponse,
    };

    //Set Eligible Race Types
    if (racePageSettingsDto.eligibleRaceTypes.length) {
      await this.pageSettingsRepository.manager.query(
        `EXEC Proc_SMPUpdateRaceEligibleTypes @raceTypes=@0`,
        [racePageSettingsDto.eligibleRaceTypes.toString()],
      );
    } else {
      await this.pageSettingsRepository.manager.query(
        `EXEC Proc_SMPSetRaceEligibleTypesToInEligible`,
      );
    }

    //Set Eligible Race Countries
    if (racePageSettingsDto.eligibleRaceCountries.length) {
      await this.pageSettingsRepository.manager.query(
        `EXEC Proc_SMPUpdateRaceEligibleCountries @countries=@0`,
        [racePageSettingsDto.eligibleRaceCountries.toString()],
      );
    } else {
      await this.pageSettingsRepository.manager.query(
        `EXEC Proc_SMPSetAllRaceEligibleCountriesToInEligible`,
      );
    }

    return await this.pageSettingsRepository.update(
      { pageSettingsUuid: racePageSettingsDto.settingId },
      updateDto,
    );
  }
  /* Update Runner Settings */
  async updateRunnerSettings(runnerPageSettingsDto: RunnerPageSettingsDto) {
    const member = this.request.user;

    let settingsResponse = `{
      "defaultDisplay": ${
        runnerPageSettingsDto.defaultDisplay
          ? JSON.stringify(runnerPageSettingsDto.defaultDisplay)
          : null
      }
    }`;

    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: settingsResponse,
    };

    //Set Eligible Race Countries
    if (runnerPageSettingsDto.eligibleRunnerCOBCountries.length) {
      await this.pageSettingsRepository.manager.query(
        `EXEC Proc_SMPUpdateRunnerCOBEligibleCountries @countries=@0`,
        [runnerPageSettingsDto.eligibleRunnerCOBCountries.toString()],
      );
    } else {
      await this.pageSettingsRepository.manager.query(
        `EXEC Proc_SMPSetAllRunnerCOBCountriesToInEligible`,
      );
    }

    return await this.pageSettingsRepository.update(
      { pageSettingsUuid: runnerPageSettingsDto.settingId },
      updateDto,
    );
  }
  /* Update Marketing Settings */
  async updateMarketingSettings(
    marketingPageSettingsDto: MarketingPageSettingsDto,
  ) {
    const member = this.request.user;
    let settingsResponse = `{
  "country" : ${
    marketingPageSettingsDto.country
      ? JSON.stringify(marketingPageSettingsDto.country)
      : null
  },
  "officialCurrency" : ${
    marketingPageSettingsDto.officialCurrency
      ? JSON.stringify(marketingPageSettingsDto.officialCurrency)
      : null
  },
  "smDisplayCurrency" : ${
    marketingPageSettingsDto.smDisplayCurrency
      ? JSON.stringify(marketingPageSettingsDto.smDisplayCurrency)
      : null
  }
  }
`;

    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: settingsResponse,
    };
    return await this.pageSettingsRepository.update(
      { pageSettingsUuid: marketingPageSettingsDto.id },
      updateDto,
    );
  }
  /* Update Notification Settings */
  async updateNotificationsSettings(
    notificationPageSettingsDto: MemberPageSettingsDto,
  ) {
    const member = this.request.user;
    let settingsResponse = `{
  "defaultDisplay" : { 
  "options": [
  { "name": "Date", "value": "Date" },
  { "name": "Title", "value": "Title"},
  { "name": "Message", "value": "Message"},
  { "name": "Link", "value": "Link"},
  { "name": "Read", "value": "Read"},
  ],
  "selectedOption" : ${
    notificationPageSettingsDto.defaultDisplay
      ? JSON.stringify(notificationPageSettingsDto.defaultDisplay)
      : null
  }
  }
  }
`;

    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: settingsResponse,
    };

    return await this.pageSettingsRepository.update(
      { pageSettingsUuid: notificationPageSettingsDto.id },
      updateDto,
    );
  }
  /* Update Report Settings */
  async updateReportsSettings(reportPageSettingsDto: ReportPageSettingsDto) {
    const member = this.request.user;
    let settingsResponse = `{
  "defaultDisplay" : { 
  "options": [
  { "name": "OrderId", "value": "Order Id" },
  { "name": "Date", "value": "Date"},
  { "name": "ClientName", "value": "Client Name"},
  { "name": "Email", "value": "Email"},
  { "name": "Report", "value": "Report"},
  { "name": "Country", "value": "Country"},
  { "name": "Paid", "value": "Paid"},
  { "name": "Status", "value": "Status"},
  { "name": "PDF", "value": "PDF"}
  ],
  "selectedOption" : ${
    reportPageSettingsDto.defaultDisplay
      ? JSON.stringify(reportPageSettingsDto.defaultDisplay)
      : null
  }
  },
  "sendFrom" : ${
    reportPageSettingsDto.sendFrom ? JSON.stringify(reportPageSettingsDto.sendFrom) : null
  },
  "replyTo" : ${
    reportPageSettingsDto.replyTo ? JSON.stringify(reportPageSettingsDto.replyTo) : null
  },
  "approvalAutomation" : ${reportPageSettingsDto.approvalAutomation},
  "deliveryAutomation" : ${reportPageSettingsDto.deliveryAutomation}
  }
`;

    const updateDto = {
      modifiedBy: member['id'],
      modifiedOn: new Date(),
      settingsResponse: settingsResponse,
    };

    return await this.pageSettingsRepository.update(
      { pageSettingsUuid: reportPageSettingsDto.id },
      updateDto,
    );
  }
}
