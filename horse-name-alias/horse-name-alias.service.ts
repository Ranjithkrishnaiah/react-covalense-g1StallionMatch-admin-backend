import {
  HttpStatus,
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult, getRepository } from 'typeorm';
import { HorseNameAlias } from './entities/horse-name-alias.entity';
import { Request } from 'express';
import { HorseNameAliasDto } from './dto/create-alias.dto';
import { HorsesService } from 'src/horses/horses.service';
import { UpdateVisibilityDto } from './dto/change_visibility.dto';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Horse } from 'src/horses/entities/horse.entity';

@Injectable({ scope: Scope.REQUEST })
export class HorseNameAliasService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(HorseNameAlias)
    private horseNameAliasRepository: Repository<HorseNameAlias>,
    private horseService: HorsesService,
  ) {}

  //Get Alias Names
  async getAliasNames(
    horseId: string,
    pageOptionsDto,
  ): Promise<PageDto<Object>> {
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    const queryBuilder: any = this.horseNameAliasRepository
      .createQueryBuilder('name')
      .select(
        'name.horseId as horseId,horse.horseUuid, name.horseName as horseName,name.isActive, name.isDefault',
      )
      .leftJoin('name.horse', 'horse')
      .andWhere('name.horseId = :horseId', { horseId: horse.id });

    queryBuilder.offset(pageOptionsDto.skip).limit(pageOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOptionsDto,
    });
    return new PageDto(entities, pageMetaDto);
  }

  //Get Defult record
  async findDefault(horseId) {
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    let queryBuilder;

    return (queryBuilder = this.horseNameAliasRepository
      .createQueryBuilder('name')
      .select('name.horseName as horseName')
      .leftJoin('name.horse', 'horse')
      .andWhere('name.horseId = :horseId', { horseId: horse.id })
      .andWhere('name.isDefault = :isDefault', { isDefault: true })
      .getRawOne());
  }

  //Create a record
  async create(data: HorseNameAliasDto) {
    const user = this.request.user;
    data.createdBy = user['id'];
    data.isActive = true;
    let horse = await this.horseService.findOne(data.horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    const createDto = {
      ...data,
      horseId: horse.id,
    };
    let AliasExist = await this.horseNameAliasRepository.findOne({
      horseId: horse.id,
      horseName: data.horseName,
      isActive: true,
    });
    let OriginalHorseNameExist = await getRepository(Horse).findOne({
      id: horse.id,
      horseName: data.horseName,
      isActive: true,
    });
    if (AliasExist) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Alias already exists',
      };
    }
    if (OriginalHorseNameExist) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Original Horse name cannot be added as Alias',
      };
    }
    await this.horseNameAliasRepository.save(
      this.horseNameAliasRepository.create(createDto),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Alias created successfully',
    };
  }

  //Update Default
  async updateDefault(horseId: string, horseName: string) {
    const user = this.request.user;
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    //find old default alias name and set isDefault to zero
    const Record = await this.horseNameAliasRepository.find({
      horseId: horse.id,
      isDefault: true,
    });

    if (Record.length > 0) {
      const updateRecord = await this.horseNameAliasRepository.update(
        { horseId: horse.id, horseName: Record[0].horseName },
        { isDefault: false, modifiedBy: user['id'] },
      );
    }
    //if No alias name is set as default , copy original horseName from horse table to Horse-alias table and set alias name as as original horse name
    else {
      let data = {
        horseId: horse.id,
        horseName: horse.horseName,
        isDefault: false,
        isActive: true,
        createdBy: user['id'],
      };

      await this.horseNameAliasRepository.save(
        this.horseNameAliasRepository.create(data),
      );
    }

    const updateResult: UpdateResult =
      await this.horseNameAliasRepository.update(
        { horseId: horse.id, horseName: horseName },
        { isActive: true, isDefault: true, modifiedBy: user['id'] },
      );
    if (updateResult.affected > 0) {
      await this.horseService.setDefaultName(horse.id, horseName);
      return {
        statusCode: HttpStatus.OK,
        message: 'Default name is updated successfully',
      };
    }
  }

  //Update Visibility
  async updateVisibility(
    horseId: string,
    horseName: string,
    updateVisibilityDto: UpdateVisibilityDto,
  ) {
    const user = this.request.user;
    updateVisibilityDto.modifiedBy = user['id'];
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    const updateRecord = await this.horseNameAliasRepository.update(
      { horseId: horse.id, horseName: horseName },
      updateVisibilityDto,
    );
    return updateRecord;
  }

  //Delete a record
  async delete(horseId, horseName) {
    let horse = await this.horseService.findOne(horseId);
    if (!horse) {
      throw new UnprocessableEntityException('Horse not found');
    }
    const deletedResult: DeleteResult =
      await this.horseNameAliasRepository.delete({
        horseId: horse.id,
        horseName: horseName,
      });
    if (deletedResult.affected > 0) {
      return {
        statusCode: 200,
        message: `This action removes a ${horseName} alias`,
        data: deletedResult,
      };
    } else {
      return {
        statusCode: 204,
        message: `This ${horseName} alias is already removed`,
        data: deletedResult,
      };
    }
  }
}
