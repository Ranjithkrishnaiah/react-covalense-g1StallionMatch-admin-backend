import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberAuditEntity } from '../members-audit/member-audit.entity';
import { MemberAuditService } from './member-audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberAuditEntity])],
  providers: [MemberAuditService],
  exports: [MemberAuditService],
})
export class MemberAuditModule {}
