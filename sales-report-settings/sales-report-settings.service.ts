import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { SalesReportsetting } from './entities/sales-report-settings.entity';

@Injectable()
export class SalesReportSettingsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(SalesReportsetting)
    private salesReportSettingsRepository: Repository<SalesReportsetting>,
  ) {}
}
