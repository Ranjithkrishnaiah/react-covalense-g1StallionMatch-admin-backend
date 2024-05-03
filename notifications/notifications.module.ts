import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifications } from './entities/notifications.entity';
import { ExcelModule } from 'src/excel/excel.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { PreferedNotificationsModule } from 'src/prefered-notification/prefered-notifications.module';
@Module({
  imports: [ExcelModule, TypeOrmModule.forFeature([Notifications]), MessageTemplatesModule, PreferedNotificationsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
