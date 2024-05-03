import { Inject, Scope, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { CreateFeatureDto } from './dto/feature.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FeatureResponseDto } from './dto/feature-response.dto';

@Injectable({ scope: Scope.REQUEST })
export class FeatureService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Feature)
    private featureRepository: Repository<Feature>,
  ) {}

  //Get all records
  findAll(): Promise<FeatureResponseDto[]> {
    return this.featureRepository.find();
  }

  //Get a record
  findOne(id: number): Promise<FeatureResponseDto[]> {
    return this.featureRepository.find({ id });
  }

  //Create a record
  async create(createFeature: CreateFeatureDto) {
    createFeature.createdBy = 1;
    const response = await this.featureRepository.save(
      this.featureRepository.create(createFeature),
    );
    return response;
  }
}
