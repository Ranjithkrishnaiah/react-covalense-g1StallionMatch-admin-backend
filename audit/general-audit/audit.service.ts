import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEntity } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEntity)
    private auditRepository: Repository<AuditEntity>,
  ) {}
}
