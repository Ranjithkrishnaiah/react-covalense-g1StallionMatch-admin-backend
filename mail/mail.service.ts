import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { CommonMailDto } from './dto/common-mail.dto';
import { MailData } from './interfaces/mail-data.interface';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';

@Injectable()
export class MailService {
  constructor(
    private i18n: I18nService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private commonUtilsService: CommonUtilsService,
  ) {}
  
  //Signup Email
  async memberSignUp(mailData: MailData<{ hash: string; fullName: string }>) {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: await this.i18n.t('common.confirmEmail'),
      text: `${this.configService.get(
        'app.portalFrontendDomain',
      )}/confirm-email/${mailData.data.hash} ${await this.i18n.t(
        'common.confirmEmail',
      )}`,
      template: '/activation',
      context: {
        title: await this.i18n.t('common.confirmEmail'),
        url: `${this.configService.get(
          'app.portalFrontendDomain',
        )}/confirm-email/${mailData.data.hash}`,
        actionTitle: await this.i18n.t('common.confirmEmail'),
        app_name: this.configService.get('app.name'),
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        adminPortalUrl: `${this.configService.get('app.frontendDomain')}`,
        portalUrl: `${this.configService.get('app.portalFrontendDomain')}`,
      },
    });
  }
  
  //Forgot Password Email
  async forgotPassword(mailData: MailData<{ hash: string; fullName: string }>) {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: await this.i18n.t('common.resetPassword'),
      text: `${this.configService.get(
        'app.portalFrontendDomain',
      )}/reset-password/${mailData.data.hash} ${await this.i18n.t(
        'common.resetPassword',
      )}`,
      template: '/reset-password',
      context: {
        title: await this.i18n.t('common.resetPassword'),
        url: `${this.configService.get(
          'app.portalFrontendDomain',
        )}/reset-password/${mailData.data.hash}`,
        app_name: this.configService.get('app.name'),
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        adminPortalUrl: `${this.configService.get('app.frontendDomain')}`,
        portalUrl: `${this.configService.get('app.portalFrontendDomain')}`,
      },
    });
  }

  //Invite User Email
  async inviteUser(mailData: MailData<{ hash: string; fullName: string }>) {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: await this.i18n.t('common.inviteUser'),
      text: `${this.configService.get(
        'app.portalFrontendDomain',
      )}/invite-user/${mailData.data.hash} ${await this.i18n.t(
        'common.inviteUser',
      )}`,
      template: '/invite-user',
      context: {
        title: await this.i18n.t('common.inviteUser'),
        url: `${this.configService.get(
          'app.portalFrontendDomain',
        )}/invite-user/${mailData.data.hash}`,
        actionTitle: await this.i18n.t('common.inviteUser'),
        app_name: this.configService.get('app.name'),
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        // farmName: mailData.data.farmName,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        adminPortalUrl: `${this.configService.get('app.frontendDomain')}`,
        portalUrl: `${this.configService.get('app.portalFrontendDomain')}`,
      },
    });
  }

  // Member-Invitation
  async inviteUsers(mailData: MailData<{ hash: string; fullName: string }>) {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: await this.i18n.t('common.inviteUser'),
      text: `${this.configService.get(
        'app.portalFrontendDomain',
      )}/invite-user/${mailData.data.hash} ${await this.i18n.t(
        'common.inviteUser',
      )}`,
      template: '/invite-user',
      context: {
        title: await this.i18n.t('common.inviteUser'),
        url: `${this.configService.get(
          'app.portalFrontendDomain',
        )}/invite-user/${mailData.data.hash}`,
        actionTitle: await this.i18n.t('common.inviteUser'),
        app_name: this.configService.get('app.name'),
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        // farmName: mailData.data.farmName,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        adminPortalUrl: `${this.configService.get('app.frontendDomain')}`,
        portalUrl: `${this.configService.get('app.portalFrontendDomain')}`,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
      },
    });
  }

  //Invite a Farm User
  async inviteFarmUser(
    mailData: MailData<{ hash: string; fullName: string; farmName: string }>,
  ) {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: await this.i18n.t('common.inviteFarmUser'),
      text: `${this.configService.get(
        'app.portalFrontendDomain',
      )}/invite-user/${mailData.data.hash} ${await this.i18n.t(
        'common.inviteFarmUser',
      )}`,
      template: '/invite-farm-user',
      context: {
        title: await this.i18n.t('common.inviteFarmUser'),
        url: `${this.configService.get(
          'app.portalFrontendDomain',
        )}/invite-user/${mailData.data.hash}`,
        actionTitle: await this.i18n.t('common.inviteFarmUser'),
        app_name: this.configService.get('app.name'),
        fullName: await this.commonUtilsService.toTitleCase(
          mailData.data.fullName,
        ),
        farmName: await this.commonUtilsService.toTitleCase(
          mailData.data.farmName,
        ),
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        adminPortalUrl: `${this.configService.get('app.frontendDomain')}`,
        portalUrl: `${this.configService.get('app.portalFrontendDomain')}`,
      },
    });
  }

  //Common Mail for Notifications
  async sendMailCommon(commonMailDto: CommonMailDto) {
    let context = commonMailDto.context;
    context['imgPath'] = process.env.EMAIL_TEMPLATE_IMAGES_PATH;
    context['adminPortalUrl'] = `${this.configService.get('app.frontendDomain')}`;
    context['portalUrl'] = `${this.configService.get('app.portalFrontendDomain')}`;
    context['facebookUrl'] = process.env.SOCIALMEDIA_FACEBOOK;
    context['twitterUrl'] = process.env.SOCIALMEDIA_TWITTER;
    let data = {
      to: commonMailDto.to,
      subject: commonMailDto.subject,
      text: commonMailDto.text,
      template: commonMailDto.template,
      context: context,
    };
    await this.mailerService.sendMail(data);
  }

  //Send Report
  async sendReport(mailData) {
    return await this.mailerService.sendMail({
      to: mailData.to,
      subject: await this.i18n.t('Order Ready'),
      template: '/order-ready',
      context: {
        title: await this.i18n.t('Order Ready'),
        actionTitle: await this.i18n.t('Order Ready'),
        app_name: this.configService.get('app.name'),
        userName: await this.commonUtilsService.toTitleCase(
          mailData.data.clientName,
        ),
        dateGenerated: await this.commonUtilsService.dateFormate(
          mailData.data.orderCreatedOn,
        ), //22 July, 2022
        orderId: mailData.data.orderId,
        orderStatus: mailData.data.status,
        paymentMethod: await this.commonUtilsService.toTitleCase(
          mailData.data.paymentMethod,
        ),
        productName: await this.commonUtilsService.toTitleCase(
          mailData.data.productName,
        ),
        currencyCode: mailData.data.currencyCode,
        currencySymbol: mailData.data.currencySymbol,
        price: mailData.data.price,
        total: mailData.data.total,
        subTotal: mailData.data.subTotal,
        discount: mailData.data.discount,
        facebookUrl: process.env.SOCIALMEDIA_FACEBOOK,
        twitterUrl: process.env.SOCIALMEDIA_TWITTER,
        imgPath: process.env.EMAIL_TEMPLATE_IMAGES_PATH,
        adminPortalUrl: `${this.configService.get('app.frontendDomain')}`,
        portalUrl: `${this.configService.get('app.portalFrontendDomain')}`,
        viewReportUrl: mailData.data.reportLink,
        imageUrl:mailData.data.mediaUrl,
        tax: mailData.data.tax !== null ? mailData.data.tax : 0,
        taxPercent:  mailData.data.taxPercent !== null ? mailData.data.taxPercent : 0,
      },
    });
  }
}
