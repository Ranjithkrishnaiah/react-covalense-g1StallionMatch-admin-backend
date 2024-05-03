import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmLocationDto } from './dto/farm-location.dto';
import { FarmLocation } from './entities/farm-location.entity';

@Injectable()
export class FarmLocationsService {
  constructor(
    @InjectRepository(FarmLocation)
    private farmLocationRepository: Repository<FarmLocation>,
  ) {}

  // Add a farm location
  async create(farmLocationDto: FarmLocationDto) {
    return this.farmLocationRepository.save(
      this.farmLocationRepository.create(farmLocationDto),
    );
  }

  // Update a farm location
  async update(id: number, farmLocationDto: FarmLocationDto) {
    return this.farmLocationRepository.update({ farmId: id }, farmLocationDto);
  }

  // Get a farm location by farmId
  async findByFarmId(farmId: number) {
    const record = await this.farmLocationRepository.findOne({ farmId });
    if (!record) {
      throw new UnprocessableEntityException('Farm location not exist!');
    }
    return record;
  }
}
