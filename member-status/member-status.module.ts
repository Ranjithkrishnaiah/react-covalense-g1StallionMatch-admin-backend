import { Module } from '@nestjs/common';
import { MemberStatusService } from './member-status.service';
import { MemberStatusController } from './member-status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberStatus } from './entities/member-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberStatus])],
  controllers: [MemberStatusController],
  providers: [MemberStatusService],
})
export class MemberStatusModule {}
