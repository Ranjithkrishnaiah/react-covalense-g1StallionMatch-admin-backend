import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Repository, getRepository } from 'typeorm';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { SearchOptionsPromoDto } from './dto/search-options.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { PromoCode } from './entities/promo-code.entity';
const moment = require('moment');

@Injectable({ scope: Scope.REQUEST })
export class PromoCodeService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
  ) { }
  /* Get All Promo Codes */
  async findAll(
    PromoCodeDto: SearchOptionsPromoDto,
  ): Promise<PageDto<PromoCode>> {
    const queryBuilder = getRepository(PromoCode)
      .createQueryBuilder('PromoCode')
      .select(
        'PromoCode.id as id, PromoCode.promoCodeName as promoCodeName, PromoCode.promoCode as promoCode, PromoCode.discountType as discountType, PromoCode.price as price,PromoCode.redemtions as redemtions,PromoCode.startDate as startDate,PromoCode.endDate as endDate,PromoCode.isActive as isActive,PromoCode.createdOn as createdOn, PromoCode.currencyId as currencyId',
      );
    if (PromoCodeDto.sortBy) {
      const sortBy = PromoCodeDto.sortBy;
      const byOrder = PromoCodeDto.order;
      if (sortBy.toLowerCase() === 'promocodename') {
        queryBuilder.orderBy('PromoCode.promoCodeName', byOrder);
      }
      if (sortBy.toLowerCase() === 'promocode') {
        queryBuilder.orderBy('PromoCode.promoCode', byOrder);
      }
      if (sortBy.toLowerCase() === 'discounttype') {
        queryBuilder.orderBy('PromoCode.discountType', byOrder);
      }
      if (sortBy.toLowerCase() === 'price') {
        queryBuilder.orderBy('PromoCode.price ', byOrder);
      }
      if (sortBy.toLowerCase() === 'redemtions') {
        queryBuilder.orderBy('PromoCode.redemtions', byOrder);
      }
      if (sortBy.toLowerCase() === 'startdate') {
        queryBuilder.orderBy('PromoCode.startDate', byOrder);
      }
      if (sortBy.toLowerCase() === 'enddate') {
        queryBuilder.orderBy('PromoCode.endDate', byOrder);
      }
      if (sortBy.toLowerCase() === 'createdon') {
        queryBuilder.orderBy('PromoCode.createdOn', byOrder);
      }
      if (sortBy.toLowerCase() === 'currencyid') {
        queryBuilder.orderBy('PromoCode.currencyId', byOrder);
      }
      if (sortBy.toLowerCase() === 'isactive') {
        queryBuilder.orderBy('PromoCode.isActive', byOrder);
      }
      if (sortBy.toLowerCase() === 'id') {
        queryBuilder.orderBy('PromoCode.id', byOrder);
      }
    }

    queryBuilder.offset(PromoCodeDto.skip).limit(PromoCodeDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: PromoCodeDto,
    });
    return new PageDto(entities, pageMetaDto);
  }
  /* Get PromoCode */
  findOne(fields: any): Promise<any> {
    return this.promoCodeRepository.findOne({
      where: fields,
    });
  }
  /* Create Promocode */
  async create(data: CreatePromoCodeDto) {
    const existResult = await this.findOne({ promoCode: data.promoCode });
    if (existResult) {
      throw new UnprocessableEntityException('Promocode already exists');
    }
    if (['Fixed'].includes(data?.discountType)) {
      delete data.productids;
    }

    if (['Percentage'].includes(data?.discountType)) {
      delete data.currencyId;
      delete data.productids;
    }

    if (['Products'].includes(data?.discountType)) {
      delete data.currencyId;
      delete data.price;
    }

    if (['Forever'].includes(data?.durationType)) {
      delete data.startDate;
      delete data.endDate;
      delete data.duration;
      delete data.durationNo;
    }
    if (['Once'].includes(data?.durationType)) {
      delete data.endDate;
      delete data.duration;
      delete data.durationNo;
    }
    if (['Multiple'].includes(data?.durationType)) {
      const duration = data?.duration.charAt(0);
      const startDate = new Date();
      data = {
        ...data,
        startDate: startDate,
        endDate: moment(startDate).add(data?.durationNo, duration).toDate(),
      };
    }
    const user = this.request.user;
    if (data.inputProductIds && data.inputProductIds.length > 0) {
      data = {
        ...data,
        productids: data.inputProductIds.join(','),
      };
    }
    if (data.inputUserIds && data.inputUserIds.length > 0) {
      data = {
        ...data,
        userIds: data.inputUserIds.join(','),
      };
    }

    const createData = {
      ...data,
      memberId: null,
      createdBy: user['id'],
    };
    delete createData.inputProductIds;
    delete createData.inputUserIds;

    let promoCode = await this.promoCodeRepository.save(
      this.promoCodeRepository.create(createData),
    );
    return {
      statusCode: 200,
      message: 'PromoCode added successfully',
      data: { promoCode: promoCode },
    };
    // return promoCode
  }

  async update(id: number, data: UpdatePromoDto) {
    const user = this.request.user;
    let found = await this.promoCodeRepository.findOne(id);
    if (found) {
      if (['Fixed'].includes(data?.discountType)) {
        delete data.productids;
      }

      if (['Percentage'].includes(data?.discountType)) {
        delete data.currencyId;
        delete data.productids;
      }

      if (['Products'].includes(data?.discountType)) {
        delete data.currencyId;
        delete data.price;
      }

      if (['Forever'].includes(data?.durationType)) {
        delete data.startDate;
        delete data.endDate;
        delete data.duration;
        delete data.durationNo;
      }
      if (['Once'].includes(data?.durationType)) {
        delete data.endDate;
        delete data.duration;
        delete data.durationNo;
      }
      if (data.startDate && ['Multiple'].includes(data?.durationType)) {
        const duration = data?.duration.charAt(0);
        data = {
          ...data,
          endDate: moment(data.startDate)
            .add(data?.durationNo, duration)
            .toDate(),
        };
      }
      const user = this.request.user;
      if (data.inputProductIds) {
        data = {
          ...data,
          productids: data.inputProductIds.join(','),
        };
      }
      if (data.inputUserIds) {
        data = {
          ...data,
          userIds: data.inputUserIds.join(','),
        };
      }

      if (!data.startDate) delete data.startDate;
      if (!data.endDate) delete data.endDate;

      const updateData = {
        ...data,
        memberId: null,
        createdBy: user['id'],
      };

      delete updateData.inputProductIds;
      delete updateData.inputUserIds;
      const response = await this.promoCodeRepository.update(id, updateData);
      if (response.affected > 0) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Record Updated successfully!',
        };
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `PromoCode_Not_Found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
  /* Delete PromoCode */
  async delete(id) {
    const record = await this.promoCodeRepository.findOne(id);
    if (!record) {
      throw new UnprocessableEntityException('Promo Code not exist!');
    }
    const response = await this.promoCodeRepository.delete(id);

    if (response.affected) {
      return `PromoCode #${id} record deleted succesfully.`;
    } else {
      return `No data deleted for PromoCode #${id}.`;
    }
  }
  /* Export Promocode */
  async download() {
    const entities = getRepository(PromoCode)
      .createQueryBuilder('PromoCode')
      .select(
        'PromoCode.id as id, PromoCode.promoCodeName as promoCodeName, PromoCode.promoCode as promoCode, PromoCode.discountType as discountType, PromoCode.price as price,PromoCode.redemtions as redemtions,PromoCode.startDate as startDate,PromoCode.endDate as endDate,PromoCode.isActive as isActive,PromoCode.createdOn as createdOn, PromoCode.currencyId as currencyId',
      )
      .getRawMany();
    return entities;
  }
}
