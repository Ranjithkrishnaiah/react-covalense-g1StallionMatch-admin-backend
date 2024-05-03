import { Module } from '@nestjs/common';
import { FarmsService } from './farms.service';
import { FarmsController } from './farms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farm } from './entities/farm.entity';
import { FarmLocationsModule } from '../farm-locations/farm-locations.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { FarmProfileImageModule } from 'src/farm-profile-image/farm-profile-image.module';
import { MediaModule } from 'src/media/media.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { HorsesModule } from 'src/horses/horses.module';
import { FarmGalleryImageModule } from 'src/farm-gallery-images/farm-gallery-image.module';
import { FarmMediaInfoModule } from 'src/farm-media-info/farm-media-info.module';
import { FarmMediaFilesModule } from 'src/farm-media-files/farm-media-files.module';
import { FarmSubscriber } from './farm-subscribers';
import { ExcelModule } from 'src/excel/excel.module';
import { GoogleAnalyticsModule } from 'src/google-analytics/google-analytics.module';
import { PreferedNotificationsModule } from 'src/prefered-notification/prefered-notifications.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Farm]),
    FarmLocationsModule,
    FarmProfileImageModule,
    MediaModule,
    FileUploadsModule,
    CommonUtilsModule,
    CurrenciesModule,
    HorsesModule,
    FarmGalleryImageModule,
    FarmMediaInfoModule,
    FarmMediaFilesModule,
    ExcelModule,
    GoogleAnalyticsModule,
    PreferedNotificationsModule,
    MessageTemplatesModule,
    MailModule,
    NotificationsModule,
  ],
  controllers: [FarmsController],
  providers: [FarmsService, FarmSubscriber],
  exports: [FarmsService],
})
export class FarmsModule {}
