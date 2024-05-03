import {
  HttpStatus,
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import * as requestIp from 'request-ip';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { Member } from 'src/members/entities/member.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Not, Repository } from 'typeorm';
import { HorsenameSearchOnlyDto } from './dto/horsename-search-only.dto';
import { MergeHorseDto } from './dto/merge-horse.dto';
import { Horse } from './entities/horse.entity';
import { ConfigService } from '@nestjs/config';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';

@Injectable({ scope: Scope.REQUEST })
export class HorseMergeService {
  baseUrl: string;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Horse)
    private horseRepository: Repository<Horse>,
    @InjectRepository(Stallion)
    private stallionRepository: Repository<Stallion>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberAddress)
    private memberAddressRepository: Repository<MemberAddress>,
    private readonly configService: ConfigService,
    private commonUtilService: CommonUtilsService,
  ) {
    this.baseUrl = this.configService.get('file.systemActivityAdminDashboard');
  }

  //Merge Horse
  async mergeHorses(mergeHorseDto: MergeHorseDto) {
    const member = this.request.user;
    const { masterHorseId, slaveHorseId } = mergeHorseDto;
    //Validate Master and Slave are not Archived
    const masterHorse = await this.horseRepository.findOne({
      horseUuid: masterHorseId,
      isArchived: Not(true),
    });
    const slaveHorse = await this.horseRepository.findOne({
      horseUuid: slaveHorseId,
      isArchived: Not(true),
    });
    if (!masterHorse || !slaveHorse) {
      throw new UnprocessableEntityException('Master/Slave Horse not exist!');
    }
    //Check Initiated Merge Requests
    const initiatedRequests = await this.horseRepository.manager.query(
      `EXEC procGetHorseMergeInitiatedRequests 
      @masterId=@0,
      @slaveId=@1`,
      [
        masterHorse.id,
        slaveHorse.id       
      ],
    );
    if (initiatedRequests.length) {      
      return {
        message: `Request already initiated!`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        title: null,  
        errorType: null     
      }
    }
    const slaveHorseStallions = await this.stallionRepository.find({
      horseId: slaveHorse.id,
    });
    //Validate Slave horse not assosiated with any stallion
    if (slaveHorseStallions.length > 0) {
      return {
        message: `${await this.commonUtilService.toTitleCase(slaveHorse.horseName)} (${slaveHorse.id}) was unable to be merged due to being used as a stallion. Redirect the stallion ${await this.commonUtilService.toTitleCase(slaveHorse.horseName)} and try again.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        title: `${await this.commonUtilService.toTitleCase(slaveHorse.horseName)} was not able to Merge!`,  
        errorType: 'STALLION_EXISTS_ON_HORSE'      
      }
    }
    const memberData = await this.memberRepository.findOne({
      id: member['id'],
    });

    const memberAddressData = await this.memberAddressRepository.findOne({
      memberId: memberData.id,
    });

    let { headers } = this.request;
    const ipAddress = requestIp.getClientIp(await this.request);
    const userAgent = headers['user-agent']

    const masterHorseUrl =
      this.baseUrl +
      '/horsedetails/data/' +
      masterHorse.horseName +
      '/horsefilter';
    
    const slaveHorseUrl =
      this.baseUrl +
      '/horsedetails/data/' +
      slaveHorse.horseName +
      '/horsefilter';

    let additionalInfo = `Merge Initiated - Merging <a href="${slaveHorseUrl}" class="systemTooltip">${await this.commonUtilService.toTitleCase(slaveHorse.horseName)}</a> with <a href="${masterHorseUrl}" class="systemTooltip">${await this.commonUtilService.toTitleCase(masterHorse.horseName)}</a>`;

    //Initiate Merge Activity
    await this.horseRepository.manager.query(
      `EXEC proc_SMPInitiateMergeJobProcess 
      @pSlavehorseid=@0,
      @pMasterhorseid=@1,
      @pcreatedBy=@2,
      @puserName=@3,
      @puserEmail=@4,
      @puserCountryId=@5,
      @pipAddress=@6,
      @puserAgent=@7,
      @padditionalInfo=@8`,
      [
        slaveHorse.id,
        masterHorse.id,
        memberData.id,
        memberData.fullName,
        memberData.email,
        memberAddressData.countryId,
        ipAddress,
        userAgent,
        additionalInfo,
      ],
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Horse merge request initiated!',
      title: null,  
      errorType: null   
    };
  }

  //Get Horse By Name Excluding Input Master Horse
  async horsesByNameExcludingMasterHorseId(masterHorseId, horseDto: HorsenameSearchOnlyDto) {
    return await this.horseRepository.manager.query(
      `EXEC procSearchHorseByNameExcludeInputHorseId 
      @phorseUuid=@0,
      @horseName=@1`,
      [
        masterHorseId,
        horseDto.horseName,
      ],
    );
  }
}
