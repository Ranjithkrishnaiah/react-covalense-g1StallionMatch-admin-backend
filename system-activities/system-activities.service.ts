import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { getRequiresApprovalSystemActivityList } from 'src/utils/common';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Brackets, Repository } from 'typeorm';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SystemActivity } from './entities/system-activity.entity';

@Injectable()
export class SystemActivitiesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(SystemActivity)
    private systemActivityRepository: Repository<SystemActivity>,
    private readonly commonUtilsService: CommonUtilsService,
  ) { }
  /* Get Activity List */
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<SystemActivity>> {
    const queryBuilder = this.systemActivityRepository
      .createQueryBuilder('sa')
      .select(
        'sa.id as eventId, sa.createdOn, sa.ipAddress as sourceIp, sa.additionalInfo as activity, sa.result, sa.activityModule, sa.userAgent',
      )
      .addSelect('sa.userName, sa.userEmail');

    if (searchOptionsDto.isRedirect) {
        queryBuilder
          .andWhere('sa.userEmail = :userEmail', {
            userEmail: searchOptionsDto.email,
          })
          .andWhere('sa.attributeName = :transactionId', {
            transactionId:'transactionId',
          });
    } 
    if (searchOptionsDto.countryId) {
      queryBuilder.andWhere('sa.userCountryId =:countryId', {
        countryId: searchOptionsDto.countryId,
      });
    }

    if (searchOptionsDto.farmName) {
      queryBuilder
        .innerJoin('sa.farm', 'farm')
        .andWhere('farm.farmName like :farmName', {
          farmName: `%${searchOptionsDto.farmName}%`,
        });
    }

    if (searchOptionsDto.horseName) {
      queryBuilder
        .innerJoin('sa.stallion', 'stallion')
        .innerJoin('stallion.horse', 'horse')
        .andWhere('horse.horseName like :horseName', {
          horseName: `%${searchOptionsDto.horseName}%`,
        });
    }

    if (searchOptionsDto.name) {
      queryBuilder.andWhere('sa.userName like :fullName', {
        fullName: `%${searchOptionsDto.name}%`,
      });
    }

    if (searchOptionsDto.email) {
      queryBuilder.andWhere('sa.userEmail =:email', {
        email: searchOptionsDto.email,
      });
    }

    if (searchOptionsDto.reportType) {
      queryBuilder.andWhere('sa.reportType =:reportType', {
        reportType: searchOptionsDto.reportType,
      });
    }

    if (searchOptionsDto.activity) {
      queryBuilder.andWhere('sa.additionalInfo like :additionalInfo', {
        additionalInfo: `%${searchOptionsDto.activity}%`,
      });
    }

    if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
      queryBuilder.andWhere('sa.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: await this.commonUtilsService.setHoursZero(
          searchOptionsDto.fromDate,
        ),
        toDate: await this.commonUtilsService.setToMidNight(
          searchOptionsDto.toDate,
        ),
      });
    }

    if (searchOptionsDto.result) {
      if(searchOptionsDto.result == 'Failed'){
        queryBuilder.andWhere('sa.result = :result', {
          result: searchOptionsDto.result,
        });
      }else if(searchOptionsDto.result == 'Successful'){
        queryBuilder.andWhere('sa.result = :result', {
          result: 'Success',
        });
      }
    }

    if (searchOptionsDto.isRequiredApproval) {
      let reqApprolist = getRequiresApprovalSystemActivityList();
      queryBuilder.andWhere(
        new Brackets((subQ) => {
          reqApprolist.forEach((element, index) => {
            if (index == 0) {
              subQ.where('sa.additionalInfo like :additionalInfo', {
                additionalInfo: `%${element}`,
              });
            } else {
              subQ.orWhere('sa.additionalInfo like :additionalInfo', {
                additionalInfo: `%${element}`,
              });
            }
          });
        }),
      );
    }

    if (searchOptionsDto.activityModule) {
      if(searchOptionsDto.activityModule ==='Users'){
        queryBuilder.andWhere('sa.reportType IS NOT NULL')
      }
      else{
        queryBuilder.andWhere('sa.activityModule =:activityModule', {
          activityModule: searchOptionsDto.activityModule,
        });
      }
    }
    queryBuilder.andWhere('sa.userName IS NOT NULL');
    if (searchOptionsDto.sortBy) {
      if (searchOptionsDto.sortBy.toLowerCase() === 'eventid') {
        queryBuilder.orderBy('sa.id', searchOptionsDto.order);
      } else if (searchOptionsDto.sortBy.toLowerCase() === 'username') {
        queryBuilder.orderBy('sa.userName', searchOptionsDto.order);
      } else {
        queryBuilder.orderBy('sa.createdOn', searchOptionsDto.order);
      }
    }

    queryBuilder
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    let entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

}
