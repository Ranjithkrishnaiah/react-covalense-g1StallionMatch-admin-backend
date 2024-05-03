import {
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MessageMedia } from './entities/message-media.entity';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { MediaService } from 'src/media/media.service';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { MessagesService } from 'src/messages/messages.service';
import { CreateMessageMediaDto } from './dto/create-message-media.dto';
import { MessageMediaDto } from './dto/message-media.dto';
import { MessageRequestDto } from 'src/messages/dto/messages-request.dto';

@Injectable({ scope: Scope.REQUEST })
export class MessageMediaService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MessageMedia)
    private messageMediaRepository: Repository<MessageMedia>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly mediaService: MediaService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    private readonly messageService: MessagesService,
  ) { }

  // to get the presigned url for uploaded media from s3 bucket
  async getMediaUploadPresignedUrl(fileInfo: FileUploadUrlDto) {
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImagesAndFiles(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirMessageMedia',
    )}/${uuidv4()}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  //to create mesage media
  async create(messageId: number, mediaId: number) {
    return this.messageMediaRepository.save(
      this.messageMediaRepository.create({
        messageId: messageId,
        mediaId: mediaId,
      }),
    );
  }

  //to create message media records
  async createMediaRecords(data: CreateMessageMediaDto) {
    if (data?.medias) {
      await this.setMessageMedias(data);
    }
    return;
  }

  //to set the message medias
  async setMessageMedias(data: CreateMessageMediaDto) {
    let self = this;
    let messageRequest = new MessageRequestDto();
    messageRequest.channelId = data.channelId;
    messageRequest.message = data.message;
    messageRequest.subject = data.subject;
    let messageRecord = await this.messageService.create(messageRequest);
    let messageId = messageRecord?.result?.id;
    await data.medias.reduce(async (promise, media: MessageMediaDto) => {
      await promise;
      if (media.mediauuid) {
        if (messageId) {
          let mediaRecord = await self.mediaService.create(media.mediauuid);
          await self.create(messageId, mediaRecord.id);
        }
      }
    }, Promise.resolve());
  }
}
