import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Colour } from './entities/colour.entity';

@Injectable()
export class ColoursService {
  constructor(
    @InjectRepository(Colour)
    private colourRepository: Repository<Colour>,
  ) {}

  /* Get all colours */
  findAll() {
    return this.colourRepository.find({
      where:{
        id: Not(0)
      }
    });
  }

  /* Get a colour */
  findOne(id: number) {
    return this.colourRepository.find({
      id,
    });
  }
}
