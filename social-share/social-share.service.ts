import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Request } from 'express';
import { EmailService } from 'src/email/email.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { MailService } from 'src/mail/mail.service';
import { DashboardDto } from 'src/stallions/dto/dashboard.dto';
import { StallionsService } from 'src/stallions/stallions.service';
import { Repository, getRepository } from 'typeorm';
import { shareData } from './dto/report-share.dto';
import { SocialShare } from './entities/social-share.entity';

@Injectable({ scope: Scope.REQUEST })
@Injectable()
export class SocialShareService {
  constructor(
    @Inject(REQUEST) private request: Request,
    @InjectRepository(SocialShare)
    private socialShareRepository: Repository<SocialShare>,
    private readonly stallionsService: StallionsService,
    private readonly mailService: MailService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService

  ) { }
  /* Get Social Share Data By Member */
  findAll() {
    return this.socialShareRepository.find();
  }
  /* Capture report Share Data By Admin */
  async create(data: shareData) {
    const toDate = data.toDate
    const fromDate = data.fromDate
    const comment =data.comment
    let pdfData ={
       toDate :toDate,
       fromDate :fromDate,
       stallionId :data.stallionId,
       filterBy: data.filterBy,
    }
    const member = this.request.user;
    const stallion = await this.stallionsService.getStallionByUuid(data.stallionId);
    var horse = await getRepository(Horse).findOne({ id: stallion.horseId })
    const to = data.toEmail
    const stallionName = horse.horseName 
    const type = data.type
    const buffer = await this.getPdfBuffer(pdfData,type)
    const share = {
      entityId: stallion.id,
      pdfLink: buffer.pdfLink,
      socialShareTypeId: 1,
      createdBy: member['id'],
      entityType: 'STALLION_REPORT',
      toEmail: data.toEmail,
      comment: comment
    }
    const finaldata = await this.socialShareRepository.save(share);
 
   const response = await this.emailService.sendEmailWithAttachment(to, stallionName,comment, buffer.buffer);
    if (response) {
      return { message: 'Mail  has been sent successfully' };
    }

  }
  //Get PdfBuffer
  async getPdfBuffer(pdfData,type) {
    if(type === 'studFee report'){
      delete  pdfData.filterBy
      var dashbr = await this.stallionsService.studfeeHistoryDownload(pdfData)  
    }
    if(type === 'analytics report'){
      var dashbr = await this.stallionsService.analyticsDownload(pdfData) 
    }
    const params = { Bucket: this.configService.get('file.awsDefaultS3Bucket'), Key: dashbr[0].pdfObj };
    const s3 = new S3();
    const getObjectOutput = await s3.getObject(params).promise();
    return {
      buffer: getObjectOutput.Body as Buffer ,
      pdfLink :dashbr[0].pdfObj
    }

  }
}
