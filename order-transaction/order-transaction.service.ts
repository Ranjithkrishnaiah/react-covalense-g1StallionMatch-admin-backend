import {
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { OrderTransaction } from './entities/order-transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { RecentOrderResponse } from 'src/order-product/dto/recent-order-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { Member } from 'src/members/entities/member.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderTransactionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OrderTransaction)
    private orderTransactionRepository: Repository<OrderTransaction>,
  ) {}

  //Get a Recent Order
  async findRecentOrder(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<RecentOrderResponse[]>> {
    const queryBuilder = this.orderTransactionRepository
      .createQueryBuilder('orderTransaction')
      .select(
        'orderTransaction.id as orderId,orderTransaction.paymentIntent as paymentIntent,orderTransaction.mode as paymentMode, orderTransaction.status as status,orderTransaction.total as total,orderTransaction.subTotal as subTotal,orderTransaction.discount as discount, orderTransaction.createdOn as orderCreatedOn ',
      )
      .addSelect('paymentstatus.statusName as paymentStatus')
      .addSelect('product.id as productId, product.productName as productName')
      .addSelect('paymentmethod.paymentMethod as paymentMethod')
      .addSelect('order.fullName as clientName, order.email as email')
      .addSelect('country.countryCode as countryCode')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .innerJoin('orderTransaction.paymentstatus', 'paymentstatus')
      .innerJoin('orderTransaction.paymentmethod', 'paymentmethod')
      .innerJoin('orderTransaction.orderproduct', 'orderproduct')
      .innerJoin('orderproduct.order', 'order')
      .innerJoin('order.country', 'country')
      .innerJoin('order.currency', 'currency')
      .innerJoin('orderproduct.product', 'product');

    if (searchOptionsDto.fromDate && searchOptionsDto.toData) {
      queryBuilder.andWhere(
        'orderTransaction.createdOn >= CONVERT(date, :fromDate) AND orderTransaction.createdOn <= CONVERT(date, :toData)',
        {
          fromDate: searchOptionsDto.fromDate,
          toData: searchOptionsDto.toData,
        },
      );
    }

    queryBuilder
      .orderBy('orderTransaction.id', searchOptionsDto.order)
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });
    return new PageDto(entities, pageMetaDto);
  }

  //Get a Popular PaymentMethod
  async findPopularPaymentMethod(searchOptionsDto: SearchOptionsDto) {
    const queryBuilder = this.orderTransactionRepository
      .createQueryBuilder('ordTrans')
      .select(
        'paymentmethod.paymentMethod, COUNT(paymentmethod.paymentMethod) count',
      )
      .innerJoin('ordTrans.paymentmethod', 'paymentmethod')
      .groupBy('paymentmethod.paymentMethod')
      .orderBy('count', 'DESC');

    if (searchOptionsDto.fromDate && searchOptionsDto.toData) {
      queryBuilder
        .andWhere('ordTrans.createdOn >= :fromDate', {
          fromDate: new Date(searchOptionsDto.fromDate),
        })
        .andWhere('ordTrans.createdOn <= :toData', {
          toData: new Date(searchOptionsDto.toData),
        });
    }

    queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  //Create a order transaction
  async create(createTransactionDto: CreateTransactionDto) {
    const record = await this.orderTransactionRepository.save(
      this.orderTransactionRepository.create(createTransactionDto),
    );
    return record;
  }

  //Get a RecentOrder By Member
  async findRecentOrderByMember(id) {
    const member = await getRepository(Member).findOne({ memberuuid: id });
    const queryBuilder = this.orderTransactionRepository
      .createQueryBuilder('orderTransaction')
      .select(
        'product.id as productId, product.productName as productName,orderTransaction.id as orderId',
      )
      .innerJoin('orderTransaction.orderproduct', 'orderproduct')
      .innerJoin('orderproduct.order', 'order')
      .innerJoin('orderproduct.product', 'product')
      .andWhere('orderTransaction.memberId  = :memberId', {
        memberId: member.id,
      });

    queryBuilder.orderBy('orderTransaction.createdOn ', 'DESC').limit(20);
    const entities = await queryBuilder.getRawMany();
    return entities;
  }
}
