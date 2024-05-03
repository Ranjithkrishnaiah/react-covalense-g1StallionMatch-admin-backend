import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/members/entities/member.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { StallionsService } from 'src/stallions/stallions.service';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { getRepository, Repository } from 'typeorm';
import { CreateStallionServiceFeeDto } from './dto/create-stallion-service-fee.dto';
import { pageOptionsDto } from './dto/page-option.dto';
import { studfeeChartDto } from './dto/stud-fee-chart.dto';
import { UpdateStallionServiceFeeDto } from './dto/update-stallion-service-fee.dto';
import { StallionServiceFee } from './entities/stallion-service-fee.entity';

@Injectable()
export class StallionServiceFeesService {
  constructor(
    @InjectRepository(StallionServiceFee)
    private stallionServiceFeeRepository: Repository<StallionServiceFee>,
  ) {}

  /*Create a stallion fee */
  async create(createDto: CreateStallionServiceFeeDto) {
    return this.stallionServiceFeeRepository.save(
      this.stallionServiceFeeRepository.create(createDto),
    );
  }

  /* Update stallion fee  */
  async update(id: number, updateDto: UpdateStallionServiceFeeDto) {
    return this.stallionServiceFeeRepository.update(
      { stallionId: id },
      updateDto,
    );
  }

  /* Get a stallion studfee history. */
  async studFeeHistory(id, pageOptionsDto: pageOptionsDto, isPagination) {
    let stallion = await getRepository(Stallion).findOne({ stallionUuid: id });
    const queryBuilder = await this.stallionServiceFeeRepository
      .createQueryBuilder('history')
      .select('DISTINCT history.feeYear as feeYear')
      .andWhere('history.stallionId = :stallionId', {
        stallionId: stallion.id,
      });
    if (pageOptionsDto.date) {
      const createdDateRange = pageOptionsDto.date;
      let dateList = createdDateRange.split('-');
      if (dateList.length === 2) {
        var minDate = dateList[0];
        var maxDate = dateList[1];
      }
      queryBuilder.andWhere(
        'history.feeYear >= CONVERT(int, :minDate) AND history.feeYear <= CONVERT(int, :maxDate)',
        {
          minDate,
          maxDate,
        },
      );
    }
    queryBuilder.orderBy('history.feeYear', 'DESC');
    const entities = await queryBuilder.getRawMany();
    var dataList = [];
    var record = {};
    if (entities.length) {
      for (let i = 0; i < entities.length; i++) {
        const response = await this.stallionServiceFeeRepository
          .createQueryBuilder('stallion')
          .select(
            'stallion.feeYear,stallion.fee,stallion.modifiedOn,stallion.modifiedBy',
          )
          .addSelect('member.fullName as fullName')
          .addSelect(
            'currency.currencyCode as currencyCode,currency.currencySymbol',
          )
          .leftJoin('stallion.member', 'member')
          .leftJoin('stallion.currency', 'currency')
          .andWhere('stallion.feeYear = :feeYear', {
            feeYear: entities[i].feeYear,
          })
          .andWhere('stallion.stallionId = :stallionId', {
            stallionId: stallion.id,
          })
          .orderBy('stallion.modifiedOn', 'DESC')
          .getRawMany();
        for (let j = 0; j < response.length; j++) {
          if (response.length > 1 &&  j!=response.length) {
            record = {
              year: response[j].feeYear,
              previousFee: response[j + 1]?.fee,
              updatedFee: response[j].fee,
              updatedOn: response[j].modifiedOn,
              updatedBy: response[j].fullName,
              currencyCode: response[j].currencyCode,
              currencySymbol: response[j].currencySymbol,
            };
          } else {
            record = {
              year: response[j].feeYear,
              previousFee: response[j].fee,
              updatedFee: response[j].fee,
              updatedOn: response[j].modifiedOn,
              updatedBy: response[j].fullName,
              currencyCode: response[j].currencyCode,
              currencySymbol: response[j].currencySymbol,
            };
          }
          dataList.push(record);
        }
      }
    }

    if (isPagination) {
      let result = dataList.slice(
        pageOptionsDto.skip,
        pageOptionsDto.skip + pageOptionsDto.limit,
      );
      const itemCount = dataList.length;
      const pageMetaDto = new PageMetaDto({
        itemCount,
        pageOptionsDto: pageOptionsDto,
      });
      return new PageDto(result, pageMetaDto);
    } else {
      return dataList;
    }
  }

  /* Get a stllion Studfee chart */
  async studFeeChart(id: string, searchByDate: studfeeChartDto) {
    let stallion = await getRepository(Stallion).findOne({ stallionUuid: id });
    const queryBuilder = await this.stallionServiceFeeRepository
      .createQueryBuilder('history')
      .select('DISTINCT history.feeYear as feeYear')
      .andWhere('history.feeYear IS NOT NULL')
      .andWhere('history.stallionId = :stallionId', {
        stallionId: stallion.id,
      });
    //   .getRawMany()

    var minDate; 
    var maxDate;
    if (searchByDate.date) {
      const createdDateRange = searchByDate.date;
      let dateList = createdDateRange.split('-');
      if (dateList.length === 2) {
        minDate = dateList[0];
        maxDate = dateList[1];
      }
      queryBuilder.andWhere(
        'history.feeYear >= CONVERT(int, :minDate) AND history.feeYear <= CONVERT(int, :maxDate)',
        {
          minDate,
          maxDate,
        },
      );
    }
    var feelist = [];
    const entities = await queryBuilder.getRawMany();
    if(entities.length == 0){
   //   let years:number = new Date(maxDate).getFullYear() - new Date(minDate).getFullYear() 
    let yr =[]
    let pr= []
      for (var i=new Date(minDate).getFullYear(); i<= new Date(maxDate).getFullYear(); i++) {
        yr.push( i );
        pr.push(0)
      }
      const response = {
        year: yr,
        price: pr,
      };
      return response;

    }
   
    if (entities.length) {
      for (let i = 0; i < entities.length; i++) {
        const fees = await this.stallionServiceFeeRepository
          .createQueryBuilder('studFee')
          .select('max (studFee.id) as studFeeId ')
          .andWhere('studFee.stallionId = :stallionId', {
            stallionId: stallion.id,
          })
          .andWhere('studFee.feeYear = :feeYear', {
            feeYear: entities[i].feeYear,
          })
          
        const average = await this.stallionServiceFeeRepository
          .createQueryBuilder('history')
          .select('history.fee as fee,history.id')
          .andWhere('history.feeYear IS NOT NULL')
          .innerJoin(
            '(' + fees.getQuery() + ')',
            'stud',
            'studFeeId=history.id',
          )
          .andWhere('history.stallionId = :stallionId', {
            stallionId: stallion.id,
          })
          .andWhere('history.feeYear = :feeYear', {
            feeYear: entities[i].feeYear,
          })
          .getRawOne();
        feelist.push(parseInt(average?.fee));
      }
      var feeYear = entities.map(function (item) {
        return item['feeYear'];
      });

      let newFeeYear = [];
      let newFeelist = [];

      if(minDate && maxDate){
        minDate = parseInt(minDate);
        maxDate = parseInt(maxDate);
        for(let i=minDate; i<=maxDate; i++){
          let index = feeYear.indexOf(i);
          if(index == -1){
            newFeeYear.push(i);
            newFeelist.push(0);
          }else{
            newFeeYear.push(feeYear[index]);
            newFeelist.push(feelist[index]);
          }
        }
      }     
    
      const response = {
        year: newFeeYear,
        price: newFeelist,
      };
      return response;
    }
  }
}
