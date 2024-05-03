import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmAccessLevel } from './entities/farm-access-level.entity';
import { FarmAccessLevelsController } from './farm-access-levels.controller';
import { FarmAccessLevelsService } from './farm-access-levels.service';

@Module({
  imports: [TypeOrmModule.forFeature([FarmAccessLevel])],
  controllers: [FarmAccessLevelsController],
  providers: [FarmAccessLevelsService],
  exports: [FarmAccessLevelsService],
})
export class FarmAccessLevelsModule {}
