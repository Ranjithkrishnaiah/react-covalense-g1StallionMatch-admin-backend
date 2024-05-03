import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { DashboardDto } from 'src/stallions/dto/dashboard.dto';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Repository, getRepository } from 'typeorm';
import { SearchStallionMatch } from './entities/search-stallion-match.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';

@Injectable({ scope: Scope.REQUEST })
export class SearchStallionMatchService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(SearchStallionMatch)
    private smRepository: Repository<SearchStallionMatch>,
    private readonly commonUtilsService: CommonUtilsService,
  ) {}

  async stallionMatchActivity(searchOptionsDto: DashboardDto) {
    const stallionResopnse = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as id')
      .andWhere('stallion.stallionUuid=:stallionId', {
        stallionId: searchOptionsDto.stallionId,
      })
      .getRawOne();

    if (!stallionResopnse) {
      throw new HttpException('Stallion not found', HttpStatus.NOT_FOUND);
    }

    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    const curr = new Date(); // get current date
    var groupByUsing = 'Month(ssm.createdOn)';
    let xKey = '';
    let daysOrMonthOrYear = [];
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'today') {
        fromDate = new Date();
        toDate = new Date();
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
        daysOrMonthOrYear = [fromDate.getDate()];
      }else if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        toDate = curr;
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
        daysOrMonthOrYear = await this.addMissingDaysOrMonthOrYear(fromDate,toDate,xKey);
      }else if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        fromDate = new Date(curr.setDate(first));
        toDate = new Date();
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
        daysOrMonthOrYear = await this.addMissingDaysOrMonthOrYear(fromDate,toDate,xKey);
      }else if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        // toDate = new Date(curr.getFullYear(), 11, 31);
        toDate = curr;
        groupByUsing = 'Month(ssm.createdOn)';
        xKey = 'months';
        daysOrMonthOrYear = await this.addMissingDaysOrMonthOrYear(fromDate, toDate,xKey);
      }else if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
          let fromYear = fromDate.getFullYear(), toYear = toDate.getFullYear();
          let fromMonth = fromDate.getMonth(), toMonth = toDate.getMonth();
          if(fromYear == toYear){
            if(fromMonth == toMonth){
              xKey = 'days';
              groupByUsing = 'Day(ssm.createdOn)';
            }else{
              xKey = 'months';
              groupByUsing = 'Month(ssm.createdOn)';
            }
          }else{
            xKey = 'years';
            groupByUsing = 'Year(ssm.createdOn)';
          }
          daysOrMonthOrYear = await this.addMissingDaysOrMonthOrYear(fromDate, toDate,xKey);
        }
      }
    }

    const smSearchesQuery = await getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select(
        'COUNT(ssm.id) as smSearches, SUM(CASE WHEN ssm.isTwentytwentyMatch = 1 THEN 1 ELSE 0 END) as ttMatches, SUM(CASE WHEN ssm.isPerfectMatch = 1 THEN 1 ELSE 0 END) as perfectMatches, ' +
          groupByUsing +
          ' as createdOn ',
      )
      .andWhere('ssm.stallionId=:stallionId', {
        stallionId: stallionResopnse.id,
      })
      .andWhere('ssm.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: await this.commonUtilsService.setHoursZero(fromDate),
        toDate: await this.commonUtilsService.setToMidNight(toDate),
      })
      .addGroupBy(groupByUsing)
      .addOrderBy(groupByUsing, 'ASC')
      .getRawMany();

    let totalSmSearches = 0,
      totalTtMatches = 0,
      totalPerfectMatches = 0;
    smSearchesQuery.forEach((element) => {
      totalSmSearches = totalSmSearches + element.smSearches;
      totalTtMatches = totalTtMatches + element.ttMatches;
      totalPerfectMatches = totalPerfectMatches + element.perfectMatches;
    });

    let newSmSearchesList = [];
    for (var item of daysOrMonthOrYear){
      let isAvailable = smSearchesQuery.find((a)=>{return a.createdOn == item});
      if(isAvailable){
        newSmSearchesList.push(isAvailable);
      }else{
        newSmSearchesList.push({ smSearches: 0, ttMatches: 0, perfectMatches: 0, createdOn: item })
      }
    }
    return [
      {
        data: newSmSearchesList,
        xKey,
        totalSmSearches,
        totalTtMatches,
        totalPerfectMatches,
      },
    ];
  }

  // add missing data with 0
  async addMissingDaysOrMonthOrYear(fromDate, toDate,xKey){
    let daysOrMonthOrYear = [];
    let start ,end;
    if(xKey === 'days'){
      start = fromDate.getDate();
      end = toDate.getDate();
      if(start > end){
        let y = fromDate.getFullYear(), m = fromDate.getMonth();
        let lastDay = new Date(y, m + 1, 0).getDate();
        for(let i=start; i<=lastDay; i++){
          daysOrMonthOrYear.push(i);
        }
        for(let i=1; i<=end; i++){
          daysOrMonthOrYear.push(i);
        }
      }else{
        for(let i=start; i<=end; i++){
          daysOrMonthOrYear.push(i);
        }
      }
    }else{
      if(xKey === 'months'){
        start = fromDate.getMonth()+1;
        end = toDate.getMonth()+1;
      }else if(xKey == 'years'){
        start = fromDate.getFullYear();
        end = toDate.getFullYear();
      }
      for(let i=start; i<=end; i++){
        daysOrMonthOrYear.push(i);
      }
    }
    return daysOrMonthOrYear;
  }
}
