import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { MessageRequestDto } from './dto/messages-request.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { Messages } from './entities/messages.entity';
import { MessageRecipientsService } from 'src/message-recepient/message-recipients.service';
import { FarmsService } from 'src/farms/farms.service';
import { StallionsService } from 'src/stallions/stallions.service';
import { MembersService } from 'src/members/members.service';
import { MessagesByFarmResponseDto } from './dto/messages-by-farm-response.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MessageBoostRequestDto } from './dto/messages-boost-request.dto';
import { MessageChannelService } from 'src/message-channel/message-channel.service';
import { v4 as uuidv4 } from 'uuid';
import { MessageBroadcastRequestDto } from './dto/messages-broadcast-request.dto';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { Member } from 'src/members/entities/member.entity';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { MessageMedia } from 'src/message-media/entities/message-media.entity';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FarmProfileImage } from 'src/farm-profile-image/entities/farm-profile-image.entity';
import { MemberProfileImage } from 'src/member-profile-image/entities/member-profile-image.entity';
import { SearchedFarmsStallionsDto } from './dto/searched-farms-stallions.dto';
import { MessageExtendedBoostRequestDto } from './dto/messages-extendedboost-request.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { MESSAGEDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { ExcelService } from 'src/excel/excel.service';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { ActivityEntity } from 'src/activity-module/activity.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { SearchStallionMatch } from 'src/search-stallion-match/entities/search-stallion-match.entity';
import { FavouriteFarm } from 'src/favourite-farms/entities/favourite-farm.entity';
import { FavouriteStallion } from 'src/favourite-stallions/entities/favourite-stallion.entity';
import { FavouriteBroodmareSire } from 'src/favourite-broodmare-sires/entities/favourite-broodmare-sire.entity';
import { notificationTemplates, notificationTypeList } from 'src/utils/constants/notifications';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';
import { PreferedNotificationService } from 'src/prefered-notification/prefered-notifications.service';
@Injectable()
export class MessagesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Messages)
    private messagesRepository: Repository<Messages>,
    private messageRecipientsService: MessageRecipientsService,
    private farmsService: FarmsService,
    private stallionsService: StallionsService,
    private membersService: MembersService,
    private messageChannelService: MessageChannelService,
    @InjectRepository(MemberAddress)
    private memberAddressRepository: Repository<MemberAddress>,
    private excelService: ExcelService,
    private notificationsService: NotificationsService,
    private messageTemplatesService: MessageTemplatesService,
    private readonly commonUtilsService: CommonUtilsService,
    private preferedNotificationService: PreferedNotificationService,
  ) {
    this.request = request;
  }
  //Get list of all messages
  async findAll(searchOptionsDto: SearchOptionsDto): Promise<any> {
    const member = this.request.user;
    let mmQueryBuilder = getRepository(MessageMedia)
      .createQueryBuilder('mm')
      .select('mm.messageId as mediaMessageId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'mm.media',
        'media',
        'media.id=mm.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");
    let queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .select(
        'message.id, message.subject, message.createdOn, message.mareName, messagemedia.mediaUrl as mediaUrl',
      )
      .addSelect(
        'CASE WHEN sender.fullName IS NOT NULL THEN sender.fullName ELSE message.fullName END as fromName,CASE WHEN sender.email IS NOT NULL THEN sender.email ELSE channel.txEmail END as fromEmail',
      )
      .addSelect(
        'channel.channelUuid as msgChannelId, channel.isFlagged as isFlagged, CASE WHEN channel.txId IS NOT NULL THEN 1 ELSE 0 END as isRegistered',
      )
      .addSelect('messagerecipient.isRead as isRead')
      .addSelect(
        `nominationRequest.offerPrice as offerPrice, CASE WHEN nominationRequest.isAccepted = 1 THEN 'Accepted' WHEN nominationRequest.isDeclined = 1 THEN 'Declined' WHEN nominationRequest.isCounterOffer = 1 THEN 'Countered' WHEN message.nominationRequestId IS NOT NULL THEN 'Pending' ELSE '-' END as nominationStatus`,
      )
      .addSelect(
        `CASE WHEN nominationRequest.isAccepted = 0 AND nominationRequest.isDeclined = 0 THEN 'Pending' WHEN channel.isActive = 0 THEN 'Deleted' WHEN messagerecipient.isRead = 1  THEN 'Read' ELSE 'Unread' END as messageStatus`,
      )
      .addSelect(`
          CASE
            WHEN sender.email = channel.txEmail AND farmowner.email IS NOT NULL THEN farmowner.email
            ELSE channel.txEmail
          END as toEmail
        `)

      .addSelect(
        `CASE 
              WHEN sender.email=channel.txEmail AND farmowner.fullName  IS NOT NULL THEN farmowner.fullName
              ELSE channelmember.fullName
              END as toName`
         )
      .addSelect('farm.farmUuid as farmId,farm.farmName as farmName')
      .addSelect('stallion.stallionUuid as stallionId')
      .addSelect('msgstallion.stallionUuid as stallionIdFromEnquiry')
      .addSelect('horse.horseName as stallionName')
      .addSelect('msghorse.horseName as stallionNameFromEnquiry')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.nominationRequest', 'nominationRequest')
      .innerJoin('message.messagerecipient', 'messagerecipient')
      .innerJoin('messagerecipient.channel', 'channel')
      .leftJoin('channel.member', 'channelmember')
    //  .leftJoin('message.farm', 'farm', 'farm.isVerified=1 AND farm.isActive=1')
      .leftJoin('nominationRequest.stallion', 'stallion')
      .leftJoin('stallion.horse', 'horse', 'horse.isVerified=1')
      .leftJoin('nominationRequest.currency', 'currency')
      .leftJoin('message.stallion', 'msgstallion')
      .leftJoin('msgstallion.horse', 'msghorse')        
      .leftJoin('channel.farm', 'farm', 'farm.isVerified=1 AND farm.isActive=1')
      .leftJoin('farm.memberfarms', 'memberfarms','memberfarms.isFamOwner=1')
      .leftJoin('memberfarms.member', 'farmowner')
      .leftJoin(
        '(' + mmQueryBuilder.getQuery() + ')',
        'messagemedia',
        'mediaMessageId=message.id',
      )
      .andWhere('message.subject NOT IN (:...subjects)', { subjects: ['Local Boost', 'Broadcast Message', 'Extended Boost'] })
      if(!searchOptionsDto.isRedirect){
        queryBuilder.andWhere('messagerecipient.recipientEmail = :recipientEmail', {
        recipientEmail: member['email'],
      })
       }
       if (searchOptionsDto.mareName) {
        const mareHorse = await getRepository(Horse).findOne({
          horseUuid: searchOptionsDto.mareName
        });
      
        if (mareHorse) {
          queryBuilder.andWhere('message.mareId = :mareId OR nominationRequest.mareId = :mareId', {
            mareId: mareHorse.id,
          });
        
      }
      
      }
   
      queryBuilder.orderBy('message.id', 'DESC');

    const entities = await queryBuilder.getRawMany();
    let response = entities.reduce(function (r, a) {
      r[a.msgChannelId] = r[a.msgChannelId] || [];
      r[a.msgChannelId].push(a);
      return r;
    }, Object.create(null));
    let result = Object.keys(response)
      .map((channelId) => {
        response[channelId].sort(function (a, b) {
          return parseInt(b.messageId) - parseInt(a.messageId);
        });

        return response[channelId][0];
      })
      .sort(function (a, b) {
        return parseInt(b.messageId) - parseInt(a.messageId);
      });

    if (searchOptionsDto.fromEmail) {
      result = result.filter((obj) => {
        if (obj.fromEmail.includes(searchOptionsDto.fromEmail)) return obj;
      });
    }
    if (searchOptionsDto.toEmail) {
      result = result.filter((obj) => {
        if (obj?.toEmail?.includes(searchOptionsDto?.toEmail)) return obj;
      });
    }

    if (searchOptionsDto.fromOrToName) {
      result = result.filter((obj) => {
        return obj.fromName?.toLowerCase()?.includes(searchOptionsDto.fromOrToName.toLowerCase()) || 
               obj.toName?.toLowerCase()?.includes(searchOptionsDto.fromOrToName.toLowerCase());
      });
    }

    if (searchOptionsDto.farmId) {
      result = result.filter((obj) => {
        if (obj.farmId == searchOptionsDto.farmId) return obj;
      });
    }
    if (searchOptionsDto.stallionId) {
      result = result.filter((obj) => {
        if (
          obj.stallionId == searchOptionsDto.stallionId ||
          obj.stallionIdFromEnquiry == searchOptionsDto.stallionId
        )
          return obj;
      });
    }

    if (searchOptionsDto.channelId) {
      result = result.filter((obj) => {
        if (obj.msgChannelId == searchOptionsDto.channelId) return obj;
      });
    }

    if (searchOptionsDto.isFlagged) {
      let flag = searchOptionsDto.isFlagged.toString() == 'true' ? 1 : 0;
      result = result.filter((obj) => {
        if (obj.isFlagged == flag) return obj;
      });
    }

    if (searchOptionsDto.sentDate) {
      let priceList = searchOptionsDto.sentDate.split('/');
      result = result.filter((obj) => {
        if (
          new Date(obj.createdOn).getTime() >=
            new Date(priceList[0]).getTime() &&
          new Date(obj.createdOn).getTime() <=
            new Date(priceList[1]).setHours(23, 59, 59, 999)
        )
          return obj;
      });
    }
   

    // if (searchOptionsDto.mareName) {
    //   result = result.filter((obj) => {
    //     if (
    //       obj.mareName &&
    //       obj.mareName
    //         .toLowerCase()
    //         .indexOf(searchOptionsDto.mareName.toLowerCase()) >= 0
    //     )
    //       return obj;
    //   });
    // }

    if (searchOptionsDto.nominationStatus) {
      result = result.filter((obj) => {
        if (
          obj.nominationStatus.toLowerCase() ==
          searchOptionsDto.nominationStatus.toLocaleLowerCase()
        )
          return obj;
      });
    }

    if (searchOptionsDto.messageStatus) {
      result = result.filter((obj) => {
        if (
          obj.messageStatus.toLowerCase() ==
          searchOptionsDto.messageStatus.toLowerCase()
        )
          return obj;
      });
    }

    if (searchOptionsDto.origin) {
      let subject = '';

      subject =
        searchOptionsDto.origin == 'Farm Page'
          ? 'Farm Enquiry'
          : searchOptionsDto.origin == 'Stallion Page'
          ? 'Stallion Enquiry'
          : searchOptionsDto.origin == 'Direct Message'
          ? 'General Enquiry'
          : searchOptionsDto.origin == 'Local Boost'
          ? 'Local Boost'
          : searchOptionsDto.origin == 'Extended Boost'
          ? 'Extended Boost'
          : 'Nomination Enquiry';

      result = result.filter((obj) => {
        if (obj.subject == subject) return obj;
      });
    }

    if (searchOptionsDto.nominationRange) {
      const priceRange = searchOptionsDto.nominationRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        result = result.filter((obj) => {
          if (obj.offerPrice >= minPrice && obj.offerPrice <= maxPrice)
            return obj;
        });
      }
    }

    if (searchOptionsDto.order && searchOptionsDto.order != 'DESC') {
      result.sort(function (a, b) {
        return parseInt(b.messageId) - parseInt(a.messageId);
      });
    }

    if (searchOptionsDto.sortBy) {
      if (searchOptionsDto.sortBy.toLowerCase() == 'date') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'DESC'
            ? a.createdOn - b.createdOn
            : b.createdOn - a.createdOn;
        });
      }

      if (searchOptionsDto.sortBy.toLowerCase() == 'from') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.fromEmail.localeCompare(b.fromEmail)
            : b.fromEmail.localeCompare(a.fromEmail);
        });
      }
      if (searchOptionsDto.sortBy.toLowerCase() == 'to') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.toEmail?.localeCompare(b.toEmail)
            : b.toEmail?.localeCompare(a.toEmail);
        });
      }
      if (searchOptionsDto.sortBy.toLowerCase() == 'nom status') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.nominationStatus.localeCompare(b.nominationStatus)
            : b.nominationStatus.localeCompare(a.nominationStatus);
        });
      }

      if (searchOptionsDto.sortBy.toLowerCase() == 'status') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.messageStatus.localeCompare(b.messageStatus)
            : b.messageStatus.localeCompare(a.messageStatus);
        });
      }

      if (searchOptionsDto.sortBy.toLowerCase() == 'subject') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.subject.localeCompare(b.subject)
            : b.subject.localeCompare(a.subject);
        });
      }
    }

    const itemCount = result.length;
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });
    result = result.slice(
      searchOptionsDto.skip,
      searchOptionsDto.skip + searchOptionsDto.limit,
    );
    return new PageDto(result, pageMetaDto);
  }

  //to create new message
  async create(messageDto: MessageRequestDto) {
    const member = this.request.user;

    const channel = await this.messageChannelService.findOneWhere({
      channelUuid: messageDto.channelId,
    });
    if (!channel) {
      throw new NotFoundException('Channel not exist!');
    }
    const farm = await this.farmsService.findById(channel.rxId);
    if (!farm) {
      throw new NotFoundException('Farm not exist!');
    }

    const msgRx = await this.messageRecipientsService.findOne({
      channelId: channel.id,
    });
    if (!msgRx) {
      throw new NotFoundException('msgRx not exist!');
    }

    const message = await this.getMessageById(msgRx.messageId);
    if (!message) {
      throw new NotFoundException('message not exist!');
    }

    let msgData = {
      farmId: farm.id,
      message: messageDto.message,
      subject: messageDto.subject,
      fromMemberId: channel.txId,
      createdBy: member['id'],
      email: member['email'],
      fullName: member['fullName'],
      stallionId: message.stallionId,
      cob: message.cob,
      yob: message.yob,
      mareId: message.mareId,
      mareName: message.mareName,
      fromName: message.fromName,
    };

    let msg = await this.messagesRepository.save(
      this.messagesRepository.create(msgData),
    );

    const farmMembers = await this.farmsService.getFarmMembers(farm.farmUuid);
    let memberIds = [];
    let msgRxDto = {
      messageId: msg.id,
      recipientId: null,
      recipientEmail: null,
      createdBy: member['id'],
      channelId: channel.id,
      isRead: false,
    };
    farmMembers.forEach(async (item) => {
      let farmMeberId = await this.membersService.findOne({
        memberuuid: item.memberId,
      });
      msgRxDto.recipientId = farmMeberId.id;
      msgRxDto.recipientEmail = farmMeberId.email;
      memberIds.push(farmMeberId.id);
      await this.messageRecipientsService.create(msgRxDto);
    });
    const admins = await this.membersService.members();
    admins.forEach(async (item) => {
      msgRxDto.recipientId = item.id;
      msgRxDto.recipientEmail = item.email;
      memberIds.push(item.id);
      await this.messageRecipientsService.create(msgRxDto);
    });

    if (!memberIds.includes(channel.txId)) {
      msgRxDto.recipientId = channel.txId;
      msgRxDto.recipientEmail = channel.txEmail;
      await this.messageRecipientsService.create(msgRxDto);
    }
    if (!channel.txId && channel.txEmail) {
      msgRxDto.recipientId = channel.txId;
      msgRxDto.recipientEmail = channel.txEmail;
      await this.messageRecipientsService.create(msgRxDto);
    }

    return { result: msg };
  }

  // Update messages data
  async update(updateDto: UpdateMessageDto) {
    const member = this.request.user;
    const msgChannelRes = await this.messageChannelService.findWhere({
      channelUuid: updateDto.channelId,
    });
    if (!(msgChannelRes.length > 0)) {
      throw new NotFoundException('Not found!');
    }
    let messageChannel;
    // 1:Active, 2:Archive
    if (updateDto.status == 1 || updateDto.status == 2) {
      let isActiveStatus = updateDto.status == 1 ? true : false;
      const msgIds = await this.messageRecipientsService.findResult({
        channelId: msgChannelRes[0].id,
      });
      messageChannel = await this.messageChannelService.update(
        { id: msgChannelRes[0].id },
        { isActive: isActiveStatus },
      );
      msgIds.forEach(async (obj) => {
        const response = await this.messagesRepository.update(
          { id: obj.messageId },
          { isActive: isActiveStatus, modifiedBy: member['id'] },
        );
        //Removing Message Media
        await this.messagesRepository.manager.query(
          `EXEC procRemoveMessageMedia 
                       @messageId=@0,
                       @memberId=@1`,
          [obj.messageId, member['id']],
        );
      });
    }
    //3:TOS Warning
    if (updateDto.status == 3) {
      messageChannel = await this.messageChannelService.update(
        { id: msgChannelRes[0].id },
        { isFlagged: true },
      );
    }
    if (messageChannel.affected) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Updated Successfully',
      };
    } else {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Updated',
      };
    }
  }
  // Delete a new Message
  async delete(deleteMessageDto: DeleteMessageDto) {
    // async delete(deleteMessageDto:DeleteMessageDto) {   // let farmRecord = await this.farmsService.findOne({farmUuid:deleteMessageDto.farmId});
    const member = this.request.user;
    const msgChannelRes = await this.messageChannelService.findWhere({
      channelUuid: deleteMessageDto.channelId,
    });
    if (!(msgChannelRes.length > 0)) {
      throw new NotFoundException('Not found!');
    }

    const msgIds = await this.messageRecipientsService.findResult({
      channelId: msgChannelRes[0].id,
    });
    const markedAsRead = await this.messageRecipientsService.update(
      { channelId: msgChannelRes[0].id },
      { isRead: true },
    );

    msgIds.forEach(async (obj) => {
      const response1 = await this.messageRecipientsService.remove({
        messageId: obj.messageId,
      });
      const response = await this.messagesRepository.delete({
        id: obj.messageId,
      });

      //Removing Message Media
      await this.messagesRepository.manager.query(
        `EXEC procRemoveMessageMedia 
                       @messageId=@0,
                       @memberId=@1`,
        [obj.messageId, member['id']],
      );
    });
    const messageChannel = await this.messageChannelService.remove({
      id: msgChannelRes[0].id,
    });
    if (messageChannel.affected > 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Conversation Deleted Successfully',
      };
    }
  }

  // get specific sale data
  async getMessageById(id: number) {
    const record = await this.messagesRepository.findOne(id);
    if (!record) {
      throw new UnprocessableEntityException('Message not exist!');
    }
    return record;
  }

  async findMsgHistory(
    channelId,
    limit = 0,
  ): Promise<MessagesByFarmResponseDto[]> {
    const member = this.request.user;
    const msgChannelRes = await this.messageChannelService.findOneWhere({
      channelUuid: channelId,
    });
    if (!msgChannelRes) {
      throw new NotFoundException('Not found!');
    }

    let mmQueryBuilder = getRepository(MessageMedia)
      .createQueryBuilder('mm')
      .select('mm.messageId as mediaMessageId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'mm.media',
        'media',
        'media.id=mm.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let fpiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as farmMediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let mpiQueryBuilder = getRepository(MemberProfileImage)
      .createQueryBuilder('mpi')
      .select('mpi.memberId as mediaMemberId, media.mediaUrl as userProfilePic')
      .innerJoin(
        'mpi.media',
        'media',
        'media.id=mpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .select(
        'message.id as messageId, message.message as message, message.createdOn as timestamp, message.subject as subject, message.fullName as unregisteredName, mediaUrl',
      )
      .addSelect('farm.farmName as farmName')
      .addSelect('messagerecipient.isRead as isRead')
      .addSelect('sender.memberuuid as senderId, sender.fullName as senderName')
      .addSelect('country.countryName as senderCountryName')
      .addSelect('state.stateName as senderStateName')
      .addSelect(
        'recipient.memberuuid as recipientId, recipient.fullName as recipientName',
      )
      .addSelect(
        'frommember.memberuuid as fromMemberId, frommember.fullName as fromMemberName',
      )
      .addSelect(
        'nr.id as nominationRequestId, nr.isAccepted as isAccepted, nr.offerPrice as offerPrice, nr.isDeclined as isDeclined, nr.isCounterOffer as isCounterOffer, nr.counterOfferPrice as counterOfferPrice, nr.isClosed as isClosed',
      )
      .addSelect('horse.horseName as horseName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('farmprofileimage.farmMediaUrl as farmImage')
      .addSelect('memberprofileimage.userProfilePic as senderImage')
      .addSelect('channel.channelUuid as channelId')
      .leftJoin('message.farm', 'farm', 'farm.isVerified=1 AND farm.isActive=1')
      .innerJoin('message.messagerecipient', 'messagerecipient')
      .leftJoin('message.fromMember', 'fromMember')
      .innerJoin('messagerecipient.recipient', 'recipient')
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.nominationRequest', 'nr')
      .leftJoin('sender.memberaddresses', 'memberaddress') //changed innerJoin to LeftJoin to get unregistered history
      .leftJoin('memberaddress.country', 'country')
      .leftJoin('memberaddress.state', 'state')
      .leftJoin('nr.stallion', 'stallion')
      .leftJoin('stallion.horse', 'horse', 'horse.isVerified=1')
      .leftJoin('nr.currency', 'currency')
      .innerJoin('messagerecipient.channel', 'channel')
      .leftJoin(
        '(' + mmQueryBuilder.getQuery() + ')',
        'messagemedia',
        'mediaMessageId=message.id',
      )
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      )
      .leftJoin(
        '(' + mpiQueryBuilder.getQuery() + ')',
        'memberprofileimage',
        'mediaMemberId=sender.id',
      )
      .andWhere('channel.channelUuid = :channelId', { channelId: channelId })
      .andWhere('messagerecipient.recipientEmail = :recipientEmail', {
        recipientEmail: member['email'],
      });

    if (limit && limit > 0) {
      queryBuilder.orderBy('message.createdOn', 'DESC').limit(limit);
    }
    const entities = await queryBuilder.getRawMany();

    let unique_set = [];
    entities.forEach((obj) => {
      if (obj.messageId in unique_set) {
        if (member && obj.recipientId == member['id']) {
          unique_set[obj.messageId] = obj;
        }
      } else {
        unique_set[obj.messageId] = obj;
      }
    });
    return unique_set.filter((n) => n);
    //return entities ;
  }

  async createBroadcast(broadcastDto: MessageBroadcastRequestDto) {
    const member = this.request.user;
    let users = [];
    let msgData = {
      message: broadcastDto.message,
      subject: 'Broadcast Message',
      createdBy: member['id'],
      fromMemberId: member['id'],
      email: member['email'],
      fullName: member['fullName'],
      fromName: broadcastDto.fromName
    };
    if (broadcastDto.members.length > 0) {
      users = await Promise.all(
        broadcastDto.members.map(async (element) => {
          let user = await this.membersService.findOne({ memberuuid: element });
          return { id: user.id, email: user.email, fullName: user.fullName };
        }),
      );
    }
    if (broadcastDto.farmMembers.length > 0) {
      const usersRes = await Promise.all(
        broadcastDto.farmMembers.map(async (element) => {
          let user = await this.membersService.findOne({ memberuuid: element });
          users.push({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
          });
          return { id: user.id, email: user.email, fullName: user.fullName };
        }),
      );
    }

    if (broadcastDto.userLocations.length > 0) {
      const usersFromLocations = await this.memberAddressRepository
        .createQueryBuilder('memberaddress')
        .select('Distinct memberaddress.memberId')
        .addSelect('member.email as email, member.fullName as fullName')
        .innerJoin('memberaddress.member', 'member')
        .andWhere('memberaddress.countryId  IN (:...countryList)', {
          countryList: broadcastDto.userLocations,
        })
        .getRawMany();
      usersFromLocations.forEach((res) => {
        users.push({
          id: res.memberId,
          email: res.email,
          fullName: res.fullName,
        });
      });
    }

    let msg = await this.messagesRepository.save(
      this.messagesRepository.create(msgData),
    );

    const getChannel = await this.messageChannelService.findWhere({
      txId: member['id'],
      rxId: null,
      isActive: true,
    });
    if (getChannel.length > 0) {
      // broadcastDto.msgChannelId=getChannel[0].id;
      broadcastDto.channelId = getChannel[0].id;
    } else {
      let channelUuid = uuidv4();
      const channelObj = await this.messageChannelService.create({
        channelUuid: channelUuid,
        txId: member['id'],
        rxId: null,
        isActive: true,
        txEmail: null,
      });
      broadcastDto.channelId = channelObj.id;
    }

    users.forEach(async (item) => {
      let msgRxDto = {
        messageId: msg.id,
        recipientId: item.id,
        recipientEmail: item.email,
        createdBy: member['id'],
        channelId: broadcastDto.channelId,
        isRead: false,
      };
      const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationTypeList.MESSAGING,
      );
      await this.messageRecipientsService.create(msgRxDto);
      const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(notificationTemplates.youHaveNewMessage);
      let messageText = messageTemplate.messageText.replace('{UserName}', broadcastDto.fromName).replace('{message}', broadcastDto.message)
   //  let messageText =broadcastDto.fromName+ ' sent you message:'+'"'+broadcastDto.message+'"'
     let actionUrlValue = messageTemplate.linkAction
      .replace('{channelId}', getChannel[0].channelUuid)
      .toString()
      .trim();
    const messageTitle = messageTemplate.messageTitle;
      this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: item.id,
        actionUrl:actionUrlValue,
        notificationType: preferedNotification?.notificationTypeId,
        messageTitle,
        messageText,
        isRead: false,
      });
    });

    if (msg) {
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Created Successfully',
        data: msg,
      };
    } else {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Not Created',
        data: null,
      };
    }
  }

  async createBoost(boostDto: MessageBoostRequestDto) {
    const member = this.request.user;
    let msgData = {
      subject: 'Local Boost',
      message: boostDto.message,
      fromMemberId: member['id'],
      createdBy: member['id'],
    };

    let msg = await this.messagesRepository.save(
      this.messagesRepository.create(msgData),
    );

    // Create verification and create if no chanel available
    let channelUuid, msgChannelId;

    const getChannel = await this.messageChannelService.findWhere({
      txEmail: member['email'],
      rxId: null,
      isActive: true,
    });
    if (getChannel.length > 0) {
      boostDto.msgChannelId = getChannel[0].id;
      channelUuid = getChannel[0].channelUuid;
    } else {
      channelUuid = uuidv4();
      const channelObj = await this.messageChannelService.create({
        channelUuid: channelUuid,
        txId: member['id'],
        txEmail: member['email'],
        rxId: null,
        isActive: true,
      });
      boostDto.msgChannelId = channelObj[0].id;
    }

    let recipientsDto = new SearchedFarmsStallionsDto();
    recipientsDto.farms = boostDto.farms;
    recipientsDto.stallions = boostDto.stallions;
    let recipientsCountries = await this.getBoostProfileRecipientsCountries(
      recipientsDto,
    );

    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(notificationTemplates.boostNotification);
    const messageText = messageTemplate.messageText.replace(
      '{message}',
      boostDto.message,
    );
    const messageTitle = messageTemplate.messageTitle;

    recipientsCountries.recipients.forEach(async (item) => {
      let msgRxDto = {
        messageId: msg.id,
        recipientId: item.id,
        recipientEmail: item.email,
        createdBy: member['id'],
        channelId: boostDto.msgChannelId,
        isRead: false,
      };
      await this.messageRecipientsService.create(msgRxDto);

      this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: item.id,
        messageTitle,
        messageText,
        isRead: false,
      });
    });
    return { result: msg };
  }

  async getMsgCount() {
    const member = this.request.user;
    const unreadCount = await this.messagesRepository
      .createQueryBuilder('message')
      .select('message.id')
      .innerJoin('message.messagerecipient', 'messagerecipient')
      .andWhere('messagerecipient.recipientEmail = :recipientEmail', {
        recipientEmail: member['email'],
      })
      .andWhere('messagerecipient.isRead = 0')
      .getCount();

    return { unreadCount: unreadCount };
  }

  async getBoostProfileRecipientsCountries(
    searchedFarmsStallionsDto: SearchedFarmsStallionsDto,
  ) {
    let totalCountries = [];
    let totalRecipients = [];
    if (
      searchedFarmsStallionsDto.farms &&
      searchedFarmsStallionsDto.farms.length > 0
    ) {
      /* let searchedFarmCountriesQueryBuilder = await getRepository(ActivityEntity).createQueryBuilder("activity")
        .select('DISTINCT country.id countryId')
        .innerJoin('activity.farm', 'farm')
        .innerJoin('farm.farmlocations', 'farmlocations')
        .innerJoin('farmlocations.country', 'country')
        .andWhere("activity.activityTypeId = :activityType", { activityType: 1 }) 
        .andWhere("activity.farmId IN(:...farmIds)", { 'farmIds':  searchedFarmsStallionsDto.farms})
        .getRawMany()

        let countryIdsFromFarms = searchedFarmCountriesQueryBuilder.map(item => 
          {
            return item.countryId
          })
          totalCountries = [...totalCountries,...countryIdsFromFarms] */

      let recipientsByFarmsQueryBuilder = await getRepository(ActivityEntity)
        .createQueryBuilder('activity')
        .select('DISTINCT activity.createdBy createdBy,member.email email')
        .innerJoin('activity.member', 'member')
        .andWhere('activity.activityTypeId = :activityType', {
          activityType: ACTIVITY_TYPE.READ,
        })
        .andWhere('activity.farmId IN(:...farmIds)', {
          farmIds: searchedFarmsStallionsDto.farms,
        })
        .andWhere('activity.createdBy IS NOT NULL')
        .getRawMany();
      let userIdsFromFarms = recipientsByFarmsQueryBuilder.map((item) => {
        return { id: item.createdBy, email: item.email };
      });
      totalRecipients = [...totalRecipients, ...userIdsFromFarms];
    }

    if (
      searchedFarmsStallionsDto.stallions &&
      searchedFarmsStallionsDto.stallions.length > 0
    ) {
      
      let recipientsByStallionsQueryBuilder = await getRepository(
        ActivityEntity,
      )
        .createQueryBuilder('activity')
        .select('DISTINCT activity.createdBy createdBy,member.email email')
        .innerJoin('activity.member', 'member')
        .andWhere('activity.activityTypeId = :activityType', {
          activityType: ACTIVITY_TYPE.READ,
        })
        .andWhere('activity.stallionId IN(:...stallionIds)', {
          stallionIds: searchedFarmsStallionsDto.stallions,
        })
        .andWhere('activity.createdBy IS NOT NULL')
        .getRawMany();
      let userIdsFromStallions = recipientsByStallionsQueryBuilder.map(
        (item) => {
          return { id: item.createdBy, email: item.email };
        },
      );
      totalRecipients = [...totalRecipients, ...userIdsFromStallions];
    }
    if (
      searchedFarmsStallionsDto.countries &&
      searchedFarmsStallionsDto.countries.length > 0
    ) {
      let recipientsByUserLocationsQueryBuilder = await getRepository(Member)
        .createQueryBuilder('member')
        .select('DISTINCT member.id memberId,member.email email')
        .innerJoin('member.memberaddresses', 'ma')
        .andWhere('ma.countryId IN(:...countryIds)', {
          countryIds: searchedFarmsStallionsDto.countries,
        })
        .getRawMany();
      let userIdsFromLocations = recipientsByUserLocationsQueryBuilder.map(
        (item) => {
          return { id: item.memberId, email: item.email };
        },
      );
      totalRecipients = [...totalRecipients, ...userIdsFromLocations];
      totalCountries = [
        ...totalCountries,
        ...searchedFarmsStallionsDto.countries,
      ];
    }

    if (
      searchedFarmsStallionsDto.damSireSearched &&
      searchedFarmsStallionsDto.damSireSearched.length > 0
    ) {
      let userIdsFromSearchedDamsireQuery = await getRepository(
        SearchStallionMatch,
      )
        .createQueryBuilder('ssm')
        .select('DISTINCT ssm.createdBy as createdBy,member.email email')
        .innerJoin('ssm.mare', 'horse')
        .innerJoin('horse.sire', 'sire')
        .innerJoin('ssm.member', 'member')
        .andWhere('sire.horseUuid IN (:...damsireIds)', {
          damsireIds: searchedFarmsStallionsDto.damSireSearched,
        })
        .andWhere('ssm.createdBy IS NOT NULL')
        .getRawMany();

      let userIdsFromSearchedDamsire = userIdsFromSearchedDamsireQuery.map(
        (item) => {
          return { id: item.createdBy, email: item.email };
        },
      );
      totalRecipients = [...totalRecipients, ...userIdsFromSearchedDamsire];
    }

    if (
      searchedFarmsStallionsDto.farmsTracked &&
      searchedFarmsStallionsDto.farmsTracked.length > 0
    ) {
      let userIdsFromTrackedFarmQuery = await getRepository(FavouriteFarm)
        .createQueryBuilder('ff')
        .select('DISTINCT ff.createdBy as createdBy,member.email email')
        .innerJoin('ff.farm', 'farm')
        .innerJoin('ff.member', 'member')
        .andWhere('farm.farmUuid IN (:...farmIds)', {
          farmIds: searchedFarmsStallionsDto.farmsTracked,
        })
        .getRawMany();

      let userIdsFromTrackedFarm = userIdsFromTrackedFarmQuery.map((item) => {
        return { id: item.createdBy, email: item.email };
      });
      totalRecipients = [...totalRecipients, ...userIdsFromTrackedFarm];
    }

    if (
      searchedFarmsStallionsDto.stallionsTracked &&
      searchedFarmsStallionsDto.stallionsTracked.length > 0
    ) {
      let userIdsFromTrackedStallionQuery = await getRepository(
        FavouriteStallion,
      )
        .createQueryBuilder('fs')
        .select('DISTINCT fs.createdBy createdBy,member.email email')
        .innerJoin('fs.stallion', 'stallion')
        .innerJoin('fs.member', 'member')
        .andWhere('stallion.stallionUuid IN (:...stallionIds)', {
          stallionIds: searchedFarmsStallionsDto.stallionsTracked,
        })
        .getRawMany();

      let userIdsFromTrackedStallion = userIdsFromTrackedStallionQuery.map(
        (item) => {
          return { id: item.createdBy, email: item.email };
        },
      );
      totalRecipients = [...totalRecipients, ...userIdsFromTrackedStallion];
    }

    if (
      searchedFarmsStallionsDto.damSireTracked &&
      searchedFarmsStallionsDto.damSireTracked.length > 0
    ) {
      let userIdsFromTrackedStallionQuery = await getRepository(
        FavouriteBroodmareSire,
      )
        .createQueryBuilder('fbs')
        .select('DISTINCT fbs.createdBy as createdBy,member.email email')
        .innerJoin('fbs.horse', 'horse')
        .innerJoin('fbs.member', 'member')
        .andWhere('horse.horseUuid IN (:...horseUuids)', {
          horseUuids: searchedFarmsStallionsDto.damSireTracked,
        })
        .getRawMany();

      let userIdsFromTrackedDamsire = userIdsFromTrackedStallionQuery.map(
        (item) => {
          return { id: item.createdBy, email: item.email };
        },
      );
      totalRecipients = [...totalRecipients, ...userIdsFromTrackedDamsire];
    }
    totalRecipients = totalRecipients.filter(
      (value, index, self) =>
        index ===
        self.findIndex((t) => t.id === value.id && t.email === value.email),
    );
    let userIds = [];
    totalRecipients.forEach((item) => {
      userIds.push(item.id);
    });
    if (userIds.length > 0) {
      let totalCountriesByUsersIdsQueryBuilder = await getRepository(
        MemberAddress,
      )
        .createQueryBuilder('ma')
        .select('DISTINCT ma.countryId countryId')
        .andWhere('ma.memberId IN(:...memberIds)', { memberIds: userIds })

        .getRawMany();
      let countryIdsFromUserIds = totalCountriesByUsersIdsQueryBuilder.map(
        (item) => {
          return item.countryId;
        },
      );
      totalCountries = [...totalCountries, ...countryIdsFromUserIds];
    }
    totalCountries = [...new Set(totalCountries)];
    return { recipients: totalRecipients, countries: totalCountries };
  }

  async getBoostProfileRecipientsCountriesCount(
    searchedFarmsStallionsDto: SearchedFarmsStallionsDto,
  ) {
    let result = await this.getBoostProfileRecipientsCountries(
      searchedFarmsStallionsDto,
    );
    return {
      recipients: result.recipients.length,
      countries: result.countries.length,
    };
  }

  async createExtendedBoost(boostDto: MessageExtendedBoostRequestDto) {
    const member = this.request.user;

    let msgData = {
      subject: 'Extended Boost',
      message: boostDto.message,
      fromMemberId: member['id'],
      createdBy: member['id'],
    };
    let msg = await this.messagesRepository.save(
      this.messagesRepository.create(msgData),
    );

    // Create verification and create if no chanel available
    let channelUuid, msgChannelId;

    const getChannel = await this.messageChannelService.findWhere({
      txEmail: member['email'],
      rxId: null,
      isActive: true,
    });
    if (getChannel.length > 0) {
      boostDto.msgChannelId = getChannel[0].id;
      channelUuid = getChannel[0].channelUuid;
    } else {
      channelUuid = uuidv4();
      const channelObj = await this.messageChannelService.create({
        channelUuid: channelUuid,
        txId: member['id'],
        txEmail: member['email'],
        rxId: null,
        isActive: true,
      });
      boostDto.msgChannelId = channelObj[0].id;
    }

    let recipientsDto = new SearchedFarmsStallionsDto();
    recipientsDto.farms = boostDto.farms;
    recipientsDto.stallions = boostDto.stallions;
    let members = await this.getBoostProfileRecipientsCountries(recipientsDto);

    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(notificationTemplates.boostNotification);
    const messageText = messageTemplate.messageText.replace(
      '{message}',
      boostDto.message,
    );
    const messageTitle = messageTemplate.messageTitle;

    members.recipients.forEach(async (item) => {
      let msgRxDto = {
        messageId: msg.id,
        recipientId: item.id,
        recipientEmail: item.email,
        createdBy: member['id'],
        channelId: boostDto.msgChannelId,
        isRead: false,
      };
      await this.messageRecipientsService.create(msgRxDto);

      this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: item.id,
        messageTitle,
        messageText,
        isRead: false,
      });
    });

    return { result: msg };
  }

  async getMessagesDashboardData(dashboardDto: DashboardDto) {
    let result = await this.messagesRepository.manager.query(
      `EXEC procGetMessageDashboard @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );

    let respone = [];
    await result.map(async (record: any) => {
      let diffPercent = 0;
      if (record.PrevValue) {
        diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
      } else {
        diffPercent = Math.round(record.Diff / 0.01);
      }
      respone.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return respone;
  }

  async getCountGraphData(dashboardDto: DashboardDto) {
    let result = await this.messagesRepository.manager.query(
      `EXEC procGetMessageDashboardMsgCountGraph 
      @fromDate=@0, 
      @toDate=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );
    let currentTotal = 0;
    let previousTotal = 0;
    let finalResult = [];
    let rangeFrom = null;
    let rangeTo = null;
    await result.map(async (item, index) => {
      currentTotal = currentTotal + item.currRegRate;
      previousTotal = previousTotal + item.prevRegRate;
      switch (item.interval) {
        case 'DAY':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getDayFromDate(
              item.currdayDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getDayFromDate(item.currdayDate);
          }
          finalResult.push({
            label: this.commonUtilsService.getDayFromDate(item.currdayDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'WEEK':
          if (index === 0) {
            rangeFrom = `Week ${item.currWeekNumber}`;
          }
          if (index === result.length - 1) {
            rangeTo = `Week ${item.currWeekNumber}`;
          }
          finalResult.push({
            label: `Week ${item.currWeekNumber}`,
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'MONTH':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getMonthFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'YEAR':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getYearFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
      }
    });
    return {
      currentTotal,
      previousTotal,
      rangeFrom,
      rangeTo,
      result: finalResult,
    };
  }

  async getMostMentionedStallionsData(dashboardDto: DashboardDto) {
    let result = await this.messagesRepository.manager.query(
      `EXEC procGetMessageDashboardMostMentionedStallions @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );

    return result;
  }

  async getMostEngagedUsersData(dashboardDto: DashboardDto) {
    let result = await this.messagesRepository.manager.query(
      `EXEC procGetMessageDashboardMostEngagedUsers @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );
    return result;
  }

  async getConversationBreakdownData(dashboardDto: DashboardDto) {
    let result = await this.messagesRepository.manager.query(
      `EXEC procGetMessageDashboardConversationBreakdown @paramDate1=@0, @paramDate2=@1`,
      [dashboardDto.fromDate, dashboardDto.toDate],
    );
    return result[0];
  }

  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case MESSAGEDASHBOARDKPI.CONVERSATIONS:
        qbQuery = `EXEC procGetMessageDashboardConversationsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.MESSAGES:
        qbQuery = `EXEC procGetMessageDashboardMessagesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.ACTIVE_BREEDERS:
        qbQuery = `EXEC procGetMessageDashboardActiveBreedersDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.ACTIVE_FARM_USERS:
        qbQuery = `EXEC procGetMessageDashboardActiveFarmUsersDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.AVERAGE_FARM_RESPONSE:
        qbQuery = `EXEC procGetMessageDashboardAverageFarmResponseDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.COUNTER_OFFERED_NOMINATIONS:
        qbQuery = `EXEC procGetMessageDashboardCounterOfferedNominationsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.DECLINED_NOMINATIONS:
        qbQuery = `EXEC procGetMessageDashboardDeclinedNominationsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.ACCEPTED_NOMINATIONS:
        qbQuery = `EXEC procGetMessageDashboardAcceptedNominationsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.FLAGGED_MESSAGES:
        qbQuery = `EXEC procGetMessageDashboardFlaggedMessagesDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.MOST_ENGAGED_COUNTRY:
        qbQuery = `EXEC procGetMessageDashboardMostEngagedCountryDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.MOST_ENGAGED_FARM:
        qbQuery = `EXEC procGetMessageDashboardMostEngagedFarmDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.MOST_ENGAGED_STALLION:
        qbQuery = `EXEC procGetMessageDashboardMostEngagedStallionDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.MOST_ENGAGED_USERS:
        qbQuery = `EXEC procGetMessageDashboardMostEngagedUsers @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.MOST_MENTIONED_STALLIONS:
        qbQuery = `EXEC procGetMessageDashboardMostMentionedStallionsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.QUICKEST_FARM_REPLY:
        qbQuery = `EXEC procGetMessageDashboardQuickestFarmReplyDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case MESSAGEDASHBOARDKPI.NOMINATION_REQUESTS:
        qbQuery = `EXEC procGetMessageDashboardRequestedNominationsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
    }
    if (qbQuery == '') {
      throw new NotFoundException('No Data Exist');
    }
    let result = await this.messagesRepository.manager.query(`${qbQuery}`, [
      options.fromDate,
      options.toDate,
    ]);
    if (result.length) {
      let headerList = [];
      let headersData = Object.keys(result[0]);
      await headersData.reduce(async (promise, item) => {
        await promise;
        item;
        let itemObj = {
          header: item,
          key: item, //item.replace(/[^A-Z0-9]+/ig, "_"),
          width: 30,
        };
        headerList.push(itemObj);
      }, Promise.resolve());
      //return result
      const currentDateTime = new Date();
      //let currentTime = currentDateTime.getMilliseconds();
      let file = await this.excelService.generateReport(
        `Report`,
        headerList,
        result,
      );
      return file;
    } else {
      throw new NotFoundException('Data not found for the given date range!');
    }
  }

  async getDownloadList(searchOptionsDto: SearchOptionsDto) {
    const member = this.request.user;
    let queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .select(
        'message.id, message.createdOn, message.subject,  message.mareName',
      )
      .addSelect(
        'CASE WHEN sender.fullName IS NOT NULL THEN sender.fullName ELSE message.fullName END as fromName,CASE WHEN sender.email IS NOT NULL THEN sender.email ELSE channel.txEmail END as fromEmail',
      )
      .addSelect(
        'channel.channelUuid as msgChannelId, channel.isFlagged as isFlagged, CASE WHEN channel.txId IS NOT NULL THEN 1 ELSE 0 END as isRegistered',
      )
      .addSelect('messagerecipient.isRead as isRead')
      .addSelect(
        `nominationRequest.offerPrice as offerPrice, CASE WHEN nominationRequest.isAccepted = 1 THEN 'Accepted' WHEN nominationRequest.isDeclined = 1 THEN 'Declined' WHEN nominationRequest.isCounterOffer = 1 THEN 'Countered' WHEN message.nominationRequestId IS NOT NULL THEN 'Pending' ELSE '-' END as nominationStatus`,
      )
      .addSelect(
        `CASE WHEN nominationRequest.isAccepted = 0 AND nominationRequest.isDeclined = 0 THEN 'Pending' WHEN channel.isActive = 0 THEN 'Deleted' WHEN messagerecipient.isRead = 1  THEN 'Read' ELSE 'Unread' END as messageStatus`,
      )
      .addSelect('farm.farmUuid as farmId,farm.farmName as farmName')
      .addSelect('stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName as stallionName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.nominationRequest', 'nominationRequest')
      .innerJoin('message.messagerecipient', 'messagerecipient')
      .innerJoin('messagerecipient.channel', 'channel')
      .innerJoin(
        'message.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .leftJoin('nominationRequest.stallion', 'stallion')
      .leftJoin('stallion.horse', 'horse', 'horse.isVerified=1')
      .leftJoin('nominationRequest.currency', 'currency')
      .andWhere('messagerecipient.recipientEmail = :recipientEmail', {
        recipientEmail: member['email'],
      })
      .orderBy('message.id', 'DESC');

    const entities = await queryBuilder.getRawMany();
    let response = entities.reduce(function (r, a) {
      r[a.msgChannelId] = r[a.msgChannelId] || [];
      r[a.msgChannelId].push(a);
      return r;
    }, Object.create(null));
    let result = Object.keys(response)
      .map((channelId) => {
        response[channelId].sort(function (a, b) {
          return parseInt(b.messageId) - parseInt(a.messageId);
        });

        return response[channelId][0];
      })
      .sort(function (a, b) {
        return parseInt(b.messageId) - parseInt(a.messageId);
      });

    if (searchOptionsDto.fromEmail) {
      result = result.filter((obj) => {
        if (obj.fromEmail.includes(searchOptionsDto.fromEmail)) return obj;
      });
    }

    if (searchOptionsDto.fromOrToName) {
      result = result.filter((obj) => {
        if (obj.fromName.toLowerCase().includes(searchOptionsDto.fromOrToName.toLowerCase())) return obj;
      });
    }

    if (searchOptionsDto.farmId) {
      result = result.filter((obj) => {
        if (obj.farmId == searchOptionsDto.farmId) return obj;
      });
    }
    if (searchOptionsDto.stallionId) {
      result = result.filter((obj) => {
        if (obj.stallionId == searchOptionsDto.stallionId) return obj;
      });
    }

    if (searchOptionsDto.isFlagged) {
      let flag = searchOptionsDto.isFlagged.toString() == 'true' ? 1 : 0;
      result = result.filter((obj) => {
        if (obj.isFlagged == flag) return obj;
      });
    }

    if (searchOptionsDto.sentDate) {
      let priceList = searchOptionsDto.sentDate.split('/');
      result = result.filter((obj) => {
        if (
          new Date(obj.createdOn).getTime() >=
            new Date(priceList[0]).getTime() &&
          new Date(obj.createdOn).getTime() <=
            new Date(priceList[1]).setHours(23, 59, 59, 999)
        )
          return obj;
      });
    }

    if (searchOptionsDto.mareName) {
      result = result.filter((obj) => {
        if (
          obj.mareName &&
          obj.mareName
            .toLowerCase()
            .indexOf(searchOptionsDto.mareName.toLowerCase()) >= 0
        )
          return obj;
      });
    }

    if (searchOptionsDto.nominationStatus) {
      result = result.filter((obj) => {
        if (
          obj.nominationStatus.toLowerCase() ==
          searchOptionsDto.nominationStatus.toLocaleLowerCase()
        )
          return obj;
      });
    }

    if (searchOptionsDto.messageStatus) {
      result = result.filter((obj) => {
        if (
          obj.messageStatus.toLowerCase() ==
          searchOptionsDto.messageStatus.toLowerCase()
        )
          return obj;
      });
    }

    if (searchOptionsDto.origin) {
      let subject = '';

      subject =
        searchOptionsDto.origin == 'Farm Page'
          ? 'Farm Enquiry'
          : searchOptionsDto.origin == 'Stallion Page'
          ? 'Stallion Enquiry'
          : searchOptionsDto.origin == 'Direct Message'
          ? 'General Enquiry'
          : 'Nomination Enquiry';

      result = result.filter((obj) => {
        if (obj.subject == subject) return obj;
      });
    }

    if (searchOptionsDto.nominationRange) {
      const priceRange = searchOptionsDto.nominationRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        result = result.filter((obj) => {
          if (obj.offerPrice >= minPrice && obj.offerPrice <= maxPrice)
            return obj;
        });
      }
    }

    if (searchOptionsDto.order && searchOptionsDto.order != 'DESC') {
      result.sort(function (a, b) {
        return parseInt(b.messageId) - parseInt(a.messageId);
      });
    }

    if (searchOptionsDto.sortBy) {
      if (searchOptionsDto.sortBy.toLowerCase() == 'date') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.createdOn - b.createdOn
            : b.createdOn - a.createdOn;
        });
      }

      if (searchOptionsDto.sortBy.toLowerCase() == 'from') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.fromEmail.localeCompare(b.fromEmail)
            : b.fromEmail.localeCompare(a.fromEmail);
        });
      }

      if (searchOptionsDto.sortBy.toLowerCase() == 'nom status') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.nominationStatus.localeCompare(b.nominationStatus)
            : b.nominationStatus.localeCompare(a.nominationStatus);
        });
      }

      if (searchOptionsDto.sortBy.toLowerCase() == 'status') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.messageStatus.localeCompare(b.messageStatus)
            : b.messageStatus.localeCompare(a.messageStatus);
        });
      }

      if (searchOptionsDto.sortBy.toLowerCase() == 'subject') {
        result.sort(function (a, b) {
          return searchOptionsDto.order == 'ASC'
            ? a.subject.localeCompare(b.subject)
            : b.subject.localeCompare(a.subject);
        });
      }
    }

    return result;
  }

  async readMsgs(channelId: string) {
    const member = this.request.user;
    const msgChannelRes = await this.messageChannelService.findWhere({
      channelUuid: channelId,
    });
    if (!(msgChannelRes.length > 0)) {
      throw new NotFoundException('Not found!');
    }
    const response = await this.messageRecipientsService.update(
      { recipientEmail: member['email'], channelId: msgChannelRes[0].id },
      { isRead: true },
    );
    return response;
  }
}
