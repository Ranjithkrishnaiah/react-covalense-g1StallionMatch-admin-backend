import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import * as requestIp from 'request-ip';
import { Colour } from 'src/colours/entities/colour.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { Country } from 'src/country/entity/country.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { FarmsService } from 'src/farms/farms.service';
import { HorseType } from 'src/horse-types/entities/horse-type.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { MarketingPageHomeService } from 'src/marketing-page-home/marketing-page-home.service';
import { MemberAddressService } from 'src/member-address/member-address.service';
import { MembersService } from 'src/members/members.service';
import { ProductsService } from 'src/products/products.service';
import { RaceService } from 'src/race/race.service';
import { Runner } from 'src/runner/entities/runner.entity';
import { StallionsService } from 'src/stallions/stallions.service';
import { activityTypes } from 'src/utils/constants/activity';
import { Repository, getRepository } from 'typeorm';
import { ActivityType } from './activity-type.entity';
import { ActivityEntity } from './activity.entity';

@Injectable()
export class ActivityService {
  testimonialDeleted: boolean = false;
  paymentMethod: any = [];
  stallionData: any;
  baseUrl: string;

  constructor(
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
    private stallionService: StallionsService,
    private horseService: HorsesService,
    private commonUtilService: CommonUtilsService,
    private membersService: MembersService,
    private farmService: FarmsService,
    private memberAddressService: MemberAddressService,
    private readonly configService: ConfigService,
    private readonly raceService: RaceService,
    private readonly productsService: ProductsService,
    private readonly marketingPageHomeService: MarketingPageHomeService,
  ) {
    this.baseUrl = this.configService.get('file.systemActivityAdminDashboard');
  }

  @OnEvent('signInUser')
  async signInUserActivity(data) {
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);

