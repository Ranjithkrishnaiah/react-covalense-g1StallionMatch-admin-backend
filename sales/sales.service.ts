import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { SalesLot } from 'src/sales-lots/entities/sales-lots.entity';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Brackets, Repository, getRepository } from 'typeorm';
import { SalesRequestDto } from './dto/sales-request.dto';
import { SaleResponseDto } from './dto/sales-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';
import { Sales } from './entities/sales.entity';
import { SALES_STATUS } from 'src/utils/constants/common';

@Injectable()
export class SalesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Sales)
    private salesRepository: Repository<Sales>,
  ) { }
  // Get list of all sales
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<SaleResponseDto[]>> {
    let lotCountBuilder = getRepository(SalesLot)
      .createQueryBuilder('lots')
      .select('lots.salesId as salesId, count(*) as totalLots')
      .innerJoin('lots.salesLotInfoTemp', 'salesLotInfoTemp')
      .groupBy('lots.salesId');

    let lotVerifiedCountBuilder = getRepository(SalesLot)
      .createQueryBuilder('lots')
      .select('lots.salesId as salesId, count(*) as verifiedLots')
      .innerJoin('lots.salesLotInfoTemp', 'salesLotInfoTemp')
      .andWhere('lots.isVerified = 1')
      .groupBy('lots.salesId');

    const queryBuilder = this.salesRepository
      .createQueryBuilder('sales')
      .select(
        'sales.salesUuid as id, sales.id as salesId,sales.salesCode, sales.salesName, sales.startDate, sales.endDate,sales.statusId,salesCompany.salesCompanyName, sales.salesfileURL, sales.salesfileURLSDX,country.countryName, salesStatus.status,lots.totalLots,(100 * verifiedLots.verifiedLots/lots.totalLots)  as verifiedLots',
      )
      .leftJoin('sales.country', 'country')
      .leftJoin('sales.salesCompany', 'salesCompany')
      .leftJoin('sales.salesStatus', 'salesStatus')
      .leftJoin(
        '(' + lotVerifiedCountBuilder.getQuery() + ')',
        'verifiedLots',
        'verifiedLots.salesId=sales.id',
      )
      .leftJoin(
        '(' + lotCountBuilder.getQuery() + ')',
        'lots',
        'lots.salesId=sales.id',
      )
      .andWhere('sales.isActive = :isActive', { isActive: true });

    if (searchOptionsDto.salesName) {
      if (searchOptionsDto.isSalesNameExactSearch) {
        queryBuilder.andWhere('sales.salesName =:salesName', {
          salesName: searchOptionsDto.salesName,
        });
      } else {
        queryBuilder.andWhere('sales.salesName like :salesName', {
          salesName: `%${searchOptionsDto.salesName}%`,
        });
      }
    }
    if (searchOptionsDto.dateRange) {
      const dateRange = searchOptionsDto.dateRange;
      let dateList = dateRange.split('/');
      if (dateList.length === 2) {
        var minDate = dateList[0];
        var maxDate = dateList[1];
      }
      queryBuilder.andWhere('sales.startDate <= :endDate', {
        endDate: maxDate, 
      });
  
      queryBuilder.andWhere('sales.endDate >= :startDate', {
        startDate: minDate ,
      });
      // queryBuilder.andWhere(
      //   'sales.endDate  >= CONVERT(date, :minDate) AND sales.endDate <= CONVERT(date, :maxDate)',
      //   {
      //     minDate,
      //     maxDate,
      //   },
      // );
    }
    if (searchOptionsDto.countryId) {
      queryBuilder.andWhere('sales.countryId = :countryId', {
        countryId: searchOptionsDto.countryId,
      });
    }
    if (searchOptionsDto.salesStatus) {
      queryBuilder.andWhere('sales.statusId = :statusId', {
        statusId: searchOptionsDto.salesStatus,
      });
    }

    if (searchOptionsDto.salesCompanyId) {
      queryBuilder.andWhere('sales.salesCompanyId = :salesCompanyId', {
        salesCompanyId: searchOptionsDto.salesCompanyId,
      });
    }

    if (searchOptionsDto.salesInfoId) {
      queryBuilder.andWhere('sales.salesTypeId = :salesTypeId', {
        salesTypeId: searchOptionsDto.salesInfoId,
      });
    }

    queryBuilder.orderBy('sales.id', searchOptionsDto.order);

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      const byOrder = searchOptionsDto.order;
      if (sortBy.toLowerCase() === 'salesname') {
        queryBuilder.orderBy('sales.salesName', byOrder);
      }
      if (sortBy.toLowerCase() === 'salescompanyid') {
        queryBuilder.orderBy('salesCompany.salesCompanyName', byOrder);
      }
      if (sortBy.toLowerCase() === 'countryid') {
        queryBuilder.orderBy('country.countryName', byOrder);
      }
      if (sortBy.toLowerCase() === 'lots') {
        queryBuilder.orderBy('lots.totalLots', byOrder);
      }
      if (sortBy.toLowerCase() === 'startdate') {
        queryBuilder.orderBy('sales.startDate', byOrder);
      }
      if (sortBy.toLowerCase() === 'verified') {
        queryBuilder.orderBy('(100 * verifiedLots.verifiedLots/lots.totalLots) ', byOrder);
      }
      if (sortBy.toLowerCase() === 'status') {
        queryBuilder.orderBy('salesStatus.status', byOrder);
      }

    }
    queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });
    return new PageDto(entities, pageMetaDto);
  }

  // Create a new Sale
  async create(salesDto: SalesRequestDto) {
    const member = this.request.user;
    salesDto.createdBy = member['id'];
    salesDto.statusId = SALES_STATUS.IMPORT_REQUIRED;
    const record = await this.salesRepository.findOne({
      salesCode: salesDto.salesCode,
    });
    if (record) {
      throw new UnprocessableEntityException('The code must be unique!');
    }
    let response = await this.salesRepository.save(
      this.salesRepository.create(salesDto),
    );
    if (!response) {
      throw new InternalServerErrorException('Internal server exception!');
    }
    return {
      statusCode: 200,
      message: 'Sale data created sucessfully..',
      data: response,
    };
  }

  // Update Sale data
  async salesUpdate(id: string, data: UpdateSalesDto) {
    const sale = await this.getSalesById(id);
    const member = this.request.user;
    data.modifiedBy = member['id'];
    const response = await this.salesRepository.update(sale.salesId, data);
    if (response.affected) {
      return {
        statusCode: 200,
        message: 'Sale data updated sucessfully',
        data: response,
      };
    } else {
      return { statusCode: 200, message: 'No data updated ', data: response };
    }
  }

  // get specific sale data
  async getSalesById(id: string): Promise<any> {
    const record = this.salesRepository
      .createQueryBuilder('sales')
      .select(
        'sales.salesUuid as id,sales.id as salesId, sales.salesName, sales.salesCode,sales.startDate,sales.endDate,sales.countryId,sales.salesCompanyId,sales.salesInfoId,sales.isOnlineSales,sales.isPublic,sales.isHIP,sales.salesfileURL,sales.salesfileURLSDX,sales.statusId,sales.salesTypeId,sales.createdBy,sales.modifiedBy,sales.createdOn, sales.modifiedOn',
      )
      .andWhere('sales.salesUuid =:salesUuid', { salesUuid: id })
      .getRawOne();
    if (!record) {
      throw new UnprocessableEntityException('Sale not exist!');
    }
    return record;
  }

  async delete(id: string) {
    const record = await this.salesRepository.findOne({ salesUuid: id });
    if (!record) {
      throw new UnprocessableEntityException('Sale not exist!');
    }
    const response = await this.salesRepository.update(record.Id, {
      isActive: false,
    });

    if (response.affected)
      return {
        statusCode: HttpStatus.OK,
        message: 'Record Deleted successfully',
      };
  }

  async fetchCurrentMonthSales(month: string) {
    let dateList = month.split('/');
    if (dateList.length === 2) {
      var month = dateList[0];
      var year = dateList[1];
    }
    
    const queryBuilder = this.salesRepository
      .createQueryBuilder('sales')
      .select(
        'sales.id, sales.salesName, sales.startDate as startDate, sales.endDate as endDate',
      )
      .andWhere(
        '((year(sales.startDate) = :startYear AND month(sales.startDate) <= :startMonth) OR year(sales.startDate) < :startYear)',
        { startYear: year, startMonth: month },
      )
      .andWhere(
        '((year(sales.endDate) = :endYear AND month(sales.endDate) >= :endMonth) OR year(sales.endDate) > :endYear)',
        { endYear: year, endMonth: month },
      )
      .andWhere('sales.isActive = :isActive', { isActive: 1 });

    const entities = await queryBuilder.getRawMany();
    return entities;

  }
  async findSalesByLocation(fields) {
    let list = fields.countryId.split(',');
    const queryBuilder = this.salesRepository
      .createQueryBuilder('sale')
      .select(
        'sale.id as saleId, sale.salesName as salesName, sale.salesCode as salesCode',
      );
    if (fields.countryId) {
      // queryBuilder.andWhere('sale.countryId=:countryId', {
      //   countryId: fields.countryId,
      // });
      queryBuilder.andWhere('sale.countryId  IN (:...list)', {
        list: list
      })
        .andWhere('sale.isActive =:isActive', { isActive: 1 })

    }
    const entities = await queryBuilder.getRawMany();
    return entities;

  }
}
