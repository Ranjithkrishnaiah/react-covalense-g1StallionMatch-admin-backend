import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Source } from './entities/source.entity';

@Injectable()
export class SourceService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Source)
    private sourceRepository: Repository<Source>,
  ) { }
  /* Get Source List */
  async findAll() {
    return this.sourceRepository.find({});
  }
}
