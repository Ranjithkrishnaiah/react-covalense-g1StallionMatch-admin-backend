import { Module } from '@nestjs/common';
import { SocialShareController } from './social-share.controller';
import { SocialShareService } from './social-share.service';
import { SocialShare } from './entities/social-share.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionsModule } from 'src/stallions/stallions.module';
import { MailModule } from 'src/mail/mail.module';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([SocialShare]),
StallionsModule,MailModule ,EmailModule],
  controllers: [SocialShareController],
  providers: [SocialShareService,EmailService],
})
export class SocialShareModule {}
