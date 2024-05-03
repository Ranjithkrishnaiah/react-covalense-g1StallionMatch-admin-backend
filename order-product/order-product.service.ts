import {
  Inject,
  Injectable,
  Scope
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { OrderProductDto } from './dto/order-product.dto';
import { OrderProduct } from './entities/order-product.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderProductService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OrderProduct)
    private orderProductRepository: Repository<OrderProduct>,
  ) { }
  /* Create Order Product */
  async create(orderProductDto: OrderProductDto) {
    const record = await this.orderProductRepository.save(
      this.orderProductRepository.create(orderProductDto),
    );
    return record;
  }

  /* Update Order Product */
  async update(conditions, attributes) {
    let result = await this.orderProductRepository.update(
      conditions,
      attributes,
    );
    return result;
  }

  /* Get Order Product */
  async findOne(orderProductId) {
    let queryBuilder = await this.orderProductRepository
      .createQueryBuilder('op')
      .select('op.id id, op.createdBy createdBy')
      .addSelect('member.fullName fullName,member.email email')
      .innerJoin('op.member', 'member')
      .andWhere('op.orderProductUuid = :orderProductUuid', {
        orderProductUuid: orderProductId,
      })
      .getRawOne();

    return queryBuilder;
  }
}
