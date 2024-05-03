import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ExcelService } from 'src/excel/excel.service';
import { DashboardDto } from 'src/messages/dto/dashboard.dto';
import { PricingService } from 'src/pricing/pricing.service';
import { PRODUCTSDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { SearchOptionsDto } from './dto/product-sort.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable({ scope: Scope.REQUEST })
export class ProductsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private pricingService: PricingService,
    private excelService: ExcelService,
    private readonly commonUtilsService: CommonUtilsService,
  ) {}

  //Get all products
  async findAll(pageOptionsDto: SearchOptionsDto): Promise<PageDto<Product>> {
    const queryBuilder = await this.productRepository
      .createQueryBuilder('product')
      .select(
        'product.id as id, product.productName, product.productCode, product.currencyId,product.isActive as active,product.createdOn as created,product.modifiedOn as updated',
      )
      .addSelect('category.categoryName as categoryName , productsMRRView.MRR as MRR')
      .leftJoin('product.productsMRRView', 'productsMRRView')
      .leftJoin('product.category', 'category');

    if (pageOptionsDto.sortBy) {
      const sortBy = pageOptionsDto.sortBy;
      const byOrder = pageOptionsDto.order;
      if (sortBy.toLowerCase() === 'productname') {
        queryBuilder.orderBy('product.productName', byOrder);
      }
      if (sortBy.toLowerCase() === 'categoryname') {
        queryBuilder.orderBy('category.categoryName', byOrder);
      }
      if (sortBy.toLowerCase() === 'created') {
        queryBuilder.orderBy('product.createdOn ', byOrder);
      }
      if (sortBy.toLowerCase() === 'updated') {
        queryBuilder.orderBy('product.modifiedOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'mrr') {
        queryBuilder.orderBy('productsMRRView.MRR', byOrder);
      }
      if (sortBy.toLowerCase() === 'active') {
        queryBuilder.orderBy('product.isActive', byOrder);
      }
      if (sortBy.toLowerCase() === 'id') {
        queryBuilder.orderBy('product.id', byOrder);
      }
    }
    queryBuilder.offset(pageOptionsDto.skip).limit(pageOptionsDto.limit);
    const entities = await queryBuilder.getRawMany();
    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOptionsDto,
    });
    return new PageDto(entities, pageMetaDto);
  }

  //Get a product
  findOne(fields: any) {
    return this.productRepository.findOne({
      where: fields,
    });
  }

  //Get a product details
  async findProductDetails(id: number) {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .select(
        'product.id ,product.productName,product.categoryId,product.price,product.currencyId,product.isActive,product.createdOn,product.modifiedon, productsMRRView.MRR as MMR,currency.currencyCode',
      )
      .leftJoin('product.currency', 'currency')
      .leftJoin('product.productsMRRView', 'productsMRRView')
      .andWhere('product.id = :id', { id: id });
    const entities = await products.getRawOne();
    return entities;
  }
  async create(data: CreateProductDto) {
    const user = this.request.user;
    const productObj = {
      createdBy: user['id'],
      productName: data.productName,
      categoryId: data.categoryId,
    };
    let price = JSON.parse(JSON.stringify(data.pricingTable));
    if (price.length > 0) {
      const foundProduct = await this.productRepository.findOne({
        productName: productObj.productName,
        categoryId: productObj.categoryId,
      });
      if (!foundProduct) {
        let product = await this.productRepository.save(
          this.productRepository.create(productObj),
        );
        price.forEach((element) => {
          const savePrice = this.pricingService.create({
            productId: product.id,
            ...element,
          });
        });
      } else {
        throw new HttpException(
          'You have already added this Product!',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Pricing_Not_Found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  //Update a product
  async update(id: number, data: UpdateProductDto) {
    const user = this.request.user;
    let found = await this.productRepository.findOne(id);
    const updateObj = {
      modifiedBy: user['id'],
      productName: data.productName,
      categoryId: data.categoryId,
      /* If input currencyId is 0 set it as 1
         Avoid FK constraints
      */
      currencyId: data.currencyId ? data.currencyId : 1,
      price: data.price,
      isActive: data.isActive,
    };
    if (found) {
      await this.productRepository.update(id, updateObj);
      let price = JSON.parse(JSON.stringify(data.pricingTable));
      if (price.length > 0) {
        price.forEach((element) => {
          this.pricingService.create({
            productId: id,
            ...element,
          });
        });
        return {
          statusCode: HttpStatus.OK,
          message: 'Product Updated Successfully',
        };
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Product_Not_Found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  //Get all products
  async findList() {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .select('product.id ,product.productName,product.categoryId')
      .andWhere('product.isActive =1')
    const entities = await products.getRawMany();
    return entities;
  }

  //Get Product Dashboard Data
  async getProductsDashboardData(dashboardDto: DashboardDto) {
    let result = await this.productRepository.manager.query(
      `EXEC procGetProductsDashboard @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );
    let respone = [];
    await result.map(async (record: any) => {
      let diffPercent = 0;
      if (record.PrevValue) {
        diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
      } else {
        diffPercent = Math.round(record.Diff / 0.01);
      }
      respone.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return respone;
  }

  //Get Dashborad Report Data
  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case PRODUCTSDASHBOARDKPI.NO_OF_PRODUCTS:
        qbQuery = `EXEC procGetProductsDashboardProductsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case PRODUCTSDASHBOARDKPI.NO_OF_PROMOCODES:
        qbQuery = `EXEC procGetProductsDashboardPromocodesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case PRODUCTSDASHBOARDKPI.MOST_POPULAR_PROMOCODES:
        qbQuery = `EXEC procGetProductsDashboardMostPopularPromocodesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case PRODUCTSDASHBOARDKPI.MOST_POPULAR_PRODUCTS:
        qbQuery = `EXEC procGetProductsDashboardMostPopularProductsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case PRODUCTSDASHBOARDKPI.ARPS:
        qbQuery = `EXEC procGetProductsDashboardARPSDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case PRODUCTSDASHBOARDKPI.ARPU:
        qbQuery = `EXEC procGetProductsDashboardARPU @paramDate1=@0, @paramDate2=@1, @isDownload=1`;
        break;
      case PRODUCTSDASHBOARDKPI.ARR:
        qbQuery = `EXEC procGetProductsDashboardARR @paramDate1=@0, @paramDate2=@1, @isDownload=1`;
        break;
      case PRODUCTSDASHBOARDKPI.CCR:
        qbQuery = `EXEC procGetProductsDashboardCCRDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case PRODUCTSDASHBOARDKPI.CLV:
        qbQuery = `EXEC procGetProductsDashboardCLVDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case PRODUCTSDASHBOARDKPI.MRR:
        qbQuery = `EXEC procGetProductsDashboardMRR @paramDate1=@0, @paramDate2=@1, @isDownload=1`;
        break;
      case PRODUCTSDASHBOARDKPI.SCR:
        qbQuery = `EXEC procGetProductsDashboardSCRDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case PRODUCTSDASHBOARDKPI.SLV:
        qbQuery = `EXEC procGetProductsDashboardSLVDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case PRODUCTSDASHBOARDKPI.SUCCESSFUL_PAYMENTS:
        qbQuery = `EXEC procGetProductsDashboardSuccessPayments @paramDate1=@0, @paramDate2=@1, @isDownload=1`;
        break;
      case PRODUCTSDASHBOARDKPI.REDEMTIONS:
        qbQuery = `EXEC procGetProductsDashboardRedemtionsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
    }
    if (qbQuery == '') {
      throw new NotFoundException('No Data Exist');
    }
    let result = await this.productRepository.manager.query(`${qbQuery}`, [
      options.fromDate,
      options.toDate,
    ]);
    if (result.length) {
      let headerList = [];
      let headersData = Object.keys(result[0]);
      await headersData.reduce(async (promise, item) => {
        await promise;
        item;
        let itemObj = {
          header: item,
          key: item,
          width: 30,
        };
        headerList.push(itemObj);
      }, Promise.resolve());
      const currentDateTime = new Date();
      let file = await this.excelService.generateReport(
        `Report`,
        headerList,
        result,
      );
      return file;
    } else {
      throw new NotFoundException('Data not found for the given date range!');
    }
  }

  //Get Redemptions Data
  async getRedemptionsData(dashboardDto: DashboardDto) {
    let result = await this.productRepository.manager.query(
      `EXEC procGetProductsDashboardRedemptionsGraph 
      @fromDate=@0, 
      @toDate=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );
    let currentTotal = 0;
    let previousTotal = 0;
    let finalResult = [];
    let rangeFrom = null;
    let rangeTo = null;
    await result.map(async (item, index) => {
      currentTotal = currentTotal + item.currRegRate;
      previousTotal = previousTotal + item.prevRegRate;
      switch (item.interval) {
        case 'DAY':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getDayFromDate(
              item.currdayDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getDayFromDate(item.currdayDate);
          }
          finalResult.push({
            label: this.commonUtilsService.getDayFromDate(item.currdayDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'WEEK':
          if (index === 0) {
            rangeFrom = `Week ${item.currWeekNumber}`;
          }
          if (index === result.length - 1) {
            rangeTo = `Week ${item.currWeekNumber}`;
          }
          finalResult.push({
            label: `Week ${item.currWeekNumber}`,
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'MONTH':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getMonthFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'YEAR':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getYearFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
      }
    });
    return {
      currentTotal,
      previousTotal,
      rangeFrom,
      rangeTo,
      result: finalResult,
    };
  }

  //Get Most Popular Promocodes Data
  async getMostPopularPromocodesData(dashboardDto: DashboardDto) {
    let result = await this.productRepository.manager.query(
      `EXEC procGetProductsDashboardMostPopularPromocodes @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );

    return result;
  }

  //Get Most Popular Products Data
  async getMostPopularProductsData(dashboardDto: DashboardDto) {
    let result = await this.productRepository.manager.query(
      `EXEC procGetProductsDashboardMostPopularProducts @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );

    return result;
  }
}
