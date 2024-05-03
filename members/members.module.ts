import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { ExcelModule } from 'src/excel/excel.module';
import { FavouriteBroodmareSiresModule } from 'src/favourite-broodmare-sires/favourite-broodmare-sires.module';
import { FavouriteFarmsModule } from 'src/favourite-farms/favourite-farms.module';
import { FavouriteStallionsModule } from 'src/favourite-stallions/favourite-stallions.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { ForgotModule } from 'src/forgot/forgot.module';
import { GoogleAnalyticsModule } from 'src/google-analytics/google-analytics.module';
import { MailModule } from 'src/mail/mail.module';
import { MediaModule } from 'src/media/media.module';
import { MemberAddressModule } from 'src/member-address/member-address.module';
import { MemberFarmsModule } from 'src/member-farms/member-farms.module';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';
import { MemberMaresModule } from 'src/member-mares/member-mares.module';
import { MemberProfileImageModule } from 'src/member-profile-image/member-profile-image.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { OrderStatusModule } from 'src/order-status/order-status.module';
import { PreferedNotificationsModule } from 'src/prefered-notification/prefered-notifications.module';
import { Member } from './entities/member.entity';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MemberInvitation]),
    MemberAddressModule,
    MailModule,
    FavouriteStallionsModule,
    MemberMaresModule,
    FavouriteBroodmareSiresModule,
    FavouriteFarmsModule,
    MemberFarmsModule,
    MediaModule,
    CommonUtilsModule,
    FileUploadsModule,
    MemberProfileImageModule,
    NotificationsModule,
    MessageTemplatesModule,
    PreferedNotificationsModule,
    ForgotModule,
    ExcelModule,
    GoogleAnalyticsModule,
    OrderStatusModule,
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
