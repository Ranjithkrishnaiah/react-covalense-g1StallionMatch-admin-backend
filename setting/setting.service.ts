import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';
import { SettingItemDto } from './dto/setting-item.dto';
import { CountryService } from 'src/country/service/country.service';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';

@Injectable({ scope: Scope.REQUEST })
export class SettingService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    private countryService: CountryService,
    private commonService: CommonUtilsService,
  ) {}

  async update(updateDto: UpdateSettingDto) {
    const member = this.request.user;
    let settingsData = updateDto.settingData;
    let blockedCountries = updateDto.blockedCountries;
    let inputSettingsList = [];
  
    await settingsData.reduce(async (promise, settingItem: SettingItemDto) => {
      await promise;
      if (settingItem.smSettingKey) {
        inputSettingsList.push(settingItem.smSettingKey);
      }
    }, Promise.resolve());
    //Check keys exist in the tblSetting, if not throw a exception
    let noofRecords = await this.settingRepository
      .createQueryBuilder('setting')
      .andWhere('setting.smSettingKey IN (:...smSettingKeys)')
      .setParameter('smSettingKeys', inputSettingsList)
      .getCount();
    if (
      noofRecords != inputSettingsList.length ||
      blockedCountries.includes(0)
    ) {
      throw new UnprocessableEntityException('Invalid settings data!');
    }
    //Update Values to Respective Table Rows in tblSetting
    await settingsData.reduce(async (promise, settingItem: SettingItemDto) => {
      await promise;
      if (settingItem.smSettingKey) {
        if (settingItem.smSettingValue) {
          await this.settingRepository.update(
            { smSettingKey: settingItem.smSettingKey },
            {
              smSettingValue: settingItem.smSettingValue,
              modifiedBy: member['id'],
              modifiedOn: new Date(),
            },
          );
        }
      }
    }, Promise.resolve());
    if (blockedCountries.length) {
      //update tblCountry set blackListFromAdminPortal=0
      //Then collect all blacklist countryIds
      //update tblCountry table set blackListFromAdminPortal=1 WHERE id IN(blockedCountries)
      this.countryService.blackListCountriesForAdminPortal(blockedCountries);
    } else {
      //update tblCountry set blackListFromAdminPortal=0
      this.countryService.unBlackListCountriesForAdminPortal();
    }
  }

  async getData() {
    //Get All the data from tblSetting
    //Get all list of available calculation methods
    //Get all list of available max login attempts
    //Get all list of available allowed account suspention length (h)
    //Get all list of available allowed active session length (h)
    //Get Countries along with blacklistedStatus if exist

    let settingItems = await this.settingRepository.find({
      select: ['smSettingKey', 'smSettingValue'],
    });
    let settingDataArray = {
      SM_DATA_CALC_METHOD: '',
      SM_PORTAL_LOGIN_ATTEMPT_LIMIT: '',
      SM_ACCONT_SUSPENSION_LENGTH: '',
      SM_MAX_ALLOWED_SESSION_LENGTH: '',
    };
    settingItems.forEach(async (item) => {
      settingDataArray[item.smSettingKey] = item.smSettingValue;
    });

    return {
      SM_DATA_CALC_METHOD: await this.commonService.getSettingDataCalcMethod(
        settingDataArray['SM_DATA_CALC_METHOD'],
      ),
      SM_PORTAL_LOGIN_ATTEMPT_LIMIT:
        await this.commonService.getPortalLoginAttemptLimits(
          settingDataArray['SM_PORTAL_LOGIN_ATTEMPT_LIMIT'],
        ),
      SM_ACCONT_SUSPENSION_LENGTH:
        await this.commonService.getAccountSuspensionLengthLimitsInHrs(
          settingDataArray['SM_ACCONT_SUSPENSION_LENGTH'],
        ),
      SM_MAX_ALLOWED_SESSION_LENGTH:
        await this.commonService.getActiveSessionLengthLimitsInHrs(
          settingDataArray['SM_MAX_ALLOWED_SESSION_LENGTH'],
        ),
      countries: await this.countryService.getAllCountries(),
    };
  }

  async findBySettingKey(key: string) {
    const record = await this.settingRepository.findOne({
      select: ['smSettingValue'],
      where: {
        smSettingKey: key,
      },
    });
    if (!record) {
      throw new UnprocessableEntityException('Record not exist!');
    }
    return record.smSettingValue;
  }
}