    let sigInUser = `<a href="#" class="systemTooltip">${body.email}</a> Successful sign in`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let signInUserActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: sigInUser,
      attributeName: await data?.subscribedData?.key,
      newValue: body.email,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      createdBy: null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'General',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(signInUserActivity);
  }

  @OnEvent('forgotPassword')
  async forgotPasswordActivity(data) {
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let forgotPassword = `Request Forgot Password for <a href="#" class="systemTooltip">${body.email}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let forgotPasswordActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: forgotPassword,
      attributeName: await data?.subscribedData?.key,
      newValue: body.email,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      createdBy: null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'General',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(forgotPasswordActivity);
  }

  @OnEvent('addStallionActivity')
  async createStallionActivity(data) {
    let horse = this.horseService.findOne(await data.originalData.body.horseId);
    let horseName = (await horse).horseName;
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let { params, body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);

    let addStallion = `Created a new stallion - <a href="${
      this.baseUrl + ''
    }" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      await horseName,
    )}</a>`;

    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createStallionActivity = {
      activityTypeId: activityType?.id,
      farmId: body.farmId,
      stallionId: null,
      additionalInfo: addStallion,
      attributeName: 'horseName',
      newValue: await this.commonUtilService.toTitleCase(await horseName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Stallions',
      reportType: null,
      entityId: (await horse).horseUuid,
    };
    await this.activityRepository.save(createStallionActivity);
  }

  @OnEvent('addHorseActivity')
  async createHorseActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const url =
      this.baseUrl + '/horsedetails/data/' + body.horseName + '/horsefilter';
    let addHorse = `Added a new horse - <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      body.horseName,
    )}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createHorseActivity = {
      activityTypeId: activityType?.id,
      farmId: body.farmId,
      stallionId: null,
      additionalInfo: addHorse,
      attributeName: 'horseName',
      newValue: await this.commonUtilService.toTitleCase(body.horseName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Horses',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(createHorseActivity);
  }

  @OnEvent('updateHorsesActivity')
  async updateOverViewAct(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let horseChangedDataList = await data?.horseChangedData;
    await horseChangedDataList.reduce(async (promise, horseChangedData) => {
      let { params, body, ip, headers } = await data?.originalData;
      const clientIp = requestIp.getClientIp(await data?.originalData);
      const url =
        this.baseUrl +
        '/horsedetails/data/' +
        horseChangedData?.horseName +
        '/horsefilter';

      let oldValue, newValue;
      switch (horseChangedData.key) {
        case 'country':
          oldValue = await getRepository(Country)
            .createQueryBuilder('country')
            .select('country.countryName AS countryName')
            .andWhere('country.id =:countryId', {
              countryId: horseChangedData.oldValue,
            })
            .getRawOne();
          newValue = await getRepository(Country)
            .createQueryBuilder('country')
            .select('country.countryName AS countryName')
            .andWhere('country.id =:countryId', {
              countryId: horseChangedData.newValue,
            })
            .getRawOne();
          horseChangedData.oldValue = await this.commonUtilService.toTitleCase(
            oldValue.countryName,
          );
          horseChangedData.newValue = await this.commonUtilService.toTitleCase(
            newValue.countryName,
          );
          break;
        case 'colour':
          oldValue = await getRepository(Colour)
            .createQueryBuilder('colour')
            .select('colour.colourName AS colourName')
            .andWhere('colour.id =:colourId', {
              colourId: horseChangedData.oldValue,
            })
            .getRawOne();
          newValue = await getRepository(Colour)
            .createQueryBuilder('colour')
            .select('colour.colourName AS colourName')
            .andWhere('colour.id =:colourId', {
              colourId: horseChangedData.newValue,
            })
            .getRawOne();
          horseChangedData.oldValue = await this.commonUtilService.toTitleCase(
            oldValue.colourName,
          );
          horseChangedData.newValue = await this.commonUtilService.toTitleCase(
            newValue.colourName,
          );
          break;
        case 'horseBreed':
          oldValue = await getRepository(HorseType)
            .createQueryBuilder('breed')
            .select('breed.horseTypeName AS breedName')
            .andWhere('breed.id =:breedId', {
              breedId: horseChangedData.oldValue,
            })
            .getRawOne();
          newValue = await getRepository(HorseType)
            .createQueryBuilder('breed')
            .select('breed.horseTypeName AS breedName')
            .andWhere('breed.id =:breedId', {
              breedId: horseChangedData.newValue,
            })
            .getRawOne();
          horseChangedData.oldValue = await this.commonUtilService.toTitleCase(
            oldValue.breedName,
          );
          horseChangedData.newValue = await this.commonUtilService.toTitleCase(
            newValue.breedName,
          );
          break;
        case 'dob':
          horseChangedData.oldValue = format(
            new Date(horseChangedData.oldValue),
            'dd MMM yyyy',
          );
          horseChangedData.newValue = format(
            new Date(horseChangedData.newValue),
            'dd MMM yyyy',
          );
          break;
        case 'prizemoney currency':
          oldValue = await getRepository(Currency)
            .createQueryBuilder('currency')
            .select('currency.currencyName AS currencyName')
            .andWhere('currency.id =:currencyId', {
              currencyId: horseChangedData.oldValue,
            })
            .getRawOne();
          newValue = await getRepository(Currency)
            .createQueryBuilder('currency')
            .select('currency.currencyName AS currencyName')
            .andWhere('currency.id =:currencyId', {
              currencyId: horseChangedData.newValue,
            })
            .getRawOne();
          horseChangedData.oldValue = await this.commonUtilService.toTitleCase(
            oldValue.currencyName,
          );
          horseChangedData.newValue = await this.commonUtilService.toTitleCase(
            newValue.currencyName,
          );
          break;
        default:
      }

      let updateHorse = `Updated ${await this.commonUtilService.toTitleCase(
        horseChangedData?.key,
      )} From <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
        horseChangedData?.oldValue,
      )}</a> to <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
        await horseChangedData?.newValue,
      )}</a>`;

      const activityType = await this.getActivityTypeByActivityTypeCode(
        activityTypes.UPDATE,
      );
      let updateOverViewActivity = {
        activityTypeId: activityType?.id,
        farmId: body?.farmId,
        stallionId: params?.stallionId,
        additionalInfo: updateHorse,
        attributeName: horseChangedData?.key,
        newValue: await this.commonUtilService.toTitleCase(
          horseChangedData?.newValue,
        ),
        oldValue: await this.commonUtilService.toTitleCase(
          horseChangedData?.oldValue,
        ),
        ipAddress: clientIp,
        userAgent: headers['user-agent'],
        userName: user?.fullName,
        userEmail: user?.email,
        userCountryId: memberAddress?.countryId,
        createdBy: user?.id,
        createdOn: new Date(),
        result: 'Success',
        activityModule: 'Horses',
        reportType: null,
        entityId: null,
      };
      await this.activityRepository.save(updateOverViewActivity);
    }, Promise.resolve());
  }

  @OnEvent('deleteHorseActivity')
  async deleteHorseActivity(request) {
    let user = await this.membersService.findOneForActivityBymemberId(
      request?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let { headers } = await request?.originalData;
    const clientIp = requestIp.getClientIp(await request?.originalData);
    let deleteHorse = `Delete a horse - ${await this.commonUtilService.toTitleCase(
      request?.record.horseName,
    )} (${request?.record.id})`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );
    let deleteHorseActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: deleteHorse,
      attributeName: null,
      newValue: null,
      oldValue: null,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Horses',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(deleteHorseActivity);
  }

  @OnEvent('membersActivity')
  async createMembersActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let originalData = await data?.originalData;
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const url =
      this.baseUrl + '/members/data/' + body?.fullName + '/userFilter';

    let createMember = `A new member has been added successfully - <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      body?.fullName,
    )}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createMembersActivity = {
      activityTypeId: activityType?.id,
      farmId: body?.farmId,
      stallionId: null,
      additionalInfo: createMember,
      attributeName: 'memberName',
      newValue: await this.commonUtilService.toTitleCase(body?.fullName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Members',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(createMembersActivity);
  }

  @OnEvent('userForgotPassword')
  async userForgotPasswordActivity(data) {
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);

    let userForgotPassword = `Requested to reset password from Admin for <a href="#" class="systemTooltip">${await data
      .originalData.body.email}</a>`;

    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let userForgotPasswordActivity = {
      activityTypeId: activityType?.id,
      farmId: data?.originalData?.body?.farmId,
      stallionId: null,
      additionalInfo: userForgotPassword,
      attributeName: 'forgotPassword',
      newValue: body.email,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      createdBy: null,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Members',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(userForgotPasswordActivity);
  }

  @OnEvent('memberInvitationInviteFarm')
  async memberInvitationInviteFarmActivity(data) {
    let { body, ip, headers } = await data?.originalData;
    let fullName = body?.fullName;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    const memberRecord = await this.membersService.findOne({
      email: body.email,
    });
    if (memberRecord) {
      fullName = memberRecord?.fullName;
    }
    let farm = await this.farmService?.findFarm(body?.farmId);
    const userUrl = this.baseUrl + '/members/data/' + fullName + '/userFilter';
    const url = this.baseUrl + '/farms/data/' + farm.farmName + '/filter';

    let memberInvitationFarm = `Sent a farm invite to <a href="${userUrl}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      fullName,
    )}</a> for <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      farm?.farmName,
    )}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let memberInvitationInviteFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: body?.farmId,
      stallionId: null,
      additionalInfo: memberInvitationFarm,
      attributeName: 'memberEmail',
      newValue: body.email,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: user?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Members',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(memberInvitationInviteFarmActivity);
  }

  @OnEvent('createFarmActivity')
  async createFarmActivityActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let countryAddress = await getRepository(Country).findOne(
      data?.originalData?.body?.countryId,
    );
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const url = this.baseUrl + '/farms/data/' + body.farmName + '/filter';

    let createFarm = `Added a New Farm <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      data?.originalData?.body?.farmName,
    )}</a> in ${countryAddress?.countryName}`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createFarmActivityActivity = {
      activityTypeId: activityType?.id,
      farmId: body?.farmId,
      stallionId: null,
      additionalInfo: createFarm,
      attributeName: 'farmName',
      newValue: body?.farmName,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(createFarmActivityActivity);
  }

  @OnEvent('updateFarmActivity')
  async updateFarmActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let farmChangedData = await data?.farmChangedData;
    let { params, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let farm = await this.farmService.findOne(params.id);
    const url = this.baseUrl + '/farms/data/' + farm.farmName + '/filter';
    let updateFarm = `Update details for <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      farm.farmName,
    )}`;

    if (farmChangedData?.key) {
      updateFarm +
        `</a> for <a href="${url}" class="systemTooltip">${farmChangedData?.key}</a>`;
    }
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let updateFarmActivity = {
      activityTypeId: activityType?.id,
      farmId: data?.originalData?.params?.id,
      stallionId: data?.originalData?.params?.stallionId,
      additionalInfo: updateFarm,
      attributeName: await data?.farmChangedData?.key,
      newValue: await data?.farmChangedData?.newValue,
      oldValue: await data?.farmChangedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Farms',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(updateFarmActivity);
  }

  @OnEvent('createRaceActivity')
  async createRaceActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    const url = this.baseUrl + '/race/data/' + body.raceName + '/filter';
    let createRace = `Added a new race <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      body.raceName,
    )}</a> `;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createRaceActivity = {
      activityTypeId: activityType?.id,
      farmId: await data?.originalData?.body?.farmId,
      stallionId: null,
      additionalInfo: createRace,
      attributeName: 'raceName',
      newValue: body.raceName,
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Race',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(createRaceActivity);
  }

  @OnEvent('updateRaceActivity')
  async updateRaceActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    if ((await data?.raceChangedData) == undefined) return;
    let { params, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let race = await this.raceService.findOne(params.id);
    const url = this.baseUrl + '/race/data/' + race.raceName + '/filter';

    let createRace = `Updated details for existing race <a href="${url}" class="systemTooltip">${
      race.raceName
    }</a>  ${await data.raceChangedData
      ?.key} from <a href="${url}" class="systemTooltip">${await data
      .raceChangedData
      ?.oldValue}</a> to <a href="${url}" class="systemTooltip">${await data
      .raceChangedData?.newValue}</a>`;

    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let updateRaceActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: createRace,
      attributeName: await data?.raceChangedData?.key,
      newValue: await data?.raceChangedData?.newValue,
      oldValue: await data?.raceChangedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Race',
      reportType: null,
      entityId: params?.id,
    };

    await this.activityRepository.save(updateRaceActivity);
  }
  @OnEvent('updateRunnerActivity')
  async updateRunnerActivity(data) {
    let runnerChangedData = await data?.runnerChangedData;
    let { params, body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let runner = await getRepository(Runner).findOne({ runnerUuid: params.id });
    let horse = await getRepository(Horse).findOne(runner.horseId);
    const url =
      this.baseUrl + '/horsedetails/data/' + horse?.horseName + '/filter';

    let additionalInfo = `Updated details for existing runner <a href="${url}" class="systemTooltip">${
      horse?.horseName
    }</a>  ${await data.runnerChangedData
      ?.key} from <a href="${url}" class="systemTooltip">${await data
      .runnerChangedData
      ?.oldValue}</a> to <a href="${url}" class="systemTooltip">${await data
      .runnerChangedData?.newValue}</a>`;

    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: 'isEligible',
      newValue: runnerChangedData?.newValue,
      oldValue: runnerChangedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Runners',
      reportType: null,
      entityId: horse?.horseUuid,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('resendConfirmEmail')
  async resendConfirmEmail(data) {
    let { params, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let member = await this.membersService.findOne({
      memberuuid: params.id,
    });
    const url =
      this.baseUrl + '/members/data/' + member?.fullName + '/userFilter';

    let additionalInfo = `Resent ‘Account Verification’ email to <a href="${url}" class="systemTooltip">${member?.fullName}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Members',
      reportType: null,
      entityId: params?.id,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('addRunner')
  async addRunner(data: any) {
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let horse = await this.horseService.findOne(body.horseId);
    const url =
      this.baseUrl + '/horsedetails/data/' + horse?.horseName + '/filter';
    let additionalInfo = `Added a new runner - <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      horse?.horseName,
    )}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      newValue: horse?.horseName,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Runners',
      reportType: null,
      entityId: horse?.horseUuid,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateOnlyRunnerEligiblity')
  async updateOnlyRunnerEligiblity(data) {
    let runnerChangedData = await data?.runnerChangedData;

    if (runnerChangedData?.key != 'isEligible') {
      return;
    }
    let { params, body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );

    let horse = await this.horseService.findOne(params.horseId);
    const url =
      this.baseUrl + '/horsedetails/data/' + horse?.horseName + '/filter';
    let status = body.isEligible ? 'Active' : 'Disabled';

    let additionalInfo = `Changed eligibility status of runner <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      horse?.horseName,
    )}</a> to ${status}`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: 'isEligible',
      newValue: runnerChangedData?.newValue,
      oldValue: runnerChangedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Runners',
      reportType: null,
      entityId: horse?.horseUuid,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateAllLinkedRunnerEligiblity')
  async updateAllLinkedRunnerEligiblity(data) {
    let runnerChangedData = await data?.runnerChangedData;
    if (runnerChangedData?.key != 'isEligible') {
      return;
    }
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );

    let additionalInfo = `Applied eligibility status of runner to all linked runners`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: 'isEligible',
      newValue: runnerChangedData?.newValue,
      oldValue: runnerChangedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Runners',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('addProduct')
  async addProduct(data) {
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    const url =
      this.baseUrl + '/products/data/' + body?.productName + '/filter';

    let additionalInfo = `Added a new Product - <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      body?.productName,
    )}</a> `;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      newValue: body?.productName,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Products',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateProduct')
  async updateProduct(data) {
    let productChangedData = await data?.productChangedData;
    if (productChangedData?.key != 'isActive') {
      return;
    }
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let product = await this.productsService.findProductDetails(params.id);
    const url =
      this.baseUrl + '/products/data/' + product?.productName + '/filter';
    let status = body.isActive ? 'Active' : 'Disabled';

    let additionalInfo = `Made <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      product?.productName,
    )}</a> ${status}`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: 'isActive',
      newValue: productChangedData?.newValue,
      oldValue: productChangedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Products',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('addPromoCode')
  async addPromoCode(data) {
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    const url =
      this.baseUrl + '/products/promocode/' + body?.promoCodeName + '/filter';

    let additionalInfo = `Added a new Promo Code - <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      body?.promoCodeName,
    )}</a> `;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      newValue: body?.promoCodeName,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'PromoCodes',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updatePromoCode')
  async updatePromoCode(data) {
    let promoCodeChangedData = await data?.promoCodeChangedData;
    if (promoCodeChangedData?.key != 'isActive') {
      return;
    }
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    const url =
      this.baseUrl +
      '/products/promocode/data/' +
      body?.promoCodeName +
      '/filter';
    let status = body.isActive ? 'Active' : 'Disabled';

    let additionalInfo = `Made <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      body?.promoCodeName,
    )}</a> ${status}`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: 'isActive',
      newValue: promoCodeChangedData?.newValue,
      oldValue: promoCodeChangedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'PromoCodes',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('newMessages')
  async newMessages(data) {
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    if (body?.members) {
      await body.members.reduce(async (promise, item) => {
        await promise;
        let member = await this.membersService.findOne({ memberuuid: item });
        if (member) {
          const url =
            this.baseUrl + '/members/data/' + member?.fullName + '/userFilter';
          let additionalInfo = `Created a new message to <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
            member?.fullName,
          )}</a>`;
          const activityType = await this.getActivityTypeByActivityTypeCode(
            activityTypes.CREATE,
          );
          let createActivity = {
            activityTypeId: activityType?.id,
            farmId: null,
            stallionId: null,
            additionalInfo: additionalInfo,
            ipAddress: clientIp,
            userAgent: headers['user-agent'],
            userName: user?.fullName,
            userEmail: user?.email,
            userCountryId: memberAddress?.countryId,
            createdBy: user?.id,
            createdOn: new Date(),
            result: 'Success',
            activityModule: 'Messages',
            reportType: null,
          };
          await this.activityRepository.save(createActivity);
        }
      }, Promise.resolve());
    }
  }

  @OnEvent('deleteMessage')
  async deleteMessage(data) {
    let { ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );
    let additionalInfo = `Deleted a conversation`;
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Messages',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateMessage')
  async updateMessage(data) {
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    if (body.status == 3) {
      let user = await this.membersService.findOneForActivityBymemberId(
        data?.originalData?.user?.id,
      );
      let memberAddress = await this.memberAddressService.findMemberAddress(
        user.id,
      );
      let additionalInfo = `Sent a TOS Warning to {MemberName} `;
      const activityType = await this.getActivityTypeByActivityTypeCode(
        activityTypes.UPDATE,
      );
      let createActivity = {
        activityTypeId: activityType?.id,
        farmId: null,
        stallionId: null,
        additionalInfo: additionalInfo,
        ipAddress: clientIp,
        userAgent: headers['user-agent'],
        userName: user?.fullName,
        userEmail: user?.email,
        userCountryId: memberAddress?.countryId,
        createdBy: user?.id,
        createdOn: new Date(),
        result: 'Success',
        activityModule: 'Messages',
        reportType: null,
      };
    }
  }

  @OnEvent('updateRaceEligibility')
  async updateRaceEligibility(data) {
    let raceChangedData = await data?.raceChangedData;
    if (raceChangedData?.key != 'isEligible') {
      return;
    }
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let race = await this.raceService.findRaceUuid(params.id);
    const url = this.baseUrl + '/race/data/' + race?.displayName + '/filter';
    let status = body.isEligible ? 'Active' : 'Disabled';

    let additionalInfo = `Changed eligibility status of race <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      race?.displayName,
    )}</a> to ${status}`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: 'isEligible',
      newValue: raceChangedData?.newValue,
      oldValue: raceChangedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Race',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateRaceRunnersEligiblity')
  async updateRaceRunnersEligiblity(data) {
    let raceChangedData = await data?.raceChangedData;
    if (raceChangedData?.key != 'isEligible') {
      return;
    }
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let race = await this.raceService.findRaceUuid(params.raceId);
    const url = this.baseUrl + '/race/data/' + race?.displayName + '/filter';
    let status = body.isEligible ? 'Active' : 'Disabled';

    let additionalInfo = `Applied eligibility status of race to all runners in that race <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      race?.displayName,
    )}</a> to ${status}`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: 'isEligible',
      newValue: raceChangedData?.newValue,
      oldValue: raceChangedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Race',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('addMarketingTestimonial')
  async addMarketingTestimonial(data) {
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let marketingPage =
      await this.marketingPageHomeService.getMarketingPageByPageSectionId(
        body.marketingPageSectionId,
      );
    let url = this.baseUrl + '/marketing/home';
    if (marketingPage?.pagePrefix == 'page_stallion_match_farm') {
      url = this.baseUrl + '/marketing/stallionmatch';
    }

    let additionalInfo = `Added a testimonial on <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      marketingPage?.marketingPageName,
    )}</a> - Marketing info`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Marketing',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('deleteMarketingTestimonial')
  async deleteMarketingTestimonial(data) {
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let record = await data?.record;
    let user = await this.membersService.findName(data?.originalData?.user?.id);
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let marketingPage = await this.marketingPageHomeService.getPageById(
      record?.marketingPageId,
    );
    let url = this.baseUrl + '/marketing/home';
    if (marketingPage?.pagePrefix == 'page_stallion_match_farm') {
      url = this.baseUrl + '/marketing/stallionmatch';
    }

    let additionalInfo = `Removed a testimonial on <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      marketingPage?.marketingPageName,
    )}</a> - Marketing info`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.DELETE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Marketing',
      reportType: null,
      entityId: params?.additionalInfoId,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateMarketingHomePage')
  async updateMarketingHomePage(data) {
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findName(data?.originalData?.user?.id);
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let marketingPage = await this.marketingPageHomeService.getPageByUuid(
      params.pageId,
    );
    let url = this.baseUrl + '/marketing/home';

    let fieldName;
    if (body.mainHeading) {
      fieldName = 'Main Heading';
    } else if (body.heroImage) {
      fieldName = 'Hero Image';
    } else if (body.banner1) {
      fieldName = 'Banner 1';
    } else if (body.banner1) {
      fieldName = 'Banner 2';
    }
    let additionalInfo = `Updated ${fieldName} on <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      marketingPage?.marketingPageName,
    )}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Marketing',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateStallionMatchFarmMarketingPage')
  async updateStallionMatchFarmMarketingPage(data) {
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findName(data?.originalData?.user?.id);
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let marketingPage = await this.marketingPageHomeService.getPageByUuid(
      params.pageId,
    );
    let url = this.baseUrl + '/marketing/stallionmatch';

    let fieldName;
    if (body.mainHeading) {
      fieldName = 'Main Heading';
    } else if (body.heroImage) {
      fieldName = 'Hero Image';
    } else if (body.banner1) {
      fieldName = 'Banner 1';
    } else if (body.banner1) {
      fieldName = 'Banner 2';
    }
    let additionalInfo = `Updated ${fieldName} on <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      marketingPage?.marketingPageName,
    )}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Marketing',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateTrendsMarketingPage')
  async updateTrendsMarketingPage(data) {
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findName(data?.originalData?.user?.id);
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let marketingPage = await this.marketingPageHomeService.getPageByUuid(
      params.pageId,
    );
    let url = this.baseUrl + '/marketing/trends';

    let fieldName;
    if (body.headerBanner) {
      fieldName = 'Header Banner';
    } else if (body.heroImage) {
    }
    let additionalInfo = `Updated ${fieldName} on <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      marketingPage?.marketingPageName,
    )}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Marketing',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateFarmMarketingPage')
  async updateFarmMarketingPage(data) {
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findName(data?.originalData?.user?.id);
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let farm = await this.farmService.getFarmByUuid(params.farmId);
    let marketingPage = await this.marketingPageHomeService.getPageByUuid(
      params.pageId,
    );
    const url = this.baseUrl + '/farms/data/' + farm.farmName + '/filter';

    let fieldName;
    if (body.profile) {
      fieldName = 'Profile Info';
    } else if (body.galleryImages) {
      fieldName = 'Gallery Image';
    } else if (body.overview) {
      fieldName = 'Overview';
    } else if (body.mediaInfos) {
      fieldName = 'Media Info';
    }
    let additionalInfo = `Updated ${fieldName} on <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      farm.farmName,
    )}</a>’s profile page – update farm by marketing page id and farm id`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: params.farmId,
      stallionId: null,
      additionalInfo: additionalInfo,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Marketing',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  @OnEvent('updateStallionMarketingPage')
  async updateStallionMarketingPage(data) {
    let { body, ip, headers, params } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let user = await this.membersService.findName(data?.originalData?.user?.id);
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let stallion = await this.stallionService.getStallionWithFarm(
      params.stallionId,
    );
    let marketingPage = await this.marketingPageHomeService.getPageByUuid(
      params.pageId,
    );
    const farmUrl =
      this.baseUrl + '/farms/data/' + stallion.farmName + '/filter';
    const stallionUrl =
      this.baseUrl + '/stallions/data/' + stallion.horseName + '/filter';

    let fieldName;
    if (body.profile) {
      fieldName = 'Stallion Details';
    } else if (body.galleryImages) {
      fieldName = 'Hero Image Gallery';
    } else if (body.overview) {
      fieldName = 'Overview';
    }
    let additionalInfo = `Updated ${fieldName} on <a href="${stallionUrl}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      stallion.horseName,
    )}’s</a> page from <a href="${farmUrl}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      stallion.farmName,
    )}</a> – update farm by marketing page id and farm id`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createActivity = {
      activityTypeId: activityType?.id,
      farmId: stallion.farmId,
      stallionId: params.stallionId,
      additionalInfo: additionalInfo,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Marketing',
      reportType: null,
    };
    await this.activityRepository.save(createActivity);
  }

  //Add Horse with pedigree activity
  @OnEvent('addHorseWithPedigreeActivity')
  async addHorseWithPedigreeActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let { body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let mhData = body['data'][0][0]['horseData'];
    const url =
      this.baseUrl + '/horsedetails/data/' + mhData.horseName + '/horsefilter';
    let addHorse = `Added a new horse - <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      mhData.horseName,
    )}</a>`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.CREATE,
    );
    let createHorseActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: addHorse,
      attributeName: 'horseName',
      newValue: await this.commonUtilService.toTitleCase(mhData.horseName),
      oldValue: await data?.subscribedData?.oldValue,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Horses',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(createHorseActivity);
  }

  //Change horse pedigree activity
  @OnEvent('updateHorsePedigreeActivity')
  async updateHorsePedigree(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let { params, body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let horse = await this.horseService.findOne(params.horseId);
    let newPositionHorse = await this.horseService.findOne(body.newPedigreeId);
    const url =
      this.baseUrl + '/horsedetails/data/' + horse.horseName + '/horsefilter';
    let horsePedigreeUpdate = `The pedigree of <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      horse.horseName,
    )}</a> was changed.`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createHorseActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: horsePedigreeUpdate,
      attributeName: `position - (${body.pedigreePosition})`,
      newValue: await this.commonUtilService.toTitleCase(
        newPositionHorse.horseName,
      ),
      oldValue: null,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Horses',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(createHorseActivity);
  }

  //Horse Profile Image Update Activity
  @OnEvent('updateHorseProfileImageActivity')
  async updateHorseProfileImageActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let { params, body, ip, headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    let horse = await this.horseService.findOne(params.horseId);
    const url =
      this.baseUrl + '/horsedetails/data/' + horse.horseName + '/horsefilter';
    let horsePedigreeUpdate = `Added a profile image for <a href="${url}" class="systemTooltip">${await this.commonUtilService.toTitleCase(
      horse.horseName,
    )}</a>.`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createHorseActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: horsePedigreeUpdate,
      attributeName: `profileImage`,
      newValue: await this.commonUtilService.toTitleCase(horse.horseName),
      oldValue: null,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Horses',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(createHorseActivity);
  }

  //Update Horse Module Settings Activity
  @OnEvent('updateHorsePageSettingsActivity')
  async updateHorsePageSettingsActivity(data) {
    let user = await this.membersService.findOneForActivityBymemberId(
      data?.originalData?.user?.id,
    );
    let memberAddress = await this.memberAddressService.findMemberAddress(
      user.id,
    );
    let { headers } = await data?.originalData;
    const clientIp = requestIp.getClientIp(await data?.originalData);
    const url = this.baseUrl + '/horsedetails/data';
    let additionalInfo = `The <a href="${url}" class="systemTooltip">Eligibility Criteria</a> for Horse Details was changed.`;
    const activityType = await this.getActivityTypeByActivityTypeCode(
      activityTypes.UPDATE,
    );
    let createHorseActivity = {
      activityTypeId: activityType?.id,
      farmId: null,
      stallionId: null,
      additionalInfo: additionalInfo,
      attributeName: null,
      newValue: null,
      oldValue: null,
      ipAddress: clientIp,
      userAgent: headers['user-agent'],
      userName: user?.fullName,
      userEmail: user?.email,
      userCountryId: memberAddress?.countryId,
      createdBy: user?.id,
      createdOn: new Date(),
      result: 'Success',
      activityModule: 'Horses',
      reportType: null,
      entityId: null,
    };
    await this.activityRepository.save(createHorseActivity);
  }

  /*Get a Activity with activityCode */
  async getActivityTypeByActivityTypeCode(activityTypeCode: string) {
    const queryBuilder = getRepository(ActivityType)
      .createQueryBuilder('activityType')
      .select(
        'activityType.id, activityType.activityName, activityType.activityTypeCode',
      )
      .andWhere('activityType.activityTypeCode = :activityTypeCode', {
        activityTypeCode: activityTypeCode,
      });

    const record = await queryBuilder.getRawOne();
    return record;
  }
}
