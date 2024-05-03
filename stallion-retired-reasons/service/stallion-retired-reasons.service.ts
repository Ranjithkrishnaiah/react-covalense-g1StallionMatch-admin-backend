import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payload } from '../interface/stallion-retired-reasons-payload.interface';
import { StallionRetiredReasonsRepository } from '../repository/stallion-retired-reasons.repository';

@Injectable()
export class StallionRetiredReasonsService {
  constructor(
    @InjectRepository(StallionRetiredReasonsRepository)
    private StallionRetiredReasonsRepository: StallionRetiredReasonsRepository,
  ) {}

  /* Get list of retired reasons */
  async getAllStallionRetiredReasons(): Promise<Payload[]> {
    return await this.StallionRetiredReasonsRepository.find();
  }
}
