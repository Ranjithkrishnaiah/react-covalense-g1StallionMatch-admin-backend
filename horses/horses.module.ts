import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { ExcelModule } from 'src/excel/excel.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { HorseProfileImageModule } from 'src/horse-profile-image/horse-profile-image.module';
import { MediaModule } from 'src/media/media.module';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { Member } from 'src/members/entities/member.entity';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationTypeModule } from 'src/notification-types/notification-types.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { StallionRequestsModule } from 'src/stallion-requests/stallion-requests.module';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { HorseBulk } from './entities/horse-bulk.entity';
import { Horse } from './entities/horse.entity';
import { HorseMergeService } from './horse-merge.service';
import { HorsesController } from './horses.controller';
import { HorsesService } from './horses.service';
import { HorsesSubscriber } from './horses.subscriber';
import { MareRequestsModule } from 'src/mare-requests/mare-requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Horse,
      Stallion,
      Member,
      MemberAddress,
      HorseBulk,
    ]),
    CommonUtilsModule,
    ExcelModule,
    MediaModule,
    FileUploadsModule,
    HorseProfileImageModule,
    StallionRequestsModule,
    MessageTemplatesModule,
    NotificationsModule,
    NotificationTypeModule,
    MareRequestsModule,
  ],
  controllers: [HorsesController],
  providers: [HorsesService, HorseMergeService, HorsesSubscriber],
  exports: [HorsesService, HorseMergeService],
})
export class HorsesModule {}
