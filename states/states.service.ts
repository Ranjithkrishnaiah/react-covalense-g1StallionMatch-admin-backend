import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './entities/state.entity';

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(State)
    private statesRepository: Repository<State>,
  ) { }

  findAll() {
    return this.statesRepository.find({
      relations: ['country'],
      where: {
        isDisplay: true,
      },
    });
  }
  /* Get All States */
  async findAllByCountryId(countryIds: string) {
    if (!countryIds || countryIds === undefined || countryIds === 'undefined') {
      throw new UnprocessableEntityException('Country not found!');
    }

    let result = await this.statesRepository.manager.query(
      `EXEC Proc_SMPGetStatesByCountryIds 
      @countryIds=@0`,
      [countryIds],
    );
    return result;
  }
  /* Get States by Country Id */
  findOne(id: number) {
    return this.statesRepository.find({
      id,
    });
  }
}
