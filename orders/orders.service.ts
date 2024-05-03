import {
  Inject,
  Injectable,
  Scope,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Order } from './entities/order.entity';
import { OrderDto } from './dto/order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderProductService } from 'src/order-product/order-product.service';
import { OrderProductItemsService } from 'src/order-product-items/order-product-items.service';
import { OrderProductDto } from 'src/order-product/dto/order-product.dto';
import { CreateOrderProductItemDto } from 'src/order-product-items/dto/create-order-product-item.dto';
import { BroodmareAfinityOrderDto } from './dto/broodmareAfinityOrder.dto';
import { BroodmareSireOrderDto } from './dto/broodmareSireOrder.dto';
import { SalesCatelogueOrderDto } from './dto/salesCatelogueOrder.dto';
import { ShortlistStallionOrderDto } from './dto/shortlistStallionOrder.dto';
import { StallionMatchProOrderDto } from './dto/stallionMatchPro.dto';
import { StallionAfinityOrderDto } from './dto/stallionAfinityOrder.dto';
import { v4 as uuidv4 } from 'uuid';
import { Horse } from 'src/horses/entities/horse.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { ReportTemplatesService } from 'src/report-templates/report-templates.service';
import { OrderReportStatusService } from 'src/order-report-status/order-report-status.service';
import { OrderTransactionService } from 'src/order-transaction/order-transaction.service';
import { CreateTransactionDto } from 'src/order-transaction/dto/create-transaction.dto';
import { OrderStatusService } from 'src/order-status/order-status.service';
import { ordersStatusList } from 'src/utils/constants/orders-status';
import { ReportProductItemsService } from 'src/report-product-items/report-product-items.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { notificationTemplates } from 'src/utils/constants/notifications';
import { StockSaleOrderDto } from './dto/stockSaleOrder.dto';
import { productCodeList } from 'src/utils/constants/product-code-list';
import { Product } from 'src/products/entities/product.entity';
import { ORDER_STATUS, PAYMENT_STATUS, PRODUCT } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class OrdersService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderProductService: OrderProductService,
    private orderProductItemService: OrderProductItemsService,
    private reportTemplatesService: ReportTemplatesService,
    private orderReportStatusService: OrderReportStatusService,
    private orderTransactionService: OrderTransactionService,
    private orderStatusService: OrderStatusService,
    private reportProductItemService: ReportProductItemsService,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    ) {}

  //Get a Order
  async findOne(id: number) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .select(
        'order.sessionId as orderId, order.createdOn as orderDate, order.fullName as fullName, order.email as email, order.countryId as countryId, order.total as paid',
      )
      .addSelect('product.productName as report')
      .leftJoin('order.orderProduct', 'orderProduct')
      .leftJoin('orderProduct.product', 'product')
      .andWhere('orderProduct.orderProductUuid=:id', { id: id });

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Create a Order
  async create(createOrderDto: CreateOrderDto) {
    const member = this.request.user;
    const {
      currencyId,
      countryId,
      postalCode,
      memberId,
    } = createOrderDto;

    let orderData = new Order();
    orderData.sessionId = uuidv4();
    orderData.currencyId = currencyId;
    orderData.fullName = member['fullName'];
    orderData.email = member['email'];
    orderData.countryId = countryId;
    orderData.postalCode = postalCode;
    orderData.memberId = memberId;
    orderData.createdBy = member['id'];

    const createOrderResponse = await this.orderRepository.save(
      this.orderRepository.create(orderData),
    );
    return createOrderResponse;
  }

  //Create a Order
  async createOrder(orderData: OrderDto) {
    const createOrderResponse = await this.orderRepository.save(
      this.orderRepository.create(orderData),
    );
    return createOrderResponse;
  }

  //BroodmareSire Report
  async broodmareSireReport(broodmareSireOrderDto: BroodmareSireOrderDto) {
    const member = this.request.user;
    let orderResponse;
    const {
      actionType,
      currencyId,
      locations,
      mareId,
      orderProductId,
      countryId,
      postalCode,
    } = broodmareSireOrderDto;
    if (actionType == 'approve') {
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
      const orderProductInfo = await this.orderProductService.findOne(
        orderProductId,
      );
      await this.orderProductService.update(
        { id: orderProductInfo['id'] },
        { orderStatusId: orderStatus?.id, modifiedBy: member['id'], modifiedOn: new Date() },
      );
      await this.orderReportStatusService.create({
        orderProductId: orderProductInfo?.id,
        createdBy: member['id'],
        orderStatusId: orderStatus?.id,
      });
      let stallionIds = [];
      const stallionsByLocation = await getRepository(Stallion)
        .createQueryBuilder('stallion')
        .select('stallion.id as id')
        .innerJoin('stallion.stallionlocation', 'stallionlocation')
        .andWhere('stallionlocation.countryId IN (:...countryIds)', {
          countryIds: locations,
        })
        .getRawMany();

      stallionIds = await Promise.all(
        stallionsByLocation.map(async (element) => {
          return element.id;
        }),
      );
      if (stallionIds.length > 4) {
        stallionIds = stallionIds.slice(0, 3);
      }

      this.generateBroodmareSire({mareId, orderProductInfo, stallionIds}, member);
      return { message: 'Report Approved'}
      
    } else {
      let orderData = new Order();
      orderData.sessionId = uuidv4();
      orderData.currencyId = currencyId;
      orderData.fullName = member['fullName'];
      orderData.email = member['email'];
      orderData.countryId = countryId;
      orderData.postalCode = postalCode;
      orderData.memberId = member['id'];
      orderData.createdBy = member['id'];

      orderResponse = await this.createOrder(orderData);
      if (!orderResponse) {
        throw new HttpException(
          'Something went wrong.Order not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.ORDERED);

      const orderProductData = new OrderProductDto();
      orderProductData.orderId = orderResponse['id'];
      orderProductData.productId = PRODUCT.BROODMARE_SIRE_REPORT;
      orderProductData.price = 0;
      orderProductData.quantity = 1;
      orderProductData.createdBy = member['id'];
      orderProductData['orderStatusId'] = orderStatus?.id;
      let orderProductResponse = await this.orderProductService.create(
        orderProductData,
      );
      if (!orderProductResponse) {
        throw new HttpException(
          'Something went wrong.Order product not created',
          HttpStatus.BAD_REQUEST,
        );
      }

      const mare = await getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id as id')
        .andWhere('horse.horseUuid = :horseUuid', { horseUuid: mareId })
        .getRawOne();

      const orderProductItemData = new CreateOrderProductItemDto();
      orderProductItemData.orderProductId = orderProductResponse['id'];
      orderProductItemData.mareId = mare?.id;
      orderProductItemData.createdBy = member['id'];
      orderProductItemData.commonList = locations.toString();
      let orderProductItemResponse = await this.orderProductItemService.create(
        orderProductItemData,
      );
      await this.reportProductItemService.create(orderProductItemData);
      if (!orderProductItemResponse) {
        throw new HttpException(
          'Something went wrong.Order product item not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (orderProductItemResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductResponse['id'],
          createdBy: member['id'],
          orderStatusId: ORDER_STATUS.ORDERED,
        });

        const createTransactionDto = new CreateTransactionDto();
        createTransactionDto.createdBy = member['id'];
        createTransactionDto.discount = 0;
        createTransactionDto.total = 0;
        createTransactionDto.subTotal = 0;
        createTransactionDto.status = 'not apllicable';
        createTransactionDto.paymentStatus = PAYMENT_STATUS.UNPAID;
        createTransactionDto.memberId = member['id'];
        createTransactionDto.orderId = orderResponse['id'];

        await this.orderTransactionService.create(
          createTransactionDto,
        );
      }
    }
    return orderResponse;
  }

  //Broodmare Afinity Report
  async broodmareAfinityReport(
    broodmareAfinityOrderDto: BroodmareAfinityOrderDto,
  ) {
    const member = this.request.user;
    let orderResponse;
    const {
      actionType,
      currencyId,
      locations,
      mareId,
      orderProductId,
      countryId,
      postalCode,
    } = broodmareAfinityOrderDto;
    if (actionType == 'approve') {
      const orderProductInfo = await this.orderProductService.findOne(
        orderProductId,
      );
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
      await this.orderProductService.update(
        { id: orderProductInfo?.id },
        { orderStatusId: orderStatus?.id, modifiedBy: member['id'], modifiedOn: new Date() },
      );
      await this.orderReportStatusService.create({
        orderProductId: orderProductInfo?.id,
        createdBy: member['id'],
        orderStatusId: orderStatus?.id,
      });
      this.generateBroodmareAffinity({mareId, orderProductInfo, countryId}, member);
      return { message: 'Report Approved'}
     
    }
    //order create action
    else {
      let orderData = new Order();
      orderData.sessionId = uuidv4();
      orderData.currencyId = currencyId;
      orderData.fullName = member['fullName'];
      orderData.email = member['email'];
      orderData.countryId = countryId;
      orderData.postalCode = postalCode;
      orderData.memberId = member['id'];
      orderData.createdBy = member['id'];

      orderResponse = await this.createOrder(orderData);
      if (!orderResponse) {
        throw new HttpException(
          'Something went wrong.Order not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.ORDERED);
      const orderProductData = new OrderProductDto();
      orderProductData.orderId = orderResponse['id'];
      orderProductData.productId = PRODUCT.BROODMARE_AFFINITY_REPORT;
      orderProductData.price = 0;
      orderProductData.quantity = 1;
      orderProductData.createdBy = member['id'];
      orderProductData['orderStatusId'] = orderStatus?.id;
      let orderProductResponse = await this.orderProductService.create(
        orderProductData,
      );
      if (!orderProductResponse) {
        throw new HttpException(
          'Something went wrong.Order product not created',
          HttpStatus.BAD_REQUEST,
        );
      }

      const mare = await getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id as id')
        .andWhere('horse.horseUuid = :horseUuid', { horseUuid: mareId })
        .getRawOne();

      const orderProductItemData = new CreateOrderProductItemDto();
      orderProductItemData.orderProductId = orderProductResponse['id'];
      orderProductItemData.mareId = mare?.id;
      orderProductItemData.createdBy = member['id'];
      orderProductItemData.commonList = locations.toString();
      let orderProductItemResponse = await this.orderProductItemService.create(
        orderProductItemData,
      );
      await this.reportProductItemService.create(orderProductItemData);

      if (!orderProductItemResponse) {
        throw new HttpException(
          'Something went wrong.Order product item not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (orderProductItemResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductResponse['id'],
          createdBy: member['id'],
          orderStatusId: ORDER_STATUS.ORDERED,
        });

        const createTransactionDto = new CreateTransactionDto();
        createTransactionDto.createdBy = member['id'];
        createTransactionDto.discount = 0;
        createTransactionDto.total = 0;
        createTransactionDto.subTotal = 0;
        createTransactionDto.status = 'not apllicable';
        createTransactionDto.paymentStatus = PAYMENT_STATUS.UNPAID;
        createTransactionDto.memberId = member['id'];
        createTransactionDto.orderId = orderResponse['id'];

        await this.orderTransactionService.create(
          createTransactionDto,
        );
      }
    }
    return orderResponse;
  }

  //Stallion Afinity Report
  async stallionAfinityReport(
    stallionAfinityOrderDto: StallionAfinityOrderDto,
  ) {
    const member = this.request.user;
    let orderResponse;
    const {
      actionType,
      currencyId,
      stallionId,
      farms,
      orderProductId,
      countryId,
      postalCode,
    } = stallionAfinityOrderDto;
    if (actionType == 'approve') {
      const orderProductInfo = await this.orderProductService.findOne(
        orderProductId,
      );
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);

      await this.orderProductService.update(
        { id: orderProductInfo?.id },
        { orderStatusId: orderStatus?.id, modifiedBy: member['id'], modifiedOn: new Date() },
      );
      await this.orderReportStatusService.create({
        orderProductId: orderProductInfo?.id,
        createdBy: member['id'],
        orderStatusId: orderStatus?.id,
      });
      this.generateStallionAffinity({ stallionId, orderProductInfo }, member);
      return { message: 'Report Approved'}
      
    }
    //order create action
    else {
      let orderData = new Order();
      orderData.sessionId = uuidv4();
      orderData.currencyId = currencyId;
      orderData.fullName = member['fullName'];
      orderData.email = member['email'];
      orderData.countryId = countryId;
      orderData.postalCode = postalCode;
      orderData.memberId = member['id'];
      orderData.createdBy = member['id'];

      orderResponse = await this.createOrder(orderData);
      if (!orderResponse) {
        throw new HttpException(
          'Something went wrong.Order not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.ORDERED);
      const orderProductData = new OrderProductDto();
      orderProductData.orderId = orderResponse['id'];
      orderProductData.productId = PRODUCT.STALLION_AFFINITY_REPORT;
      orderProductData.price = 0;
      orderProductData.quantity = 1;
      orderProductData.createdBy = member['id'];
      orderProductData['orderStatusId'] = orderStatus?.id;
      let orderProductResponse = await this.orderProductService.create(
        orderProductData,
      );
      if (!orderProductResponse) {
        throw new HttpException(
          'Something went wrong.Order product not created',
          HttpStatus.BAD_REQUEST,
        );
      }

      const stallion = await getRepository(Stallion)
        .createQueryBuilder('stallion')
        .select('stallion.id as id')
        .andWhere('stallion.stallionUuid=:stallionUuid', {
          stallionUuid: stallionId,
        })
        .getRawOne();
      const orderProductItemData = new CreateOrderProductItemDto();
      orderProductItemData.orderProductId = orderProductResponse['id'];
      orderProductItemData.stallionId = stallion?.id;
      orderProductItemData.createdBy = member['id'];
      if (farms.length > 0) {
        let result = await Promise.all(
          farms.map(async (element) => {
            const farmObj = await getRepository(Farm)
              .createQueryBuilder('farm')
              .select('farm.id as id')
              .andWhere('farm.farmUuid=:farmUuid', { farmUuid: element })
              .getRawOne();
            return farmObj.id;
          }),
        );
         orderProductItemData.commonList =  result.toString();
      }   
      let orderProductItemResponse = await this.orderProductItemService.create(
        orderProductItemData,
      );
      await this.reportProductItemService.create(orderProductItemData);
      
      if (!orderProductItemResponse) {
        throw new HttpException(
          'Something went wrong.Order product item not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (orderProductItemResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductResponse['id'],
          createdBy: member['id'],
          orderStatusId: ORDER_STATUS.ORDERED,
        });

        const createTransactionDto = new CreateTransactionDto();
        createTransactionDto.createdBy = member['id'];
        createTransactionDto.discount = 0;
        createTransactionDto.total = 0;
        createTransactionDto.subTotal = 0;
        createTransactionDto.status = 'not apllicable';
        createTransactionDto.paymentStatus = PAYMENT_STATUS.UNPAID;
        createTransactionDto.memberId = member['id'];
        createTransactionDto.orderId = orderResponse['id'];

        await this.orderTransactionService.create(
          createTransactionDto,
        );
      }
    }
    return orderResponse;
  }

  async shortlistStallionReport(
    shortlistStallionOrderDto: ShortlistStallionOrderDto,
  ) {
    const member = this.request.user;
    let orderResponse;
    const {
      actionType,
      currencyId,
      orderProductId,
      countryId,
      postalCode,
      mareId,
      stallions,
    } = shortlistStallionOrderDto;
    if (actionType == 'approve') {
      const orderProductInfo = await this.orderProductService.findOne(
        orderProductId,
      );
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
      await this.orderProductService.update(
        { id: orderProductInfo?.id },
        { orderStatusId: orderStatus?.id, modifiedBy: member['id'], modifiedOn: new Date() },
      );
      await this.orderReportStatusService.create({
        orderProductId: orderProductInfo?.id,
        createdBy: member['id'],
        orderStatusId: orderStatus?.id,
      });
      let stallionIds = [];
      const stallionsByUuids = await getRepository(Stallion)
        .createQueryBuilder('stallion')
        .select('stallion.id as id')
        .andWhere('stallion.stallionUuid IN (:...stallionIds)', {
          stallionIds: stallions,
        })
        .getRawMany();

      stallionIds = await Promise.all(
        stallionsByUuids.map(async (element) => {
          return element.id;
        }),
      );

      this.generateShortlistStallion({ mareId, orderProductInfo, stallionIds },- member);
      return { message: 'Report Approved'}
      
    }
    //order create action
    else {
      let orderData = new Order();
      orderData.sessionId = uuidv4();
      orderData.currencyId = currencyId;
      orderData.fullName = member['fullName'];
      orderData.email = member['email'];
      orderData.countryId = countryId;
      orderData.postalCode = postalCode;
      orderData.memberId = member['id'];
      orderData.createdBy = member['id'];

      orderResponse = await this.createOrder(orderData);
      if (!orderResponse) {
        throw new HttpException(
          'Something went wrong.Order not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.ORDERED);
      const orderProductData = new OrderProductDto();
      orderProductData.orderId = orderResponse['id'];
      orderProductData.productId = PRODUCT.SHORTLIST_STALLION_REPORT;
      orderProductData.price = 0;
      orderProductData.quantity = stallions.length;
      orderProductData.createdBy = member['id'];
      orderProductData['orderStatusId'] = orderStatus?.id;
      let orderProductResponse = await this.orderProductService.create(
        orderProductData,
      );
      if (!orderProductResponse) {
        throw new HttpException(
          'Something went wrong.Order product not created',
          HttpStatus.BAD_REQUEST,
        );
      }

      const orderProductItemData = new CreateOrderProductItemDto();
      orderProductItemData.orderProductId = orderProductResponse['id'];
      orderProductItemData.createdBy = member['id'];

      if (mareId) {
        const mare = await getRepository(Horse)
          .createQueryBuilder('horse')
          .select('horse.id as id')
          .andWhere('horse.horseUuid = :horseUuid', { horseUuid: mareId })
          .getRawOne();
        orderProductItemData.mareId = mare.id;
      }
      if (stallions.length > 0) {
        let result = await Promise.all(
          stallions.map(async (element) => {
            const stallion = await getRepository(Stallion)
              .createQueryBuilder('stallion')
              .select('stallion.id as id')
              .andWhere('stallion.stallionUuid = :stallionUuid', {
                stallionUuid: element,
              })
              .getRawOne();
            orderProductItemData.stallionId = stallion.id;
            await this.orderProductItemService.create(orderProductItemData);
            await this.reportProductItemService.create({...orderProductItemData,stallionId: stallion.id});

          }),
        );
      }
      if (orderProductResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductResponse['id'],
          createdBy: member['id'],
          orderStatusId: ORDER_STATUS.ORDERED,
        });

        const createTransactionDto = new CreateTransactionDto();
        createTransactionDto.createdBy = member['id'];
        createTransactionDto.discount = 0;
        createTransactionDto.total = 0;
        createTransactionDto.subTotal = 0;
        createTransactionDto.status = 'not apllicable';
        createTransactionDto.paymentStatus = PAYMENT_STATUS.UNPAID;
        createTransactionDto.memberId = member['id'];
        createTransactionDto.orderId = orderResponse['id'];

        await this.orderTransactionService.create(
          createTransactionDto,
        );
      }
    }

    return orderResponse;
  }

  //StallionMatch Pro Report
  async stallionMatchProReport(
    stallionMatchProOrderDto: StallionMatchProOrderDto,
  ) {
    const member = this.request.user;
    let orderResponse;
    const {
      actionType,
      currencyId,
      orderProductId,
      countryId,
      postalCode,
      mareId,
      stallions,
      locations,
    } = stallionMatchProOrderDto;
    if (actionType == 'approve') {
      const orderProductInfo = await this.orderProductService.findOne(
        orderProductId,
      );
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);

      await this.orderProductService.update(
        { id: orderProductInfo?.id },
        { orderStatusId: orderStatus?.id, modifiedBy: member['id'], modifiedOn: new Date() },
      );
      await this.orderReportStatusService.create({
        orderProductId: orderProductInfo?.id,
        createdBy: member['id'],
        orderStatusId: orderStatus?.id,
      });
      let stallionIds = [];
      const stallionsByUuids = await getRepository(Stallion)
        .createQueryBuilder('stallion')
        .select('stallion.id as id')
        .andWhere('stallion.stallionUuid IN (:...stallionIds)', {
          stallionIds: stallions,
        })
        .getRawMany();

      stallionIds = await Promise.all(
        stallionsByUuids.map(async (element) => {
          return element.id;
        }),
      );

      this.generateStallionMatchPro({ mareId, orderProductInfo, stallionIds }, member);
      return { message: 'Report Approved'}
    }
    //order create action
    else {
      let orderData = new Order();
      orderData.sessionId = uuidv4();
      orderData.currencyId = currencyId;
      orderData.fullName = member['fullName'];
      orderData.email = member['email'];
      orderData.countryId = countryId;
      orderData.postalCode = postalCode;
      orderData.memberId = member['id'];
      orderData.createdBy = member['id'];

      orderResponse = await this.createOrder(orderData);
      if (!orderResponse) {
        throw new HttpException(
          'Something went wrong.Order not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.ORDERED);

      const orderProductData = new OrderProductDto();
      orderProductData.orderId = orderResponse['id'];
      orderProductData.productId = PRODUCT.STALLION_MATCH_PRO_REPORT;
      orderProductData.price = 0;
      orderProductData.quantity = 1;
      orderProductData.createdBy = member['id'];
      orderProductData['orderStatusId'] = orderStatus?.id;
      let orderProductResponse = await this.orderProductService.create(
        orderProductData,
      );
      if (!orderProductResponse) {
        throw new HttpException(
          'Something went wrong.Order product not created',
          HttpStatus.BAD_REQUEST,
        );
      }

      const orderProductItemData = new CreateOrderProductItemDto();
      orderProductItemData.orderProductId = orderProductResponse['id'];
      orderProductItemData.createdBy = member['id'];

      if (mareId) {
        const mare = await getRepository(Horse)
          .createQueryBuilder('horse')
          .select('horse.id as id')
          .andWhere('horse.horseUuid = :horseUuid', { horseUuid: mareId })
          .getRawOne();
        orderProductItemData.mareId = mare.id;
      }
      orderProductItemData.commonList = locations.toString();
      if (stallions.length > 0) {
        let result = await Promise.all(
          stallions.map(async (element) => {
            const stallion = await getRepository(Stallion)
              .createQueryBuilder('stallion')
              .select('stallion.id as id')
              .andWhere('stallion.stallionUuid = :stallionUuid', {
                stallionUuid: element,
              })
              .getRawOne();
            orderProductItemData.stallionId = stallion.id;
            await this.orderProductItemService.create(orderProductItemData);
            await this.reportProductItemService.create({...orderProductItemData,stallionId: stallion.id});
          }),
        );
        if (orderProductResponse) {
          await this.orderReportStatusService.create({
            orderProductId: orderProductResponse['id'],
            createdBy: member['id'],
            orderStatusId: orderStatus?.id,
          });

          const createTransactionDto = new CreateTransactionDto();
          createTransactionDto.createdBy = member['id'];
          createTransactionDto.discount = 0;
          createTransactionDto.total = 0;
          createTransactionDto.subTotal = 0;
          createTransactionDto.status = 'not apllicable';
          createTransactionDto.paymentStatus = PAYMENT_STATUS.UNPAID;
          createTransactionDto.memberId = member['id'];
          createTransactionDto.orderId = orderResponse['id'];

          await this.orderTransactionService.create(
            createTransactionDto,
          );
        }
      }
    }

    return orderResponse;
  }

  //SalesCatelogue Report
  async salesCatelogueReport(salesCatelogueCartDto: SalesCatelogueOrderDto) {
    const member = this.request.user;
    let orderResponse;
    const {
      actionType,
      currencyId,
      orderProductId,
      countryId,
      postalCode,
      sales,
      lots,
      location,
    } = salesCatelogueCartDto;
    if (actionType == 'approve') {
      const orderProductInfo = await this.orderProductService.findOne(
        orderProductId,
      );
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
      await this.orderProductService.update(
        { id: orderProductInfo?.id },
        { orderStatusId: orderStatus?.id, modifiedBy: member['id'], modifiedOn: new Date() },
      );
      await this.orderReportStatusService.create({
        orderProductId: orderProductInfo?.id,
        createdBy: member['id'],
        orderStatusId: orderStatus?.id,
      });

      this.generateSalesCatelogue({ orderProductInfo }, member);
      return { message: 'Report Approved'}
     
    }
    //order create action
    else {
      let orderData = new Order();
      orderData.sessionId = uuidv4();
      orderData.currencyId = currencyId;
      orderData.fullName = member['fullName'];
      orderData.email = member['email'];
      orderData.countryId = countryId;
      orderData.postalCode = postalCode;
      orderData.memberId = member['id'];
      orderData.createdBy = member['id'];

      orderResponse = await this.createOrder(orderData);
      if (!orderResponse) {
        throw new HttpException(
          'Something went wrong.Order not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.ORDERED);
      const orderProductData = new OrderProductDto();
      orderProductData.orderId = orderResponse['id'];
      orderProductData.productId = PRODUCT.STALLION_MATCH_SALES_REPORT;
      orderProductData.price = 0;
      orderProductData.quantity = 1;
      orderProductData.createdBy = member['id'];
      orderProductData['orderStatusId'] = orderStatus?.id;
      let orderProductResponse = await this.orderProductService.create(
        orderProductData,
      );
      if (!orderProductResponse) {
        throw new HttpException(
          'Something went wrong.Order product not created',
          HttpStatus.BAD_REQUEST,
        );
      }

      const orderProductItemData = new CreateOrderProductItemDto();
      orderProductItemData.orderProductId = orderProductResponse['id'];
      orderProductItemData.commonList = location.toString();
      orderProductItemData.sales = sales.toString();
      orderProductItemData.createdBy = member['id'];

      if (lots.length > 0) {
        let result = await Promise.all(
          lots.map(async (element) => {
            orderProductItemData.lotId = element;
            await this.orderProductItemService.create(orderProductItemData);
            await this.reportProductItemService.create({...orderProductItemData, lotId: element});
          }),
        );
      }
      if (orderProductResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductResponse['id'],
          createdBy: member['id'],
          orderStatusId: ORDER_STATUS.ORDERED,
        });

        const createTransactionDto = new CreateTransactionDto();
        createTransactionDto.createdBy = member['id'];
        createTransactionDto.discount = 0;
        createTransactionDto.total = 0;
        createTransactionDto.subTotal = 0;
        createTransactionDto.status = 'not apllicable';
        createTransactionDto.paymentStatus = PAYMENT_STATUS.UNPAID;
        createTransactionDto.memberId = member['id'];
        createTransactionDto.orderId = orderResponse['id'];

        const record = await this.orderTransactionService.create(
          createTransactionDto,
        );
      }
    }

    return orderResponse;
  }

  //Stock Sale Report
  async stockSaleReport(stockSaleOrderDto: StockSaleOrderDto) {
    const member = this.request.user;
    let orderResponse;
    const {
      actionType,
      currencyId,
      orderProductId,
      countryId,
      postalCode,
      sales,
      lots,
      location,
      stallionId
    } = stockSaleOrderDto;
    if (actionType == 'approve') {
      const orderProductInfo = await this.orderProductService.findOne(
        orderProductId,
      );
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.INITIATED);
      await this.orderProductService.update(
        { id: orderProductInfo?.id },
        { orderStatusId: orderStatus?.id, modifiedBy: member['id'], modifiedOn: new Date() },
      );
      await this.orderReportStatusService.create({
        orderProductId: orderProductInfo?.id,
        createdBy: member['id'],
        orderStatusId: orderStatus?.id,
      });

      this.generateStockSale({ orderProductInfo }, member);
      return { message: 'Report Approved'}
     
    }
    //order create action
    else {
      let orderData = new Order();
      orderData.sessionId = uuidv4();
      orderData.currencyId = currencyId;
      orderData.fullName = member['fullName'];
      orderData.email = member['email'];
      orderData.countryId = countryId;
      orderData.postalCode = postalCode;
      orderData.memberId = member['id'];
      orderData.createdBy = member['id'];

      orderResponse = await this.createOrder(orderData);
      if (!orderResponse) {
        throw new HttpException(
          'Something went wrong.Order not created',
          HttpStatus.BAD_REQUEST,
        );
      }
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.ORDERED);
      let products = await getRepository(Product).createQueryBuilder('product')
      .select(
        'DISTINCT product.id as productId, product.productName as productName, product.productCode as productCode',
      )
      .andWhere('product.isActive = 1')
      .getRawMany();

     
      const orderProductData = new OrderProductDto();
      orderProductData.orderId = orderResponse['id'];
      orderProductData.productId =  products.find(obj => obj.productCode == productCodeList.REPORT_STALLION_BREEDING_STOCK_SALE).productId;;
      orderProductData.price = 0;
      orderProductData.quantity = 1;
      orderProductData.createdBy = member['id'];
      orderProductData['orderStatusId'] = orderStatus?.id;
      let orderProductResponse = await this.orderProductService.create(
        orderProductData,
      );
      if (!orderProductResponse) {
        throw new HttpException(
          'Something went wrong.Order product not created',
          HttpStatus.BAD_REQUEST,
        );
      }

      const orderProductItemData = new CreateOrderProductItemDto();
      orderProductItemData.orderProductId = orderProductResponse['id'];
      orderProductItemData.commonList = location.toString();
      orderProductItemData.sales = sales.toString();
      orderProductItemData.createdBy = member['id'];
      const stallion = await getRepository(Stallion)
              .createQueryBuilder('stallion')
              .select('stallion.id as id')
              .andWhere('stallion.stallionUuid = :stallionUuid', {
                stallionUuid: stallionId,
              })
              .getRawOne();
            orderProductItemData.stallionId = stallion.id;

      if (lots.length > 0) {
        let result = await Promise.all(
          lots.map(async (element) => {
            orderProductItemData.lotId = element;
            await this.orderProductItemService.create(orderProductItemData);
            await this.reportProductItemService.create({...orderProductItemData, lotId: element});
          }),
        );
      }
      if (orderProductResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductResponse['id'],
          createdBy: member['id'],
          orderStatusId: ORDER_STATUS.ORDERED,
        });

        const createTransactionDto = new CreateTransactionDto();
        createTransactionDto.createdBy = member['id'];
        createTransactionDto.discount = 0;
        createTransactionDto.total = 0;
        createTransactionDto.subTotal = 0;
        createTransactionDto.status = 'not apllicable';
        createTransactionDto.paymentStatus = PAYMENT_STATUS.UNPAID;
        createTransactionDto.memberId = member['id'];
        createTransactionDto.orderId = orderResponse['id'];

        const record = await this.orderTransactionService.create(
          createTransactionDto,
        );
      }
    }

    return orderResponse;
  }

  //Activate/Deactivate a Link
  async activateDeactivateLink(orderProductId, actionType) {
    const member = this.request.user;
    let booleanVal = actionType == 1 ? true : false;
    let result = await this.orderProductService.update(
      { orderProductUuid: orderProductId },
      {
        modifiedBy: member['id'],
        isLinkActive: booleanVal,
        modifiedOn: new Date(),
      },
    );
    if (result) return 'Updated Successfully';
  }

  // Generate Stallion affinity report
  async generateStallionAffinity(data,member){
    const { stallionId, orderProductInfo } = data;
    let getLink =
      await this.reportTemplatesService.generateStallionAffinityReport(
        stallionId,
        [],
        orderProductInfo?.fullName,
        orderProductInfo?.email,
      );
    if (getLink) {
      orderProductInfo['reportLink'] = getLink;
      orderProductInfo['productName'] = 'Stallion Affinity Report';
      this.sendNotication(orderProductInfo,member);
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      const orderResponse = await this.orderProductService.update(
        { id: orderProductInfo?.id },
        {
          orderStatusId: orderStatus?.id,
          pdfLink: getLink,
          isLinkActive: true,
          modifiedBy: member['id'],
          modifiedOn: new Date(),
        },
      );
      if (orderResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductInfo?.id,
          createdBy: member['id'],
          orderStatusId: orderStatus?.id,
        });
      }
    }
  }

  // Generate Broodmare affinity report
  async generateBroodmareAffinity(data,member){
    const {mareId, countryId, orderProductInfo} = data;
    let getLink =
      await this.reportTemplatesService.generateBroodmareAffinityReport(
        mareId,
        countryId,
        [],
        orderProductInfo?.fullName,
        orderProductInfo?.email,
      );
    if (getLink) {
      orderProductInfo['reportLink'] = getLink;
      orderProductInfo['productName'] = 'Broodmare Affinity Report';
      this.sendNotication(orderProductInfo,member);
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      const orderResponse = await this.orderProductService.update(
        { id: orderProductInfo?.id },
        {
          orderStatusId: orderStatus?.id,
          pdfLink: getLink,
          isLinkActive: true,
          modifiedBy: member['id'],
          modifiedOn: new Date(),
        },
      );
      if (orderResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductInfo?.id,
          createdBy: member['id'],
          orderStatusId: orderStatus?.id,
        });
      }
    }
  }

  // Generate Broodmare Sire affinity report
  async generateBroodmareSire(data,member){
    const {mareId, orderProductInfo, stallionIds} = data;
    let getLink =
      await this.reportTemplatesService.generateBroodMareSireReport(
        mareId,
        stallionIds,
        [],
        orderProductInfo?.fullName,
      );
    if (getLink) {
      orderProductInfo['productInfo'] = getLink;
      orderProductInfo['productName'] = 'Broodmare Sire Report';
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      const orderResponse = await this.orderProductService.update(
        { id: orderProductInfo?.id },
        {
          orderStatusId: orderStatus?.id,
          pdfLink: getLink,
          isLinkActive: true,
          modifiedBy: member['id'],
          modifiedOn: new Date(),
        },
      );
      if (orderResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductInfo?.id,
          createdBy: member['id'],
          orderStatusId: orderStatus?.id,
        });
      }
    }
  }

  // Generate Shortlist Stallion affinity report
  async generateShortlistStallion(data,member){
    const {mareId, orderProductInfo, stallionIds} = data;
    let getLink =
      await this.reportTemplatesService.generateStallionMatchShortlistReport(
        mareId,
        stallionIds,
        [],
        orderProductInfo?.fullName,
      );
    if (getLink) {
      orderProductInfo['reportLink'] = getLink;
      orderProductInfo['productName'] = 'Shortlist Stallion Report';
      this.sendNotication(orderProductInfo,member);
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      const orderResponse = await this.orderProductService.update(
        { id: orderProductInfo?.id },
        {
          orderStatusId: orderStatus?.id,
          pdfLink: getLink,
          isLinkActive: true,
          modifiedBy: member['id'],
          modifiedOn: new Date(),
        },
      );
      if (orderResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductInfo?.id,
          createdBy: member['id'],
          orderStatusId: orderStatus?.id,
        });
      }
    }
  }

  // Generate Stallion Match Pro affinity report
  async generateStallionMatchPro(data,member){
    const {mareId, orderProductInfo, stallionIds} = data;
    let getLink =
      await this.reportTemplatesService.generateStallionMatchProReport(
        mareId,
        stallionIds,
        [],
        orderProductInfo?.fullName,
      );
    if (getLink) {
      orderProductInfo['reportLink'] = getLink;
      orderProductInfo['productName'] = 'Stallion Match PRO Report';
      this.sendNotication(orderProductInfo,member);
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      const orderResponse = await this.orderProductService.update(
        { id: orderProductInfo?.id },
        {
          orderStatusId: orderStatus?.id,
          pdfLink: getLink,
          isLinkActive: true,
          modifiedBy: member['id'],
          modifiedOn: new Date(),
        },
      );
      if (orderResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductInfo?.id,
          createdBy: member['id'],
          orderStatusId: orderStatus?.id,
        });
      }
    }
  }

  // Generate sales Catelogue affinity report
  async generateSalesCatelogue(data,member){
    const { orderProductInfo } = data;
    let getLink =
      await this.reportTemplatesService.generateSalesCatelogueReport(
        orderProductInfo?.id,
        orderProductInfo?.fullName,
      );
    if (getLink) {
      orderProductInfo['reportLink'] = getLink;
      orderProductInfo['productName'] = 'Stallion Match Sales Report';
      this.sendNotication(orderProductInfo,member);
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      const orderResponse = await this.orderProductService.update(
        { id: orderProductInfo?.id },
        {
          orderStatusId: orderStatus?.id,
          pdfLink: getLink,
          isLinkActive: true,
          modifiedBy: member['id'],
          modifiedOn: new Date(),
        },
      );
      if (orderResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductInfo?.id,
          createdBy: member['id'],
          orderStatusId: orderStatus?.id,
        });
      }
    }
  }

  // Generate Stock Sale report
  async generateStockSale(data,member){
    const { orderProductInfo } = data;
    let getLink =
      await this.reportTemplatesService.generateStockSaleReport(
        orderProductInfo?.id,
        orderProductInfo?.fullName,
      );
    if (getLink) {
      orderProductInfo['reportLink'] = getLink;
      orderProductInfo['productName'] = 'Stallion X Breeding Stock Sale Report';
      this.sendNotication(orderProductInfo,member);
      const orderStatus = await this.orderStatusService.findOneByStatusCode(ordersStatusList.COMPLETED);
      const orderResponse = await this.orderProductService.update(
        { id: orderProductInfo?.id },
        {
          orderStatusId: orderStatus?.id,
          pdfLink: getLink,
          isLinkActive: true,
          modifiedBy: member['id'],
          modifiedOn: new Date(),
        },
      );
      if (orderResponse) {
        await this.orderReportStatusService.create({
          orderProductId: orderProductInfo?.id,
          createdBy: member['id'],
          orderStatusId: orderStatus?.id,
        });
      }
    }
  }


  async sendNotication(productInfo,member){
    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.orderDevilvery,
      );
    const messageText = messageTemplate.messageText.replace('{reportName}',productInfo?.productName);
    const messageTitle = messageTemplate.messageTitle;
    this.notificationsService.create({
      createdBy: member['id'],
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: productInfo?.createdBy,
      messageTitle,
      messageText,
      actionUrl: productInfo?.reportLink,
      isRead: false,
    });
  }

}
