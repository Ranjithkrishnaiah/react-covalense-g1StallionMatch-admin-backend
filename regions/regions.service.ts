import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
  ) {}
  /* Get Race Weathers List */
  findAll() {
    return this.regionRepository.find({});
  }
  /* Get Race Weather */
  findOne(id: number) {
    return this.regionRepository.find({
      id,
    });
  }
}
