import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderReportStatusDto } from './dto/create-order-report-status.dto';
import { OrderReportStatus } from './entities/order-report-status.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderReportStatusService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OrderReportStatus)
    private orderReportStatusRepository: Repository<OrderReportStatus>,
  ) {}

  //Create a record
  async create(orderReportStatus: CreateOrderReportStatusDto) {
    const createOrderReportStatusResponse =
      await this.orderReportStatusRepository.save(
        this.orderReportStatusRepository.create(orderReportStatus),
      );
    return createOrderReportStatusResponse;
  }

  //Get a record by OrderProductId
  async findByOrderProductId(orderProductId: number) {
    let queryBuilder = this.orderReportStatusRepository
      .createQueryBuilder('ors')
      .select('ors.createdOn as statusTime, orderStatus.status')
      .innerJoin('ors.orderStatus', 'orderStatus')
      .andWhere('ors.orderProductId = :orderProductId', { orderProductId })
      .orderBy('ors.id');

    return await queryBuilder.getRawMany();
  }
}
