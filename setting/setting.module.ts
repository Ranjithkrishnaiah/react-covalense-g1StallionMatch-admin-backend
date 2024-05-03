import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { CountryModule } from 'src/country/country.module';
import { Setting } from './entities/setting.entity';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting]),
    CountryModule,
    CommonUtilsModule,
  ],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
