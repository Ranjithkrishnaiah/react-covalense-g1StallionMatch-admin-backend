import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsModule } from 'src/farms/farms.module';
import { MailModule } from 'src/mail/mail.module';
import { MemberFarmsModule } from 'src/member-farms/member-farms.module';
import { MembersModule } from 'src/members/members.module';
import { MemberInvitation } from './entities/member-invitation.entity';
import { MemberInvitationsController } from './member-invitations.controller';
import { MemberInvitationsService } from './member-invitations.service';
import { MemberInvitationStallionsModule } from 'src/member-invitation-stallions/member-invitation-stallions.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { PreferedNotificationsModule } from 'src/prefered-notification/prefered-notifications.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberInvitation]),
    MembersModule,
    MailModule,
    FarmsModule,
    MemberFarmsModule,
    MemberInvitationStallionsModule,
    StallionsModule,
    PreferedNotificationsModule,
    MessageTemplatesModule,
    NotificationsModule,
    CommonUtilsModule
  ],
  controllers: [MemberInvitationsController],
  providers: [MemberInvitationsService],
  exports: [MemberInvitationsService],
})
export class MemberInvitationsModule {}
