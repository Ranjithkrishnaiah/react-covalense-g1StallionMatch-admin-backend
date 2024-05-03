import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { StallionRequest } from './entities/stallion-request.entity';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class StallionRequestsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionRequest)
    private stallionRequestRepository: Repository<StallionRequest>,
    readonly configService: ConfigService,
  ) {}

  // Get request by uuid
  async getByUuid(stallionRequestUuid: string){
    return await this.stallionRequestRepository.findOne({stallionRequestUuid});
  } 

  // Update request
  async updateRequest(stallionRequestUuid: string,updateField){
    const entity = await this.getByUuid(stallionRequestUuid);
    if(entity){
      const update = await this.stallionRequestRepository.update({id:entity.id},updateField);
      if(update?.affected){
        entity['isApproved'] = true;
      }
    }
    return entity;
  }

  async getStallionRequest(requestId:string){
    const queryBuilder = getRepository(StallionRequest).createQueryBuilder('sr')
      .select('sr.stallionRequestUuid as requestId, sr.horseName as horseName, sr.countryId as countryId, sr.yob as yob, sr.isApproved as isApproved')
      .addSelect('nationality.countryName as countryName')
      .innerJoin('sr.nationality','nationality')
      .andWhere('sr.stallionRequestUuid = :requestId', {requestId:requestId});

    const entities = await queryBuilder.getRawOne();
    if(entities){
      entities['gender'] = "M";
    }
    return entities;
  }

}
