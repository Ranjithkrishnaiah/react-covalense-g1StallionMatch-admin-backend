import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial } from 'src/utils/types/deep-partial.type';
import { FindOptions } from 'src/utils/types/find-options.type';
import { Repository } from 'typeorm';
import { Forgot } from './entities/forgot.entity';

@Injectable()
export class ForgotService {
  constructor(
    @InjectRepository(Forgot)
    private forgotRepository: Repository<Forgot>,
  ) {}

  //Get a record
  async findOne(options: FindOptions<Forgot>) {
    return this.forgotRepository.findOne({
      where: options.where,
    });
  }

  //Get multiple records
  async findMany(options: FindOptions<Forgot>) {
    return this.forgotRepository.find({
      where: options.where,
    });
  }

  //Create a record
  async create(data: DeepPartial<Forgot>) {
    return this.forgotRepository.save(this.forgotRepository.create(data));
  }

  //Delete a record
  async softDelete(id: number): Promise<void> {
    await this.forgotRepository.softDelete(id);
  }
}
