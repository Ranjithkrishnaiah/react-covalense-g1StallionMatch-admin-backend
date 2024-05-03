import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorseAuditEntity } from './horse-audit.entity';
import { HorseAuditService } from './horse-audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([HorseAuditEntity])],
  providers: [HorseAuditService],
  exports: [HorseAuditService],
})
export class HorseAuditModule {}
