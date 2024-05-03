import {
  HttpStatus,
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { HorsesService } from 'src/horses/horses.service';
import { DeleteResult, Repository, UpdateResult, getRepository } from 'typeorm';
import { HorseCobAlias } from './entities/horse-cob-alias.entity';
import { Request } from 'express';
import { CreateCobAliasDto } from './dto/create-cob-alias.dto';
import { UpdateCobVisibilityDto } from './dto/change-cob-visibility.dto';
import { HorseCobAliasResponse } from './dto/get-alias-response.dto';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Horse } from 'src/horses/entities/horse.entity';

@Injectable({ scope: Scope.REQUEST })
export class HorseCobAliasService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(HorseCobAlias)
    private horseCobAliasRepository: Repository<HorseCobAlias>,
    private horseService: HorsesService,
  ) {}

  //Get Alias Countries
  async getAliasCountries(
    horseId: string,
    PageOptionsDto,
  ): Promise<PageDto<HorseCobAliasResponse>> {
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    const queryBuilder: any = this.horseCobAliasRepository
      .createQueryBuilder('cob')
      .select(
        'cob.horseId as horseId,horse.horseUuid ,horse.horseName, cob.countryId as countryId,cob.isActive, cob.isDefault',
      )
      .addSelect(
        'country.countryCode as countryCode,country.countryName as countryNames',
      )
      .leftJoin('cob.country', 'country')
      .innerJoin('cob.horse', 'horse')
      .andWhere('cob.horseId = :horseId', { horseId: horse.id });

    queryBuilder.offset(PageOptionsDto.skip).limit(PageOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: PageOptionsDto,
    });
    return new PageDto(entities, pageMetaDto);
  }

  //Create a record
  async create(data: CreateCobAliasDto) {
    let horse = await this.horseService.findOne(data.horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    const user = this.request.user;
    data.createdBy = user['id'];
    data.isActive = true;
    const createDto = {
      ...data,
      horseId: horse.id,
    };
    let AliasExist = await this.horseCobAliasRepository.findOne({
      horseId: horse.id,
      countryId: data.countryId,
    });
    let OriginalHorseCountryExist = await getRepository(Horse).findOne({
      id: horse.id,
      countryId: data.countryId,
      isActive: true,
    });

    if (AliasExist) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Alias already exists',
      };
    }
    if (OriginalHorseCountryExist) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Original Horse country cannot be added as Alias',
      };
    }
    let alias = await this.horseCobAliasRepository.save(
      this.horseCobAliasRepository.create(createDto),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Alias created successfully',
    };
  }

  //Update Default
  async updateDefault(horseId: string, countryId: number) {
    const user = this.request.user;
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    //find old default cob and set isDefault to zero
    const Record = await this.horseCobAliasRepository.find({
      horseId: horse.id,
      isDefault: true,
    });
    if (Record.length > 0) {
      const updateRecord = await this.horseCobAliasRepository.update(
        { horseId: horse.id, countryId: Record[0].countryId },
        { isDefault: false, modifiedBy: user['id'] },
      );
    } else {
      let data = {
        horseId: horse.id,
        countryId: horse.countryId,
        isDefault: false,
        isActive: true,
        createdBy: user['id'],
      };

      const horseResponse = await this.horseCobAliasRepository.save(
        this.horseCobAliasRepository.create(data),
      );
    }

    const updateResult: UpdateResult =
      await this.horseCobAliasRepository.update(
        { horseId: horse.id, countryId: countryId },
        { isDefault: true, isActive: true, modifiedBy: user['id'] },
      );

    if (updateResult.affected > 0) {
      await this.horseService.setDefaultCob(horse.id, countryId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Default country is updated successfully',
      };
    }
  }

  //Update Visibility
  async updateVisibility(
    horseId: string,
    countryId: number,
    updateVisibilityDto: UpdateCobVisibilityDto,
  ) {
    const user = this.request.user;
    updateVisibilityDto.modifiedBy = user['id'];
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    const updateRecord = await this.horseCobAliasRepository.update(
      { horseId: horse.id, countryId: countryId },
      updateVisibilityDto,
    );
    return updateRecord;
  }

  //Delete a record
  async delete(horseId, countryId) {
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    const deletedResult: DeleteResult =
      await this.horseCobAliasRepository.delete({
        horseId: horse.id,
        countryId: countryId,
      });
    if (deletedResult.affected > 0) {
      return {
        statusCode: 200,
        message: `This action removes a ${countryId} alias`,
        data: deletedResult,
      };
    } else {
      return {
        statusCode: 204,
        message: `This ${countryId} alias is already removed`,
        data: deletedResult,
      };
    }
  }

  //Get Default
  async findDefault(horseId) {
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    let queryBuilder;
    return (queryBuilder = await this.horseCobAliasRepository
      .createQueryBuilder('cob')
      .select('country.countryName as countryNames,country.id as countryId')
      .leftJoin('cob.country', 'country')
      .innerJoin('cob.horse', 'horse')
      .andWhere('cob.horseId = :horseId', { horseId: horse.id })
      .andWhere('cob.isDefault = :isDefault', { isDefault: true })
      .getRawOne());
  }
}
