import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsModule } from 'src/farms/farms.module';
import { AuditEntity } from './audit.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditEntity]), FarmsModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
