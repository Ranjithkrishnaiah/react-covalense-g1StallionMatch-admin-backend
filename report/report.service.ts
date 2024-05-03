import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { Country } from 'src/country/entity/country.entity';
import { ExcelService } from 'src/excel/excel.service';
import { Farm } from 'src/farms/entities/farm.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { MailService } from 'src/mail/mail.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { DashboardDto } from 'src/messages/dto/dashboard.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { OrderReportStatusService } from 'src/order-report-status/order-report-status.service';
import { OrderTransaction } from 'src/order-transaction/entities/order-transaction.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Sales } from 'src/sales/entities/sales.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { REPORTDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { notificationTemplates } from 'src/utils/constants/notifications';
import { productCodeList } from 'src/utils/constants/product-code-list';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Connection, getRepository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { DashboardOrdersByCountryDto } from './dto/dashboard-orders-bycountry.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { ReportSearchOptionsDownloadDto } from './dto/report-search-options-download.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SearchOrdersOptionsDto } from './dto/search-orders-options.dto';
import { SearchValuableUserDto } from './dto/search-valuable-user.dto';
import { ValuableUserResponse } from './dto/valuable-user-response.dto';
import { ConfigService } from '@nestjs/config';
import { ORDER_STATUS, ordersStatusList } from 'src/utils/constants/common';
import { OrderStatusService } from 'src/order-status/order-status.service';

