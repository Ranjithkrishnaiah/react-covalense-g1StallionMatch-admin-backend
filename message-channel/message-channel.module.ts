import { Module } from '@nestjs/common';
import { MessageChannelService } from './message-channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageChannel } from './entities/message-channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageChannel])],
  providers: [MessageChannelService],
  exports: [MessageChannelService],
})
export class MessageChannelModule { }
