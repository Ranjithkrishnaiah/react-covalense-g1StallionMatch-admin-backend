import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageSettings } from './entities/page-settings.entity';
import { PageSettingsController } from './page-settings.controller';
import { PageSettingsService } from './page-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([PageSettings])],
  controllers: [PageSettingsController],
  providers: [PageSettingsService],
  exports: [PageSettingsService],
})
export class PageSettingsModule {}
