import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from './entities/order-status.entity';
import { OrderStatusResponseDto } from './dto/order-status-response.dto';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(OrderStatus)
    private orderStatusRepository: Repository<OrderStatus>,
  ) {}

  async findAll(): Promise<OrderStatusResponseDto[]> {
    return await this.orderStatusRepository.find();
  }

  //to get order status single record by statusCode
  async findOneByStatusCode(statusCode: string) {

    return await this.orderStatusRepository.findOne({

      orderStatusCode: statusCode,

    });

  }
}
