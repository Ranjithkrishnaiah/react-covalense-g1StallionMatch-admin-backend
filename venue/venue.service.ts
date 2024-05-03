import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { VenueSearchDto } from './dto/search-options.dto';
import { Venue } from './entities/venue.entity';

@Injectable()
export class VenueService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) { }
  /* Get Venues List */
  async findAll(searchOptions: VenueSearchDto) {
    const queryBuilder = await this.venueRepository
      .createQueryBuilder('venue')
      .select(
        'venue.id,venue.displayName, venue.countryId,venue.stateId,venue.trackTypeId,track.displayName as trackTypeName',
      )
      .leftJoin('venue.track', 'track');

    if (searchOptions.country) {
      let country = searchOptions.country.split(',');
      let countryList = country.map((res) => parseInt(res));
      queryBuilder.andWhere('venue.countryId IN (:...countryId)', {
        countryId: countryList,
      });
    }
    if (searchOptions.displayName) {
      queryBuilder.andWhere('venue.displayName like :displayName', {
        displayName: '%' + searchOptions.displayName + '%',
      });
    }
    const entities = queryBuilder.getRawMany();
    return entities;
  }
}