@Injectable()
export class ReportService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly connection: Connection,
    private excelService: ExcelService,
    private mailService: MailService,
    private orderReportStatusService: OrderReportStatusService,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    private readonly orderStatusService :OrderStatusService
  ) {}

  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  /* Get Report Order List */
  async findAll(searchOrdersOptionsDto: SearchOrdersOptionsDto) {
    const selectedCodes = [
      productCodeList.REPORT_SHORTLIST_STALLION,
      productCodeList.REPORT_STALLION_MATCH_PRO,
      productCodeList.REPORT_BROODMARE_AFFINITY,
      productCodeList.REPORT_STALLION_MATCH_SALES,
      productCodeList.REPORT_STALLION_AFFINITY,
      productCodeList.REPORT_BROODMARE_SIRE,
      productCodeList.REPORT_STALLION_BREEDING_STOCK_SALE 
      
    ];
    const selectedProduct= [
      productCodeList.BOOST_LOCAL,
      productCodeList.NOMINATION_STALLION,
      productCodeList.PROMOTION_STALLION,
      productCodeList.BOOST_EXTENDED,
   
    ];
    const queryBuilder = getRepository(OrderTransaction)
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.id as orderTransactionId, orderTransaction.paymentIntent as paymentIntent,orderTransaction.mode as paymentMode, orderTransaction.status as transactionStatus,orderTransaction.total as total,orderTransaction.subTotal as subTotal,orderTransaction.discount as discount, orderTransaction.createdOn as orderCreatedOn',
      )
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect(
        'product.id as productId, product.productName as productName,product.productCode as productCode',
      )
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect(
        'order.id as orderId, order.fullName as clientName, order.email as email',
      )
      .addSelect(
        'country.countryCode as countryCode, country.countryName as countryName',
      )
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'orderproduct.quantity as noOfStallions, orderproduct.orderProductUuid as orderProductId, orderproduct.id as ordProductId, orderproduct.pdfLink as reportLink, orderproduct.isLinkActive as isLinkActive',
      )
      .addSelect(
        'order.createdOn'      
      )
    
      .innerJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .leftJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .innerJoin('orderTransaction.orderproduct', 'orderproduct')
      .innerJoin('orderproduct.orderReportStatus','orderReportStatus')
      .innerJoin('orderproduct.order', 'order')
      .innerJoin('order.country', 'country')
      .innerJoin('order.currency', 'currency')
      .innerJoin('orderproduct.product', 'product')
      .andWhere('product.productCode IN (:...codes)', {
        codes: selectedCodes,
      })

       queryBuilder.distinct(true)
      
    if (searchOrdersOptionsDto.countryId) {
      queryBuilder
        .innerJoin('order.member', 'member')
        //.innerJoin('member.memberaddresses', 'memberAddresses');
    }

    if (searchOrdersOptionsDto.companyName) {
      if (!searchOrdersOptionsDto.countryId) {
        queryBuilder.innerJoin('order.member', 'member');
      }

      queryBuilder
        .innerJoin('member.memberfarms', 'memberfarms')
        .innerJoin('memberfarms.farm', 'farm');
    }

    if (searchOrdersOptionsDto.sireName) {
      let sireQuery = getRepository(Horse)
        .createQueryBuilder('sHorse')
        .select('sHorse.id as sId, sHorse.horseName as sHorseName');

      queryBuilder
        .innerJoin('orderproduct.orderProductItem', 'orderProductItem')
        .leftJoin('orderProductItem.horse', 'horse')
        .leftJoin('orderProductItem.stallion', 'stallion')
        .leftJoin('stallion.horse', 'hrs')
        .innerJoin(
          '(' + sireQuery.getQuery() + ')',
          'sire',
          'sId=horse.sireId OR sId = hrs.sireId',
        );

      if (searchOrdersOptionsDto.isSireNameExactSearch) {
        queryBuilder.andWhere('sire.sHorseName = :sireName', {
          sireName: searchOrdersOptionsDto.sireName,
        });
      } else {
        queryBuilder.andWhere('sire.sHorseName like :sireName', {
          sireName: '%' + searchOrdersOptionsDto.sireName + '%',
        });
      }
    }

    if (searchOrdersOptionsDto.damName) {
      let damQuery = getRepository(Horse)
        .createQueryBuilder('dHorse')
        .select('dHorse.id as dId, dHorse.horseName as dHorseName');

      if (!searchOrdersOptionsDto.sireName) {
        queryBuilder
          .innerJoin('orderproduct.orderProductItem', 'orderProductItem')
          .leftJoin('orderProductItem.horse', 'horse')
          .leftJoin('orderProductItem.stallion', 'stallion')
          .leftJoin('stallion.horse', 'hrs');
      }
      queryBuilder.innerJoin(
        '(' + damQuery.getQuery() + ')',
        'dam',
        'dId=horse.damId OR dId = hrs.damId',
      );

      if (searchOrdersOptionsDto.isDamNameExactSearch) {
        queryBuilder.andWhere('dam.dHorseName = :damName', {
          damName: searchOrdersOptionsDto.damName,
        });
      } else {
        queryBuilder.andWhere('dam.dHorseName like :damName', {
          damName: '%' + searchOrdersOptionsDto.damName + '%',
        });
      }
    }

    if (searchOrdersOptionsDto.companyName) {
      if (searchOrdersOptionsDto.isCompanyNameExactSearch) {
        queryBuilder.andWhere('farm.farmName = :farmName', {
          farmName: searchOrdersOptionsDto.companyName,
        });
      } else {
        queryBuilder.andWhere('farm.farmName like :farmName', {
          farmName: '%' + searchOrdersOptionsDto.companyName + '%',
        });
      }
    }

    if (searchOrdersOptionsDto.name) {
      if (searchOrdersOptionsDto.isNameExactSearch) {
        queryBuilder.andWhere('order.fullName = :name', {
          name: searchOrdersOptionsDto.name,
        });
      } else {
        queryBuilder.andWhere('order.fullName like :name', {
          name: '%' + searchOrdersOptionsDto.name + '%',
        });
      }
    }

    if (searchOrdersOptionsDto.email) {
      // if (searchOrdersOptionsDto.isEmailExactSearch) {
      //   queryBuilder.andWhere('order.email = :email', {
      //     email: searchOrdersOptionsDto.email,
      //   });
      // } else {
      queryBuilder.andWhere('order.email like :email', {
        email: '%' + searchOrdersOptionsDto.email + '%',
      });
      // }
    }

    if (searchOrdersOptionsDto.date) {
      let dateRange = searchOrdersOptionsDto.date.split('/');
      queryBuilder.andWhere(
        'orderTransaction.createdOn BETWEEN :fromDate AND :toDate',
        {
          fromDate: await this.setHoursZero(dateRange[0]),
          toDate: await this.setToMidNight(dateRange[1]),
        },
      );
    }

    if (searchOrdersOptionsDto.reportId) {
      if(searchOrdersOptionsDto.isRedirect){
        queryBuilder.andWhere('product.productCode IN (:...codes)', {
          codes:[...selectedProduct,...selectedCodes]
        })
        queryBuilder.distinct(true)
      }
      queryBuilder.andWhere('product.id = :productId', {
        productId: searchOrdersOptionsDto.reportId,
      })
     
    }

    if (searchOrdersOptionsDto.orderId) {
      queryBuilder.andWhere('order.id = :orderId', {
        orderId: searchOrdersOptionsDto.orderId,
      });
    }

    if (searchOrdersOptionsDto.initiatedDate) {
      let dateRange = searchOrdersOptionsDto.initiatedDate.split('/');
      queryBuilder.andWhere(
        'orderReportStatus.createdOn BETWEEN :fromDate AND :toDate AND orderproduct.orderStatusId >= 2',
        {
          fromDate: await this.setHoursZero(dateRange[0]),
          toDate: await this.setToMidNight(dateRange[1]),
        },
      );
    }

    if (searchOrdersOptionsDto.completedDate) {
      let dateRange = searchOrdersOptionsDto.completedDate.split('/');
      queryBuilder.andWhere(
        'orderReportStatus.createdOn BETWEEN :fromDate AND :toDate AND orderproduct.orderStatusId >= 3',
        {
          fromDate: await this.setHoursZero(dateRange[0]),
          toDate: await this.setToMidNight(dateRange[1]),
        },
      );
    }

    if (searchOrdersOptionsDto.deliveredDate) {
      let dateRange = searchOrdersOptionsDto.deliveredDate.split('/');
      queryBuilder.andWhere(
        'orderReportStatus.createdOn BETWEEN :fromDate AND :toDate AND orderproduct.orderStatusId >= 4',
        {
          fromDate: await this.setHoursZero(dateRange[0]),
          toDate: await this.setToMidNight(dateRange[1]),
        },
      );
    }

    if (searchOrdersOptionsDto.orderStatusId) {
      queryBuilder.andWhere('orderproduct.orderStatusId = :orderStatusId', {
        orderStatusId: searchOrdersOptionsDto.orderStatusId,
      });
    }

    if (searchOrdersOptionsDto.countryId) {
      queryBuilder.andWhere('country.id = :countryId', {
        countryId: searchOrdersOptionsDto.countryId,
      });
    }

    if (searchOrdersOptionsDto.paymentMethodId) {
      queryBuilder.andWhere(
        'orderTransaction.paymentMethod = :paymentMethodId',
        { paymentMethodId: searchOrdersOptionsDto.paymentMethodId },
      );
    }

    if (searchOrdersOptionsDto.currencyId) {
      queryBuilder.andWhere('order.currencyId = :currencyId', {
        currencyId: searchOrdersOptionsDto.currencyId,
      });
    }

    let minPrice = 0;
    if (searchOrdersOptionsDto.minPrice) {
      minPrice = searchOrdersOptionsDto.minPrice;
    }
    if (searchOrdersOptionsDto.maxPrice) {
      queryBuilder
        .andWhere('orderTransaction.total >= :minPrice', {
          minPrice: minPrice,
        })
        .andWhere('orderTransaction.total <= :maxPrice', {
          maxPrice: searchOrdersOptionsDto.maxPrice,
        });
    }

    if (searchOrdersOptionsDto.isRequeiredApproval) {
      let reports = [
        productCodeList.REPORT_STALLION_MATCH_SALES,
        productCodeList.REPORT_STALLION_MATCH_PRO,
        productCodeList.REPORT_STALLION_AFFINITY,
        productCodeList.REPORT_SHORTLIST_STALLION,
        productCodeList.REPORT_BROODMARE_SIRE,
        productCodeList.REPORT_BROODMARE_AFFINITY,
      ];
      queryBuilder
        .andWhere('orderproduct.orderStatusId <= 2')
        .andWhere('product.productCode IN (:...productList)', {
          productList: reports,
        });
    }
    if (searchOrdersOptionsDto.sortBy) {
      let sortBy = searchOrdersOptionsDto.sortBy.toLowerCase();
      if (sortBy === 'name') {
        queryBuilder.orderBy('order.fullName', searchOrdersOptionsDto.order);
      } else if (sortBy === 'email') {
        queryBuilder.orderBy('order.email', searchOrdersOptionsDto.order);
      } else if (sortBy === 'createdon') {
        queryBuilder.orderBy('order.createdOn', searchOrdersOptionsDto.order);
      } else if (sortBy === 'status') {
        queryBuilder.orderBy(
          'orderTransaction.status',
          searchOrdersOptionsDto.order,
        );
      } else if (sortBy === 'pdf') {
        queryBuilder.orderBy(
          'orderproduct.pdfLink',
          searchOrdersOptionsDto.order,
        );
      } else if (sortBy === 'report') {
        queryBuilder.orderBy(
          'product.productName',
          searchOrdersOptionsDto.order,
        );
      } else if (sortBy === 'country') {
        queryBuilder.orderBy(
          'country.countryName',
          searchOrdersOptionsDto.order,
        );
      } else if (sortBy === 'paid') {
        queryBuilder.orderBy(
          'orderTransaction.total',
          searchOrdersOptionsDto.order,
        );
      } else {
        queryBuilder.orderBy(
          'orderTransaction.id',
          searchOrdersOptionsDto.order,
        );
      }
    } else {
      queryBuilder.orderBy('order.createdOn', searchOrdersOptionsDto.order);
    }

    const entitiesBeforePaging = await queryBuilder.getRawMany();

    queryBuilder
      .offset(searchOrdersOptionsDto.skip)
      .limit(searchOrdersOptionsDto.limit);

    const itemCount = entitiesBeforePaging.length;
    const entities = await queryBuilder.getRawMany();
    let newentities = await this.setOrderStatuses(entities);

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOrdersOptionsDto,
    });

    return new PageDto(newentities, pageMetaDto);
  }
  /* Set Date To Midnight */
  async setToMidNight(date) {
    date = new Date(date);
    date.setHours(23, 59, 59, 999);
    return date;
  }
  /* Set Hours To zero */
  async setHoursZero(date) {
    date = new Date(date);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  /* Update Order Status */
  async setOrderStatuses(list) {
    for (let item of list) {
      if (item) {
        item.statuses =
          await this.orderReportStatusService.findByOrderProductId(
            item.ordProductId,
          );

        if (
          item.productCode === productCodeList.REPORT_SHORTLIST_STALLION ||
          item.productCode === productCodeList.REPORT_STALLION_MATCH_PRO
        ) {
          await this.setHorseData(item, null);
        } else if (
          item.productCode === productCodeList.REPORT_BROODMARE_AFFINITY ||
          item.productCode === productCodeList.REPORT_STALLION_AFFINITY ||
          item.productCode === productCodeList.REPORT_BROODMARE_SIRE
        ) {
          await this.getHorseDetails(item);
        } else if (
          item.productCode === productCodeList.REPORT_STALLION_MATCH_SALES ||
          item.productCode === productCodeList.REPORT_STALLION_BREEDING_STOCK_SALE
        ) {
          await this.getSalesList(item);
        }
      }
    }
    return list;
  }
  /* Set Order Status */
  async setOrderStatus(list) {
    for (let item of list) {
      if (item) {
        item.statuses =
          await this.orderReportStatusService.findByOrderProductId(
            item.ordProductId,
          );
      }
    }
    return list;
  }
  /* Get Horse Details */
  async getHorseDetails(order) {
    const hQueryBuilder = getRepository(Horse)
      .createQueryBuilder('horse')
      .select(
        'horse.id as horsId, horse.sireId as sireId, horse.damId as damId, horse.horseName as horseName, horse.yob as horseYob',
      )
      .addSelect('country.countryCode as horseCob')
      .innerJoin('horse.nationality', 'country');

    const queryBuilder = getRepository(OrderProductItem)
      .createQueryBuilder('orderProductItem')
      .select(
        'orderProductItem.stallionId as stallionId, sireId, damId, horsId, horseName, horseYob, horseCob',
      );

    if (
      order.productCode === productCodeList.REPORT_SHORTLIST_STALLION ||
      order.productCode === productCodeList.REPORT_BROODMARE_AFFINITY ||
      order.productCode === productCodeList.REPORT_BROODMARE_SIRE
    ) {
      queryBuilder.innerJoin(
        '(' + hQueryBuilder.getQuery() + ')',
        'hors',
        'horsId = orderProductItem.mareId',
      );
    } else if (order.productCode === productCodeList.REPORT_STALLION_AFFINITY) {
      queryBuilder
        .innerJoin(
          'orderProductItem.stallion',
          'stallion',
          'stallion.id = orderProductItem.stallionId',
        )
        .innerJoin(
          '(' + hQueryBuilder.getQuery() + ')',
          'hors',
          'horsId = stallion.horseId',
        );
    }

    queryBuilder.andWhere('orderProductItem.orderProductId = :orderProductId', {
      orderProductId: order.ordProductId,
    });

    const horse = await queryBuilder.getRawOne();
    await this.setHorseData(order, horse);
  }
  /* Set Horse data */
  async setHorseData(order, horse) {
    order.horseId = horse && horse.horsId ? horse.horsId : null;
    order.horseName = horse && horse.horseName ? horse.horseName : null;
    order.horseYob = horse && horse.horseYob ? horse.horseYob : null;
    order.horseCob = horse && horse.horseCob ? horse.horseCob : null;
    order.stallionId = horse && horse.stallionId ? horse.stallionId : null;
    order.sales = [];
  }
  /* Get Sales By OrderProductId */
  async getSalesList(order) {
    const queryBuilder = getRepository(OrderProductItem)
      .createQueryBuilder('orderProductItem')
      .select('orderProductItem.sales as sales')
      .andWhere('orderProductItem.orderProductId = :orderProductId', {
        orderProductId: order.ordProductId,
      });

    const salesData = await queryBuilder.getRawOne();
    if (salesData && salesData.sales) {
      const salesQueryBuilder = getRepository(Sales)
        .createQueryBuilder('sales')
        .select(
          'sales.id as salesId, sales.salesName as salesName, YEAR(sales.startDate) as saleYear',
        )
        .andWhere('sales.id IN (:...salesIds)', {
          salesIds: salesData.sales.split(','),
        });
      const sales = await salesQueryBuilder.getRawMany();
      order.sales = sales;
    } else {
      order.sales = [];
    }
    order.horseId = null;
    order.horseName = null;
    order.horseYob = null;
    order.horseCob = null;
    order.stallionId = null;
  }
  /* Get Valuable Users */
  async findValuableUsers(
    searchOptionsDto: SearchValuableUserDto,
  ): Promise<ValuableUserResponse[]> {
    let queryBuilder = getRepository(OrderTransaction)
      .createQueryBuilder('ordTrans')
      .select(
        'ordTrans.memberId as memberId, sum(ordTrans.total) total, count(ordTrans.memberId) count',
      )
      .groupBy('ordTrans.memberId');

    let orderQueryBuilder = getRepository(Order)
      .createQueryBuilder('order')
      .select('DISTINCT order.memberId as memberId')
      .addSelect('member.fullName as clientName, member.email as email')
      .addSelect('ordTrans.total as total, ordTrans.count as count')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .innerJoin('order.member', 'member', 'member.id=order.memberId')
      .innerJoin('order.currency', 'currency')
      .innerJoin(
        '(' + queryBuilder.getQuery() + ')',
        'ordTrans',
        'ordTrans.memberId=order.memberId',
      );

    if (searchOptionsDto.fromDate && searchOptionsDto.toData) {
      orderQueryBuilder
        .andWhere('order.createdOn >= :fromDate', {
          fromDate: new Date(searchOptionsDto.fromDate),
        })
        .andWhere('order.createdOn <= :toData', {
          toData: new Date(searchOptionsDto.toData),
        });
    }

    orderQueryBuilder.orderBy('total', 'DESC');

    orderQueryBuilder
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const entities = await orderQueryBuilder.getRawMany();
    return entities;
  }

  /* Get Popular Location */
  async findPopularLocation(searchOptionsDto: SearchOptionsDto) {
    let queryBuilder = getRepository(OrderTransaction)
      .createQueryBuilder('ordTrans')
      .select(
        'ordTrans.memberId as memberId, sum(ordTrans.total) total, count(ordTrans.memberId) count, ordTrans.createdOn as createdOn,',
      )
      .groupBy('ordTrans.memberId');

    let orderQueryBuilder = getRepository(Order)
      .createQueryBuilder('order')
      .select('DISTINCT order.memberId as memberId')
      .innerJoin(
        '(' + queryBuilder.getQuery() + ')',
        'ordTrans',
        'ordTrans.memberId=order.memberId',
      )
      .orderBy('total', 'DESC');

    if (searchOptionsDto.fromDate && searchOptionsDto.toData) {
      orderQueryBuilder
        .andWhere('ordTrans.createdOn >= :fromDate', {
          fromDate: new Date(searchOptionsDto.fromDate),
        })
        .andWhere('ordTrans.createdOn <= :toData', {
          toData: new Date(searchOptionsDto.toData),
        });
    }
    orderQueryBuilder
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const entities = await orderQueryBuilder.getRawMany();
    return entities;
  }
  /* Get Report Details */
  async findOne(id: string) {
    const queryBuilder = getRepository(OrderTransaction)
      .createQueryBuilder('orderTransaction')
      .select(
        'DISTINCT(orderTransaction.id) as orderTransactionId, orderTransaction.paymentIntent as paymentIntent,orderTransaction.mode as paymentMode, orderTransaction.status as transactionStatus,orderTransaction.total as total,orderTransaction.subTotal as subTotal,orderTransaction.discount as discount, orderTransaction.createdOn as orderCreatedOn, COALESCE(orderTransaction.taxValue, 0) as tax,orderTransaction.taxPercent as taxPercent',
      )
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect(
        'product.id as productId, product.productName as productName, product.productCode as productCode',
      )
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect(
        'order.id as orderId, order.fullName as clientName, order.email as email',
      )
      .addSelect('country.id as countryId, country.countryCode as countryCode')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.id as currencyId, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'orderstatuses.status as status, orderReportStatus.createdOn as statusTime',
      )
      .addSelect('coupon.promoCode as promoCode')
      .addSelect(
        'orderproduct.quantity as noOfStallions, orderproduct.orderProductUuid as orderProductId, orderproduct.pdfLink as reportLink, orderproduct.isLinkActive as isLinkActive, orderproduct.selectedPriceRange as selectedPriceRange,orderproduct.price as price',
      )
      .leftJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .leftJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .innerJoin('orderTransaction.orderproduct', 'orderproduct')
      .innerJoin('orderproduct.order', 'order')
      .leftJoin('orderproduct.orderReportStatus', 'orderReportStatus')
      .leftJoin('orderReportStatus.orderStatus', 'orderStatus')
      .leftJoin(
        'orderproduct.orderstatus',
        'orderstatuses',
        'orderstatuses.id = orderproduct.orderStatusId',
      )
      .leftJoin('order.country', 'country')
      .leftJoin('order.currency', 'currency')
      .leftJoin('orderTransaction.coupon', 'coupon')
      .innerJoin('orderproduct.product', 'product')
      .andWhere('orderproduct.orderProductUuid =:id', { id: id });

    const entity = await queryBuilder.getRawOne();

    if (entity) {
      if (
        entity['productCode'] == productCodeList.REPORT_SHORTLIST_STALLION ||
        entity['productCode'] == productCodeList.REPORT_STALLION_MATCH_PRO ||
        entity['productCode'] == productCodeList.REPORT_BROODMARE_AFFINITY ||
        entity['productCode'] == productCodeList.REPORT_STALLION_AFFINITY ||
        entity['productCode'] == productCodeList.REPORT_BROODMARE_SIRE ||
        entity['productCode'] ==
          productCodeList.REPORT_STALLION_BREEDING_STOCK_SALE
      ) {
        await this.getOrderProductItemHorseDetails(entity);
      }
      if (entity) {
        let record;
        const pQueryBuilder = getRepository(OrderProduct)
          .createQueryBuilder('op')
          .select('op.orderProductUuid as orderProductId')
          .addSelect(
            'orderProductItem.stallionId as stallionId, orderProductItem.commonList as commonList, orderProductItem.sales, orderProductItem.lotId',
          )
          .innerJoin('op.orderProductItem', 'orderProductItem')
          .andWhere('op.orderId = :orderId', { orderId: entity.orderId });

        if (
          entity['productCode'] == productCodeList.REPORT_SHORTLIST_STALLION ||
          entity['productCode'] == productCodeList.REPORT_STALLION_MATCH_PRO
        ) {
          record = await pQueryBuilder.getRawMany();
        } else {
          record = await pQueryBuilder.getRawOne();
        }
        if (record) {
          if (
            entity['productCode'] ==
              productCodeList.REPORT_SHORTLIST_STALLION ||
            entity['productCode'] == productCodeList.REPORT_STALLION_MATCH_PRO
          ) {
            let stallionIds = [];
            record.forEach((element) => {
              stallionIds.push(element.stallionId);
            });
            if (stallionIds.length > 0) {
              entity['stallions'] = await this.getStallions(stallionIds);
            }
          } else if (
            record.commonList &&
            (entity['productCode'] ==
              productCodeList.REPORT_BROODMARE_AFFINITY ||
              entity['productCode'] == productCodeList.REPORT_BROODMARE_SIRE)
          ) {
            entity['stallions'] = await this.getStallionsByLocation(
              record.commonList.split(','),
            );
            entity['locationIds'] = record.commonList.split(',');
          } else if (
            record.commonList &&
            (entity['productCode'] ==
              productCodeList.REPORT_STALLION_MATCH_SALES ||
              entity['productCode'] ==
                productCodeList.REPORT_STALLION_BREEDING_STOCK_SALE)
          ) {
            if (record.sales) {
              const salesArr = record.sales.split(',');
              entity.sales = await Promise.all(
                salesArr.map(async (element) => {
                  const saleQueryBuilder = await getRepository(Sales)
                    .createQueryBuilder('sales')
                    .select('sales.salesName, sales.isHIP')
                    .addSelect('salesType.salesTypeName as salesType')
                    .innerJoin('sales.salesType', 'salesType')
                    .andWhere('sales.id =:id', { id: element })
                    .getRawOne();

                  return {
                    id: element,
                    salesName: saleQueryBuilder.salesName,
                    isHip: saleQueryBuilder.isHIP,
                    salesType: saleQueryBuilder.salesType,
                  };
                }),
              );
            }

            let salesLot = [];

            const pQueryBuilder = getRepository(OrderProduct)
              .createQueryBuilder('op')
              .select('op.orderProductUuid as orderProductId')
              .addSelect('orderProductItem.lotId')
              .innerJoin('op.orderProductItem', 'orderProductItem')
              .andWhere('op.orderId = :orderId', { orderId: entity.orderId });

            const lotsLidt = await pQueryBuilder.getRawMany();

            lotsLidt.forEach(async (element) => {
              salesLot.push(element.lotId);
            });
            entity.lotId = salesLot;

            entity['locationIds'] = record.commonList.split(',');
          } else if (
            record.commonList &&
            entity['productCode'] == productCodeList.REPORT_STALLION_AFFINITY
          ) {
            entity['farms'] = await this.getFarms(record.commonList.split(','));
          }
          
          const reportCoverImagePath =
          `${this.configService.get(
            'file.pathReportTemplateStyles',
          )}/images/`
          entity.mediaUrl =
          reportCoverImagePath +
          (await this.commonUtilsService.getReportCoverImage(
            entity.productCode,
          ));
        }
      }
    }
    return entity;
  }
  /* Set Order Details */
  async setDetails(order, horse) {
    order.horseUuid = horse && horse.horseUuid ? horse.horseUuid : null;
    order.horseId = horse && horse.horseId ? horse.horseId : null;
    order.horseName = horse && horse.horseName ? horse.horseName : null;
    order.sireName = horse && horse.sireName ? horse.sireName : null;
    order.damName = horse && horse.damName ? horse.damName : null;
    order.yob = horse && horse.yob ? horse.yob : null;
    order.cob = horse && horse.cob ? horse.cob : null;
    order.cob = horse && horse.cob ? horse.cob : null;
    order.stallionId = horse && horse.stallionId ? horse.stallionId : null;
  }
  /* Get Horse Details - Order Product info */
  async getOrderProductItemHorseDetails(order) {
    const sQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sr')
      .select('sr.id as sirId, sr.horseName as sireName');

    const dQueryBuilder = getRepository(Horse)
      .createQueryBuilder('dm')
      .select('dm.id as dmId, dm.horseName as damName');

    const queryBuilder = getRepository(OrderProductItem)
      .createQueryBuilder('orderProductItem')
      .select('orderProductItem.orderProductId as orderProductId')
      .addSelect(
        'horse.id as horseId, horse.horseUuid as horseUuid, horse.horseName as horseName, horse.yob as yob, sireName, damName',
      )
      .addSelect('country.countryCode as cob');

    if (
      order.productCode === productCodeList.REPORT_SHORTLIST_STALLION ||
      order.productCode === productCodeList.REPORT_STALLION_MATCH_PRO ||
      order.productCode === productCodeList.REPORT_BROODMARE_AFFINITY ||
      order.productCode === productCodeList.REPORT_BROODMARE_SIRE
    ) {
      queryBuilder
        .innerJoin(
          'orderProductItem.horse',
          'horse',
          'horse.id = orderProductItem.mareId',
        )
        .innerJoin('horse.nationality', 'country');
    } else if (
      order.productCode === productCodeList.REPORT_STALLION_AFFINITY ||
      order.productCode === productCodeList.REPORT_STALLION_BREEDING_STOCK_SALE
    ) {
      queryBuilder
        .addSelect('stallion.stallionUuid as stallionId')
        .innerJoin(
          'orderProductItem.stallion',
          'stallion',
          'stallion.id = orderProductItem.stallionId',
        )
        .innerJoin('stallion.horse', 'horse', 'horse.id = stallion.horseId')
        .innerJoin('horse.nationality', 'country');
    }
    const orderProductInfo = await this.getOrderProductInfo(
      order.orderProductId,
    );
    queryBuilder
      .innerJoin(
        '(' + sQueryBuilder.getQuery() + ')',
        'sire',
        'sirId = horse.sireId',
      )
      .innerJoin(
        '(' + dQueryBuilder.getQuery() + ')',
        'dam',
        'dmId = horse.damId',
      )
      .andWhere('orderProductItem.orderProductId = :orderProductId', {
        orderProductId: orderProductInfo?.id,
      });

    const record = await queryBuilder.getRawOne();
    if (!record) this.setDetails(order, null);
    this.setDetails(order, record);
  }

  /* Get Horse Details By Id */
  async getHorseById(id: number) {
    const sQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sr')
      .select('sr.id as sirId, sr.horseName as sireName');

    const dQueryBuilder = getRepository(Horse)
      .createQueryBuilder('dm')
      .select('dm.id as dmId, dm.horseName as damName');

    const queryBuilder = getRepository(Horse)
      .createQueryBuilder('horse')
      .select(
        'horse.id as horseId, horse.horseUuid as horseUuid, horse.horseName as horseName, horse.yob as yob, sireName, damName',
      )
      .addSelect('country.countryCode as cob')
      .innerJoin('horse.nationality', 'country')
      .innerJoin(
        '(' + sQueryBuilder.getQuery() + ')',
        'sire',
        'sirId = horse.sireId',
      )
      .innerJoin(
        '(' + dQueryBuilder.getQuery() + ')',
        'dam',
        'dmId = horse.damId',
      )
      .andWhere('horse.id = :id', { id: id });

    return await queryBuilder.getRawOne();
  }
  /* Get Stallions */
  async getStallions(stallionIds: Array<string>) {
    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stId, stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName as stallionName,horse.yob as stallionYob')
      .addSelect(
        'nationality.id as countryId, nationality.countryName as countryName',
      )
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('horse.nationality', 'nationality')
      .andWhere('stallion.id IN(:...stallionIds)', {
        stallionIds: stallionIds,
      });
    return await queryBuilder.getRawMany();
  }
  /* Get Stallions By Location */
  async getStallionsByLocation(locationIds: Array<string>) {
    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stId, stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName as stallionName')
      .addSelect(
        'nationality.id as countryId, nationality.countryName as countryName',
      )
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('horse.nationality', 'nationality')
      .andWhere('nationality.id IN(:...locationIds)', {
        locationIds: locationIds,
      });
    return await queryBuilder.getRawMany();
  }
  /* Get Farms */
  async getFarms(farmIds: Array<string>) {
    const queryBuilder = getRepository(Farm)
      .createQueryBuilder('farm')
      .select(
        'farm.id as farmId, farm.farmUuid as farmUuid,farm.farmName as farmName',
      )
      .andWhere('farm.id IN(:...farmIds)', { farmIds: farmIds });
    return await queryBuilder.getRawMany();
  }
  /* Get Locations */
  async getLocation(locationIds: Array<string>) {
    const queryBuilder = getRepository(Country)
      .createQueryBuilder('country')
      .select('country.id as countryId, country.countryName as countryName')
      .andWhere('country.id IN(:...locationIds)', { locationIds: locationIds });
    return await queryBuilder.getRawMany();
  }
  /* Get  Dashboard Data */
  async getReportsDashboardData(dashboardDto: DashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetReportsDashboard @paramDate1=@0, @paramDate2=@1`,
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
  /* Get Most Popular Locations */
  async getPopularLocations(dashboardDto: DashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetReportsDashboardMostPopularLocations @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );

    return result;
  }
  /* Get Most Valuable Users */
  async getValuableUsers(dashboardDto: DashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetReportsDashboardMostValuableUsers @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );

    return result;
  }
  /* Get Order History Chart */
  async getOrderHistoryChart(dashboardDto: DashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetReportsDashboardOrderHistory 
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
  /* Get Report Breakdown Chart */
  async getReportBreakdownChart(dashboardDto: DashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetReportsDashboardReportBreakdown @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );

    return result;
  }
  /* Get Dashboard Report */
  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case REPORTDASHBOARDKPI.TOTAL_REPORTS_ORDERED:
        qbQuery = `EXEC procGetReportsDashboardTotalReportsOrderedDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.AVERAGE_DELIVERY_TIME:
        qbQuery = `EXEC procGetReportsDashboardAverageDeliveryTimeDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.TOTAL_REVENUE:
        qbQuery = `EXEC procGetReportsDashboardTotalRevenueDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.TOTAL_REVENUE_PER_CUSTOMER:
        qbQuery = `EXEC procGetReportsDashboardTotalRevenuePerCustomerDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.MOST_POPULAR_LOCATIONS:
        qbQuery = `EXEC procGetReportsDashboardMostPopularLocationsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.MOST_VALUABLE_USERS:
        qbQuery = `EXEC procGetReportsDashboardMostValuableUsersDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.MOST_POPULAR_REPORT:
        qbQuery = `EXEC procGetReportsDashboardMostPopularReportDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.MOST_POPULAR_STALLION:
        qbQuery = `EXEC procGetReportsDashboardMostPopularStallionDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.MOST_POPULAR_BROODMARE_SIRE:
        qbQuery = `EXEC procGetReportsDashboardMostPopularBroodmareSireDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.MOST_POPULAR_FARM:
        qbQuery = `EXEC procGetReportsDashboardMostPopularFarmDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.MOST_POPULAR_PAYMENT_METHOD:
        qbQuery = `EXEC procGetReportsDashboardMostPopularPaymentMethodDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.REPORTS_OVERVIEW_PAGE_VIEWS:
        qbQuery = `EXEC procGetReportsDashboardReportOverviewPageViewsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.ORDERS_PER_PAGE_VIEW:
        qbQuery = `EXEC procGetReportsDashboardOrdersPerPageViewDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.REPORT_BREAKDOWN:
        qbQuery = `EXEC procGetReportsDashboardReportBreakdownDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case REPORTDASHBOARDKPI.REPEATED_CUSTOMER:
        qbQuery = `EXEC procGetReportsDashboardRepeatCustomersDownload @paramDate1=@0, @paramDate2=@1`;
        break;
    }
    if (qbQuery == '') {
      throw new NotFoundException('No Data Exist');
    }
    let result = await this.connection.query(`${qbQuery}`, [
      options.fromDate,
      options.toDate,
    ]);
    if (result.length) {
      await result.reduce(async (promise, element) => {
        await promise;
        // switch (options.kpiTitle) {
        //   case REPORTDASHBOARDKPI.MOST_POPULAR_STALLION:
        //     element.StallionName = await this.commonUtilsService.toTitleCase(
        //       element.StallionName,
        //     );
        //     break;
        //   case REPORTDASHBOARDKPI.MOST_POPULAR_FARM:
        //     element.FarmName = await this.commonUtilsService.toTitleCase(
        //       element.FarmName,
        //     );
        //     break;
        // }
      }, Promise.resolve());
      let headerList = [];
      let headersData = Object.keys(result[0]);
      await headersData.reduce(async (promise, item) => {
        await promise;
        item;
        let itemObj = {
          header: item,
          key: item, //item.replace(/[^A-Z0-9]+/ig, "_"),
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
  /* Get Report Orders By Country Id */
  async getOrdersByCountryId(dashboardDto: DashboardOrdersByCountryDto) {
    const queryBuilder = getRepository(Order)
      .createQueryBuilder('order')
      .select(
        'count(order.id) as ordersCount, ' +
          dashboardDto.groupedBy +
          '(order.createdOn) as xAxis',
      )
      .andWhere('order.countryId= :countryId', {
        countryId: dashboardDto.countryId,
      })
      .andWhere('order.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: dashboardDto.fromDate,
        toDate: dashboardDto.toDate,
      })
      .addGroupBy(dashboardDto.groupedBy + '(order.createdOn)')
      .getRawMany();
    let total = 0;
    let result = (await queryBuilder).forEach(async (item) => {
      total = +item.ordersCount;
    });
    let average = total / (await queryBuilder).length;
    return [{ data: await queryBuilder, totalCount: total, average: average }];
  }
  /* Cancel Report */
  async cancelReport(orderProductId) {
    const member = this.request.user;
    const orderProductInfo = await this.getOrderProductInfo(orderProductId);
    let result = await this.orderReportStatusService.create({
      orderProductId: orderProductInfo?.id,
      createdBy: member['id'],
      orderStatusId: ORDER_STATUS.CANCELLED,
    });
    if (result) return 'Canceled Successfully';
  }
  /* Send Report */
  async sendReport(orderProductId: string) {
    const member = this.request.user;
    const productInfo = await this.findOne(orderProductId);
    const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
    productInfo['status'] = orderStatus?.status;

    if (productInfo) {
      let result = await this.mailService.sendReport({
        to: productInfo.email,
        data: productInfo,
      });
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.DELIVERED);
      await getRepository(OrderProduct).update({ orderProductUuid: orderProductId }, { orderStatusId: orderStatus?.id, modifiedBy: member['id'], modifiedOn: new Date() })
      const orderProductInfo = await this.getOrderProductInfo(orderProductId);
      if (result && result.messageId) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductInfo?.id,
          createdBy: member['id'],
          orderStatusId: ORDER_STATUS.DELIVERED,
        });
        const messageTemplate =
          await this.messageTemplatesService.getMessageTemplateByUuid(
            notificationTemplates.orderDevilvery,
          );

        //const messageText = messageTemplate.messageText; //.replace('{Farm Name}',farmName );
        const messageText = messageTemplate.messageText.replace('{reportName}',productInfo?.productName);
        const messageTitle = messageTemplate.messageTitle;
        const notification = this.notificationsService.create({
          createdBy: member['id'],
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: orderProductInfo?.createdBy,
          messageTitle,
          messageText,
          isRead: false,
        });

        const notificationToAdmin = this.notificationsService.create({
          createdBy: member['id'],
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: member['id'],
          messageTitle,
          messageText,
          isRead: false,
        });

        return { message: 'Mail Sent Successfully' };
      } else {
        return { message: 'Something went wrong' };
      }
    } else {
      return { message: 'Failed' };
    }
  }

  /* Share Report */
  async shareReport(orderProductId, toEmail) {
    const member = this.request.user;
    const productInfo = await this.findOne(orderProductId);
    if (productInfo) {
      let result = await this.mailService.sendReport({
        to: toEmail,
        data: productInfo,
      });
      if (result && result.messageId) {
        return { message: 'Mail Shared Successfully' };
      } else {
        return { message: 'Something went wrong' };
      }
    } else {
      return { message: 'Failed' };
    }
  }
  /* Get Order Product Info */
  async getOrderProductInfo(orderProductId) {
    const pQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('op.id, op.createdBy')
      .andWhere('op.orderProductUuid = :orderProductId', {
        orderProductId: orderProductId,
      })
      .getRawOne();

    return pQueryBuilder;
  }
  /* Download Order list */
  async download(searchOrdersOptionsDto: ReportSearchOptionsDownloadDto) {
    const queryBuilder = getRepository(OrderTransaction)
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.id as orderTransactionId, orderTransaction.paymentIntent as paymentIntent,orderTransaction.mode as paymentMode, orderTransaction.status as transactionStatus,orderTransaction.total as total,orderTransaction.subTotal as subTotal,orderTransaction.discount as discount, orderTransaction.createdOn as orderCreatedOn ,orderTransaction.taxValue as tax',
      )
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect('product.id as productId, product.productName as productName')
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect(
        'order.id as orderId, order.fullName as clientName, order.email as email',
      )
      .addSelect(
        'country.countryCode as countryCode, country.countryName as countryName',
      )
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'orderproduct.quantity as noOfStallions, orderproduct.orderProductUuid as orderProductId, orderproduct.id as ordProductId, orderproduct.pdfLink as reportLink, orderproduct.isLinkActive as isLinkActive',
      )
      .innerJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .leftJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .innerJoin('orderTransaction.orderproduct', 'orderproduct')
      .innerJoin('orderproduct.orderReportStatus','orderReportStatus')
      .innerJoin('orderproduct.order', 'order')
      .innerJoin('order.country', 'country')
      .innerJoin('order.currency', 'currency')
      .innerJoin('orderproduct.product', 'product');

    if (searchOrdersOptionsDto.countryId) {
      queryBuilder
        .innerJoin('order.member', 'member')
        .innerJoin('member.memberaddresses', 'memberAddresses');
    }

    if (searchOrdersOptionsDto.companyName) {
      if (!searchOrdersOptionsDto.countryId) {
        queryBuilder.innerJoin('order.member', 'member');
      }

      queryBuilder
        .innerJoin('member.memberfarms', 'memberfarms')
        .innerJoin('memberfarms.farm', 'farm');
    }

    if (searchOrdersOptionsDto.sireName) {
      let sireQuery = getRepository(Horse)
        .createQueryBuilder('sHorse')
        .select('sHorse.id as sId, sHorse.horseName as sHorseName');

      queryBuilder
        .innerJoin('orderproduct.orderProductItem', 'orderProductItem')
        .leftJoin('orderProductItem.horse', 'horse')
        .leftJoin('orderProductItem.stallion', 'stallion')
        .leftJoin('stallion.horse', 'hrs')
        .innerJoin(
          '(' + sireQuery.getQuery() + ')',
          'sire',
          'sId=horse.sireId OR sId = hrs.sireId',
        );

      if (searchOrdersOptionsDto.isSireNameExactSearch) {
        queryBuilder.andWhere('sire.sHorseName = :sireName', {
          sireName: searchOrdersOptionsDto.sireName,
        });
      } else {
        queryBuilder.andWhere('sire.sHorseName like :sireName', {
          sireName: '%' + searchOrdersOptionsDto.sireName + '%',
        });
      }
    }

    if (searchOrdersOptionsDto.damName) {
      let damQuery = getRepository(Horse)
        .createQueryBuilder('dHorse')
        .select('dHorse.id as dId, dHorse.horseName as dHorseName');

      if (!searchOrdersOptionsDto.sireName) {
        queryBuilder
          .innerJoin('orderproduct.orderProductItem', 'orderProductItem')
          .leftJoin('orderProductItem.horse', 'horse')
          .leftJoin('orderProductItem.stallion', 'stallion')
          .leftJoin('stallion.horse', 'hrs');
      }
      queryBuilder.innerJoin(
        '(' + damQuery.getQuery() + ')',
        'dam',
        'dId=horse.damId OR dId = hrs.damId',
      );

      if (searchOrdersOptionsDto.isDamNameExactSearch) {
        queryBuilder.andWhere('dam.dHorseName = :damName', {
          damName: searchOrdersOptionsDto.damName,
        });
      } else {
        queryBuilder.andWhere('dam.dHorseName like :damName', {
          damName: '%' + searchOrdersOptionsDto.damName + '%',
        });
      }
    }

    if (searchOrdersOptionsDto.companyName) {
      if (searchOrdersOptionsDto.isCompanyNameExactSearch) {
        queryBuilder.andWhere('farm.farmName = :farmName', {
          farmName: searchOrdersOptionsDto.companyName,
        });
      } else {
        queryBuilder.andWhere('farm.farmName like :farmName', {
          farmName: '%' + searchOrdersOptionsDto.companyName + '%',
        });
      }
    }

    if (searchOrdersOptionsDto.name) {
      if (searchOrdersOptionsDto.isNameExactSearch) {
        queryBuilder.andWhere('order.fullName = :name', {
          name: searchOrdersOptionsDto.name,
        });
      } else {
        queryBuilder.andWhere('order.fullName like :name', {
          name: '%' + searchOrdersOptionsDto.name + '%',
        });
      }
    }

    if (searchOrdersOptionsDto.email) {
      // if (searchOrdersOptionsDto.isEmailExactSearch) {
      //   queryBuilder.andWhere('order.email = :email', {
      //     email: searchOrdersOptionsDto.email,
      //   });
      // } else {
      queryBuilder.andWhere('order.email like :email', {
        email: '%' + searchOrdersOptionsDto.email + '%',
      });
      // }
    }

    if (searchOrdersOptionsDto.date) {
      let dateRange = searchOrdersOptionsDto.date.split('/');
      queryBuilder.andWhere(
        'orderTransaction.createdOn BETWEEN :fromDate AND :toDate',
        {
          fromDate: await this.setHoursZero(dateRange[0]),
          toDate: await this.setToMidNight(dateRange[1]),
        },
      );
    }

    if (searchOrdersOptionsDto.reportId) {
      queryBuilder.andWhere('product.id = :productId', {
        productId: searchOrdersOptionsDto.reportId,
      });
    }

    if (searchOrdersOptionsDto.orderId) {
      queryBuilder.andWhere('order.id = :orderId', {
        orderId: searchOrdersOptionsDto.orderId,
      });
    }

    if (searchOrdersOptionsDto.initiatedDate) {
      let dateRange = searchOrdersOptionsDto.initiatedDate.split('/');
      queryBuilder.andWhere(
        'orderReportStatus.createdOn BETWEEN :fromDate AND :toDate AND orderproduct.orderStatusId >= 2',
        {
          fromDate: await this.setHoursZero(dateRange[0]),
          toDate: await this.setToMidNight(dateRange[1]),
        },
      );
    }

    if (searchOrdersOptionsDto.completedDate) {
      let dateRange = searchOrdersOptionsDto.completedDate.split('/');
      queryBuilder.andWhere(
        'orderReportStatus.createdOn BETWEEN :fromDate AND :toDate AND orderproduct.orderStatusId >= 3',
        {
          fromDate: await this.setHoursZero(dateRange[0]),
          toDate: await this.setToMidNight(dateRange[1]),
        },
      );
    }

    if (searchOrdersOptionsDto.deliveredDate) {
      let dateRange = searchOrdersOptionsDto.deliveredDate.split('/');
      queryBuilder.andWhere(
        'orderReportStatus.createdOn BETWEEN :fromDate AND :toDate AND orderproduct.orderStatusId >= 4',
        {
          fromDate: await this.setHoursZero(dateRange[0]),
          toDate: await this.setToMidNight(dateRange[1]),
        },
      );
    }

    if (searchOrdersOptionsDto.orderStatusId) {
      queryBuilder.andWhere('orderproduct.orderStatusId = :orderStatusId', {
        orderStatusId: searchOrdersOptionsDto.orderStatusId,
      });
    }

    if (searchOrdersOptionsDto.countryId) {
      queryBuilder.andWhere('memberAddresses.countryId = :countryId', {
        countryId: searchOrdersOptionsDto.countryId,
      });
    }

    if (searchOrdersOptionsDto.paymentMethodId) {
      queryBuilder.andWhere(
        'orderTransaction.paymentMethod = :paymentMethodId',
        { paymentMethodId: searchOrdersOptionsDto.paymentMethodId },
      );
    }

    if (searchOrdersOptionsDto.currencyId) {
      queryBuilder.andWhere('order.currencyId = :currencyId', {
        currencyId: searchOrdersOptionsDto.currencyId,
      });
    }

    if (searchOrdersOptionsDto.minPrice && searchOrdersOptionsDto.maxPrice) {
      queryBuilder
        .andWhere('orderTransaction.total >= :minPrice', {
          minPrice: searchOrdersOptionsDto.minPrice,
        })
        .andWhere('orderTransaction.total <= :maxPrice', {
          maxPrice: searchOrdersOptionsDto.maxPrice,
        });
    }

    if (searchOrdersOptionsDto.isRequeiredApproval) {
      queryBuilder.andWhere('orderproduct.orderStatusId <= 2');
    }
    if (searchOrdersOptionsDto.sortBy) {
      let sortBy = searchOrdersOptionsDto.sortBy.toLowerCase();
      if (sortBy === 'name') {
        queryBuilder.orderBy('order.fullName', searchOrdersOptionsDto.order);
      } else if (sortBy === 'email') {
        queryBuilder.orderBy('order.email', searchOrdersOptionsDto.order);
      } else if (sortBy === 'createdon') {
        queryBuilder.orderBy('order.createdOn', searchOrdersOptionsDto.order);
      } else if (sortBy === 'report') {
        queryBuilder.orderBy(
          'product.productName',
          searchOrdersOptionsDto.order,
        );
      } else if (sortBy === 'country') {
        queryBuilder.orderBy(
          'country.countryName',
          searchOrdersOptionsDto.order,
        );
      } else if (sortBy === 'paid') {
        queryBuilder.orderBy(
          'orderTransaction.total',
          searchOrdersOptionsDto.order,
        );
      } else {
        queryBuilder.orderBy(
          'orderTransaction.id',
          searchOrdersOptionsDto.order,
        );
      }
    } else {
      queryBuilder.orderBy('order.createdOn', searchOrdersOptionsDto.order);
    }

    const entities = await queryBuilder.getRawMany();
    let newentities = await this.setOrderStatus(entities);

    return newentities;
  }
  /* Get Orders Min and Max Price */
  async minMaxPrice(searchOrdersOptionsDto: SearchOrdersOptionsDto) {
    const queryBuilder = getRepository(OrderTransaction)
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.total as total,orderTransaction.subTotal as subTotal',
      )
      .innerJoin('orderTransaction.orderproduct', 'orderproduct')
      .innerJoin('orderproduct.order', 'order');

    if (searchOrdersOptionsDto.currencyId) {
      queryBuilder.andWhere('order.currencyId = :currencyId', {
        currencyId: searchOrdersOptionsDto.currencyId,
      });
    }
    const entities = await queryBuilder.getRawMany();

    let min = Math.min(...entities.map((item) => item.subTotal));
    let max = Math.max(...entities.map((item) => item.subTotal));

    return { min, max };
  }
}
