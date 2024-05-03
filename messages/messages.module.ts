import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { ExcelModule } from 'src/excel/excel.module';
import { FarmsModule } from 'src/farms/farms.module';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { MembersModule } from 'src/members/members.module';
import { MessageChannelModule } from 'src/message-channel/message-channel.module';
import { MessageRecipientModule } from 'src/message-recepient/message-recipients.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PreferedNotificationsModule } from 'src/prefered-notification/prefered-notifications.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { Messages } from './entities/messages.entity';
import { MessageController } from './messages.controller';
import { MessagesService } from './messages.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Messages, MemberAddress]),
    FarmsModule,
    MessageRecipientModule,
    StallionsModule,
    MembersModule,
    MessageChannelModule,
    ExcelModule,
    NotificationsModule,
    MessageTemplatesModule,
    CommonUtilsModule,
    PreferedNotificationsModule
  ],
  controllers: [MessageController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
