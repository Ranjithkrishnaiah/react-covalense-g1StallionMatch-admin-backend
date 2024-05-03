import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsModule } from 'src/farms/farms.module';
import { RaceModule } from 'src/race/race.module';
import { AuditEntity } from './audit.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditEntity]), FarmsModule, RaceModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
