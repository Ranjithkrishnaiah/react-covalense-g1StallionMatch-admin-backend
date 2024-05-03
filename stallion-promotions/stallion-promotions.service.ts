import {
  Injectable,
  Inject,
  Scope,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStallionPromotionDto } from './dto/create-stallion-promotion.dto';
import { UpdateStallionPromotionDto } from './dto/update-stallion-promotion.dto';
import { StopStallionPromotionDto } from './dto/stop-promotion.dto';
import { StallionPromotion } from './entities/stallion-promotion.entity';
import { StallionsService } from 'src/stallions/stallions.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Integer } from 'aws-sdk/clients/apigateway';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable({ scope: Scope.REQUEST })
export class StallionPromotionService {
  constructor(
    @Inject(forwardRef(() => StallionsService))
    private stallionsService: StallionsService,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionPromotion)
    private stallionPromotionRepository: Repository<StallionPromotion>,
  ) {}

  /*Add Promotion of a stallion */
  async create(createStallionPromotionDto: CreateStallionPromotionDto) {
    const member = this.request.user;
    const { stallionUuid, startDate } = createStallionPromotionDto;
    let stallion = await this.stallionsService.findOne(stallionUuid);

    if (!stallion) {
      throw new HttpException('Stallion not found', HttpStatus.NOT_FOUND);
    }
    const stallionPromotion = await this.findByStallionId(stallion.id);
    /*
     * TODO: Check stallion promotion exist between the range of input startdate and enddate
     */
    if (stallionPromotion.length > 0 && stallion.isPromoted == true) {
      throw new HttpException(
        'Already this stallion is promoted',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    var endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    var check = new Date();
    const createDto = {
      ...createStallionPromotionDto,
      stallionId: stallion.id,
      createdBy: member['id'],
      endDate: endDate,
      promotedCount: parseInt(
        stallionPromotion[0].stallionPromotion_promotedCount + 1,
      ),
      isAdminPromoted: true,
      // horseId: horse.horse_id,
      // farmId: farm.id,
      //colourId: horse.horse_colourId
    };
    const result = await this.stallionPromotionRepository.save(
      this.stallionPromotionRepository.create(createDto),
    );
    let today = new Date();
    if (result && today >= new Date(startDate)) {
      await this.stallionsService.updateStallion(stallion.id, {
        isPromoted: true,
        modifiedBy: member['id'],
      });
    }

    return result;
  }

  /*Get Promotion list */
  async findAll() {
    const queryBuilder =
      this.stallionPromotionRepository.createQueryBuilder('stallionPromotion');
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /*Get single Promotion list */
  async findOne(id: number) {
    const record = await this.stallionPromotionRepository.findOne({ id });
    if (!record) {
      throw new UnprocessableEntityException('Record not exist!');
    }
    return record;
  }

  /*Get Promotion list of a stallion */
  async findByStallionId(stallionId: Integer) {
    const queryBuilder = this.stallionPromotionRepository
      .createQueryBuilder('stallionPromotion')
      .andWhere('stallionPromotion.stallionId = :stallionId', {
        stallionId: stallionId,
      });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /*Stop Promotion of a stallion */
  async stopPromotion(id: string, stopPromotionDto: StopStallionPromotionDto) {
    const { effectiveDate } = stopPromotionDto;
    let stallionRecord = await this.stallionsService.getStallionByUuid(id);
    if (!stallionRecord) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    const member = this.request.user;
    const latestPromotionRecoed = await this.getLatestStallionPromotion(
      stallionRecord.id,
    );
    let updateStallionDto = {
      endDate: new Date(effectiveDate),
      modifiedBy: member['id'],
    };
    const response = await this.updateStallionPromotion(
      latestPromotionRecoed.id,
      updateStallionDto,
    );
    if (new Date(effectiveDate) <= new Date()) {
      const responseTwo = await this.stallionsService.updateStallion(
        stallionRecord.id,
        { isPromoted: false, modifiedBy: member['id'] },
      );
    }
    return { statusCode: 200, message: 'Stoped Promotion', data: response };
  }

  /*Get latest Promotion of a stallion */
  async getLatestStallionPromotion(stallionId: number) {
    let queryBuilder = await this.stallionPromotionRepository
      .createQueryBuilder('stallionPromotion')
      .andWhere('stallionId = :stallionId', { stallionId: stallionId })
      .orderBy('id', 'DESC')
      .limit(1);
    const itemCount = await queryBuilder.getCount();
    if (!itemCount) {
      throw new NotFoundException(
        'No promotion records found to this stallion!',
      );
    }
    return await queryBuilder.getRawOne();
  }

  /*Update a Promotion with id*/
  async updateStallionPromotion(
    id: number,
    updateStallionNominationDto: UpdateStallionPromotionDto,
  ) {
    return this.stallionPromotionRepository.update(
      { id: id },
      updateStallionNominationDto,
    );
  }

  /*Update a Promotion */
  async updatePromotion(updatePromotionDto: UpdatePromotionDto) {
    const { newDate, promotionId } = updatePromotionDto;
    const member = this.request.user;
    var endDate = new Date(newDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    let updateStallionDto = {
      startDate: newDate,
      endDate: endDate,
      modifiedBy: member['id'],
    };

    const result = await this.findOne(promotionId);
    let newDateFormat = new Date(newDate).toLocaleDateString();
    let startDateFormat = new Date(result.startDate).toLocaleDateString();
    if (result && newDateFormat == startDateFormat) {
      throw new HttpException(
        'Already this stallion is promoted with same date',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const response = await this.updateStallionPromotion(
      promotionId,
      updateStallionDto,
    );
    let today = new Date();
    if (result && today >= new Date(newDate)) {
      await this.stallionsService.updateStallion(result.stallionId, {
        isPromoted: true,
        modifiedBy: member['id'],
      });
    }

    return { statusCode: 200, message: 'Updated Promotion', data: response };
  }

  /* Stop Promotion by id */
  async stopPromotionById(
    id: number,
    stopPromotionDto: StopStallionPromotionDto,
  ) {
    const { effectiveDate } = stopPromotionDto;

    const member = this.request.user;
    const latestPromotionRecoed = await this.findOne(id);

    let updateStallionDto = {
      endDate: new Date(effectiveDate),
      modifiedBy: member['id'],
    };
    const response = await this.updateStallionPromotion(id, updateStallionDto);
    if (new Date(effectiveDate) <= new Date()) {
      const responseTwo = await this.stallionsService.updateStallion(
        latestPromotionRecoed.stallionId,
        { isPromoted: false, modifiedBy: member['id'] },
      );
    }

    return { statusCode: 200, message: 'Stoped Promotion', data: response };
  }
}
