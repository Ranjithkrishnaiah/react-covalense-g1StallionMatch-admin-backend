import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Stallion } from 'src/stallions/entities/stallion.entity';

@Injectable({ scope: Scope.REQUEST })
export class StallionReportService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private stallionRepository: Repository<Stallion>,
  ) {}
}
