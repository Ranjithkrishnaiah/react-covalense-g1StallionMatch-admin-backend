import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MareRequest } from './entities/mare-requests.entity';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class MareRequestsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MareRequest)
    private mareRequestRepository: Repository<MareRequest>,
    readonly configService: ConfigService,
  ) {}

  // Get request by uuid
  async getByUuid(mareRequestUuid: string){
    return await this.mareRequestRepository.findOne({mareRequestUuid});
  } 

  // Update request
  async updateRequest(mareRequestUuid: string,updateField){
    const entity = await this.getByUuid(mareRequestUuid);
    if(entity){
      const update = await this.mareRequestRepository.update({id:entity.id},updateField);
      if(update?.affected){
        entity['isApproved'] = true;
      }
    }
    return entity;
  }

  async getMareRequest(requestId:string){
    const queryBuilder = getRepository(MareRequest).createQueryBuilder('sr')
      .select('sr.mareRequestUuid as requestId, sr.horseName as horseName, sr.countryId as countryId, sr.yob as yob, sr.isApproved as isApproved')
      .addSelect('nationality.countryName as countryName')
      .innerJoin('sr.nationality','nationality')
      .andWhere('sr.mareRequestUuid = :requestId', {requestId:requestId});

    const entities = await queryBuilder.getRawOne();
    if(entities){
      entities['gender'] = "F";
    }
    return entities;
  }

}
