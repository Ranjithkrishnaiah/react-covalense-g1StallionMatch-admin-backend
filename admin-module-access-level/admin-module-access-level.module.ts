import { Module, Global } from '@nestjs/common';
import { AdminModuleAccessLevelService } from './admin-module-access-level.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModuleAccessLevelController } from './admin-module-access-level.controller';
import { AdminModules } from './entities/admin-modules.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AdminModules])],
  controllers: [AdminModuleAccessLevelController],
  providers: [AdminModuleAccessLevelService],
  exports: [AdminModuleAccessLevelService],
})
export class AdminModuleAccessLevelModule {}
