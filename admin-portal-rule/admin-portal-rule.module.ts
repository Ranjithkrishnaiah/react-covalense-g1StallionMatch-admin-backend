import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPortalRule } from './entities/admin-portal-rule.entity';
import { AdminPortalRuleService } from './admin-portal-rule.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminPortalRule])],
  controllers: [],
  providers: [AdminPortalRuleService],
  exports: [AdminPortalRuleService],
})
export class AdminPortalRuleModule {}
