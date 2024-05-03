import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmMediaInfo } from './entities/farm-media-info.entity';
import { FarmMediaInfoController } from './farm-media-info.controller';
import { FarmMediaInfoService } from './farm-media-info.service';
import { FarmMediaFilesModule } from 'src/farm-media-files/farm-media-files.module';

@Module({
  imports: [TypeOrmModule.forFeature([FarmMediaInfo]), FarmMediaFilesModule],
  controllers: [FarmMediaInfoController],
  providers: [FarmMediaInfoService],
  exports: [FarmMediaInfoService],
})
export class FarmMediaInfoModule {}
