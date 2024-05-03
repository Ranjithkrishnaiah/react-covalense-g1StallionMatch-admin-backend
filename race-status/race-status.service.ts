import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaceStatus } from './entities/race-status.entity';
import { Request } from 'express';

@Injectable()
export class RaceStatusService {
    constructor(
        @Inject(REQUEST) private readonly request: Request,
        @InjectRepository(RaceStatus)
        private raceStatusRepository: Repository<RaceStatus>,
    ) { }
    /* Get All Race Status*/
    async findAll() {
        return this.raceStatusRepository.find({});
    }
    /* Get API Status*/
    async findAPIStatus() {
        const jsonObj = [
            {
                apiStatusId: '1',
                apiStatus: 'Active',
            },
            {
                apiStatusId: '2',
                apiStatus: 'Inactive',
            },
        ];
        return jsonObj;
    }

    /* Get Imported Status */
    async findIsImported() {
        const jsonObj = [
            {
                id: '1',
                importedStatus: 'Yes',
            },
            {
                id: '2',
                importedStatus: 'No',
            },
        ];
        return jsonObj;
    }


}
