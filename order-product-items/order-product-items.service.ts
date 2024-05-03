import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderProductItemDto } from './dto/create-order-product-item.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { OrderProductItem } from './entities/order-product-item.entity';

@Injectable()
export class OrderProductItemsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OrderProductItem)
    private orderProductItemRepository: Repository<OrderProductItem>,
  ) {}

  //Create a order product item
  async create(createOrderProductItemDto: CreateOrderProductItemDto) {
    const record = await this.orderProductItemRepository.save(
      this.orderProductItemRepository.create(createOrderProductItemDto),
    );
    return record;
  }
}
