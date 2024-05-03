import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { RaceWeather } from './entities/race-weather.entity';

@Injectable()
export class RaceWeatherService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceWeather)
    private raceWeatherRepository: Repository<RaceWeather>,
  ) {}
  /* Get Race Weathers List */
  async findAll() {
    return this.raceWeatherRepository.find({});
  }
}
