import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageChannel } from './entities/message-channel.entity';
import { CreateChannelDto } from 'src/messages/dto/create-channel.dto';

@Injectable()
export class MessageChannelService {
  constructor(
    @InjectRepository(MessageChannel)
    private messageChannelRepository: Repository<MessageChannel>,
  ) { }

  //to get the single message channel details
  async findOne(fields) {
    let queryBuilder = this.messageChannelRepository
      .createQueryBuilder('messagechannel')
      .select(
        'messagechannel.channelUuid as channelId, messagechannel.rxId as rxId, messagechannel.isActive as isActiveChannel',
      )
      .addSelect('member.memberuuid as memberId')
      .innerJoin('messagechannel.member', 'member')
      .andWhere('messagechannel.txId = :txId', { txId: fields.txId })
      .andWhere('messagechannel.rxId = :rxId', { rxId: fields.rxId })
      .andWhere('messagechannel.isActive = :isActive', {
        isActive: fields.isActive,
      });
    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  //to get message channels list by applying dynamic conditions
  async findByFields(fields) {
    return this.messageChannelRepository.find({
      where: fields,
      select: ['isActive'],
    });
  }

  //To get single message channel by applying dynamic conditions
  async findOneWhere(fields) {
    return this.messageChannelRepository.findOne({
      where: fields,
    });
  }

  //to create message channel
  async create(createChannelDto: CreateChannelDto) {
    let msg = await this.messageChannelRepository.save(
      this.messageChannelRepository.create(createChannelDto),
    );
    return msg;
  }

  //To get message channel list by applying dynamic conditions
  async findWhere(fields) {
    return this.messageChannelRepository.find({
      where: fields,
    });
  }

  //to update message channel info 
  async update(criteria, entities) {
    const response = await this.messageChannelRepository.update(
      criteria,
      entities,
    );
    return response;
  }

  //to apply hard removal of message channel
  async remove(fields) {
    const response = await this.messageChannelRepository.delete(fields);
    return response;
  }
}
