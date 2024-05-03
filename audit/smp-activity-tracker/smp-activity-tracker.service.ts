import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SmpActivityTrackerService {
  horseUpdateHookData: any;
  subscribeData: any;
  farmActivityHookData: any;
  raceActivityHookData: any;
  runnerActivityHookData: any;
  stallionActivityPromotion: any;
  updateMemberEvent: any;
  productsActivityHookData: any;
  PromoCodeActivityHookData: any;
  deleteMaktTestimonialHookData: any;

  constructor(
    private eventEmitter: EventEmitter2,
    readonly configService: ConfigService,
  ) {}

  async updateMemberLastActive(memberId: number) {
    await this.eventEmitter.emitAsync('updateLastActive', memberId);
  }
  
  @OnEvent('updateHorseActivity')
  async updateHorseHook(data) {
    this.horseUpdateHookData = await data;
  }

  @OnEvent('updateActivityFarm')
  async updateFarmHook(data) {
    this.farmActivityHookData = await data;
  }

  @OnEvent('updateRaceDetailsActivity')
  async updateRaceHook(data) {
    this.raceActivityHookData = await data;
  }

  @OnEvent('updateActivityRunner')
  async updateRunnerHook(data) {
    this.runnerActivityHookData = await data;
  }

  @OnEvent('updateActivityProduct')
  async updateProductHook(data) {
    this.productsActivityHookData = await data;
  }

  @OnEvent('updateActivityPromoCode')
  async updatePromoCodeHook(data) {
    this.PromoCodeActivityHookData = await data;
  }

  @OnEvent('deleteMaktTestimonial')
  async deleteMaktTestimonial(data) {
    this.deleteMaktTestimonialHookData = await data;
  }

  async getAction(data) {}

  /* Post Action */
  async postAction(data) {
    let baseUrl = this.configService.get('file.activityBaseUrl');
    const { request } = data;
    const { params, body, originalUrl, ip } = request;
    if (originalUrl == baseUrl + `auth/email/login`) {
      await this.eventEmitter.emitAsync('signInUser', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `auth/forgot/password`) {
      await this.eventEmitter.emitAsync('forgotPassword', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `stallions`) {
      await this.eventEmitter.emitAsync('addStallionActivity', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `horses/`) {
      await this.eventEmitter.emitAsync('addHorseActivity', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `horses/create-horse-with-pedigree`) {
      await this.eventEmitter.emitAsync('addHorseWithPedigreeActivity', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `users`) {
      await this.eventEmitter.emitAsync('membersActivity', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `auth/forgot/password`) {
      await this.eventEmitter.emitAsync('userForgotPassword', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `member-invitations/invite-farmuser`) {
      await this.eventEmitter.emitAsync('memberInvitationInviteFarm', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `farms/`) {
      await this.eventEmitter.emitAsync('createFarmActivity', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `race/`) {
      await this.eventEmitter.emitAsync('createRaceActivity', {
        originalData: request,
      });
    } else if (
      originalUrl ==
      baseUrl + `auth/email/resend-confirm-email` + params.id
    ) {
      await this.eventEmitter.emitAsync('resendConfirmEmail', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `runner/`) {
      await this.eventEmitter.emitAsync('addRunner', { originalData: request });
    } else if (originalUrl == baseUrl + `products`) {
      await this.eventEmitter.emitAsync('addProduct', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `promo-codes`) {
      await this.eventEmitter.emitAsync('addPromoCode', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `messages/broadcast`) {
      await this.eventEmitter.emitAsync('newMessages', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `testimonial/`) {
      await this.eventEmitter.emitAsync('addMarketingTestimonial', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `page-settings/horse`) {
      await this.eventEmitter.emitAsync('updateHorsePageSettingsActivity', {
        originalData: request,
      });
    }
  }

  /* UPDATE Action */
  async updateAction(data) {
    let baseUrl = this.configService.get('file.activityBaseUrl');
    const { request } = data;
    const { params, originalUrl } = request;

    if (originalUrl == baseUrl + `horses/${params.id}`) {
      await this.eventEmitter.emitAsync('updateHorsesActivity', {
        originalData: request,
        horseChangedData: this.horseUpdateHookData,
      });
    /* } else if (originalUrl == baseUrl + `members//${params.id}`) {
      await this.eventEmitter.emitAsync('updateHorsesActivity', {
        originalData: request,
        horseChangedData: this.horseUpdateHookData,
      }); */
    }  else if (originalUrl == baseUrl + `farms/${params.id}`) {
      await this.eventEmitter.emitAsync('updateFarmActivity', {
        originalData: request,
        farmChangedData: this.farmActivityHookData,
      });
    } else if (originalUrl == baseUrl + `race/${params.id}`) {
      await this.eventEmitter.emitAsync('updateRaceActivity', {
        originalData: request,
        raceChangedData: this.raceActivityHookData,
      });
    } else if (
      originalUrl ==
      baseUrl + `race/change-eligibility/${params.id}`
    ) {
      await this.eventEmitter.emitAsync('updateRaceEligibility', {
        originalData: request,
        raceChangedData: this.raceActivityHookData,
      });
    }else if (originalUrl == baseUrl + `runner/${params.raceId}`) {
        await this.eventEmitter.emitAsync('updateRaceRunnersEligiblity', {
          originalData: request,
          raceChangedData: this.runnerActivityHookData,
        });
    } else if (originalUrl == baseUrl + `runner/${params.id}`) {
      await this.eventEmitter.emitAsync('updateRunnerActivity', {
        originalData: request,
        runnerChangedData: this.runnerActivityHookData,
      });
    } else if (
      originalUrl ==
      baseUrl + `runner/updateOnlyRunner/${params.horseId}`
    ) {
      await this.eventEmitter.emitAsync('updateOnlyRunnerEligiblity', {
        originalData: request,
        runnerChangedData: this.runnerActivityHookData,
      });
    } else if (
      originalUrl ==
      baseUrl + `runner/${params.raceId}/change-eligibility/All`
    ) {
      await this.eventEmitter.emitAsync('updateAllLinkedRunnerEligiblity', {
        originalData: request,
        runnerChangedData: this.runnerActivityHookData,
      });
    } else if (originalUrl == baseUrl + `products/${params.id}`) {
      await this.eventEmitter.emitAsync('updateProduct', {
        originalData: request,
        productChangedData: this.productsActivityHookData,
      });
    } else if (originalUrl == baseUrl + `promo-codes/${params.id}`) {
      await this.eventEmitter.emitAsync('updatePromoCode', {
        originalData: request,
        promoCodeChangedData: this.PromoCodeActivityHookData,
      });
    } else if (originalUrl == baseUrl + `messages`) {
      await this.eventEmitter.emitAsync('updateMessage', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `home/${params.pageId}`) {
      await this.eventEmitter.emitAsync('updateMarketingHomePage', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `stallion-farm/${params.pageId}`) {
      await this.eventEmitter.emitAsync(
        'updateStallionMatchFarmMarketingPage',
        { originalData: request },
      );
    } else if (originalUrl == baseUrl + `trends/${params.pageId}`) {
      await this.eventEmitter.emitAsync('updateTrendsMarketingPage', {
        originalData: request,
      });
    } else if (
      originalUrl ==
      baseUrl + `farm/${params.pageId}/${params.farmId}`
    ) {
      await this.eventEmitter.emitAsync('updateFarmMarketingPage', {
        originalData: request,
      });
    } else if (
      originalUrl ==
      baseUrl + `stallion/${params.pageId}/${params.stallionId}`
    ) {
      await this.eventEmitter.emitAsync('updateStallionMarketingPage', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `horses/${params.horseId}/pedigree/`) {
      await this.eventEmitter.emitAsync('updateHorsePedigreeActivity', {
        originalData: request,
      });
    } else if (originalUrl == baseUrl + `horses/${params.horseId}/profile-image`) {
      await this.eventEmitter.emitAsync('updateHorseProfileImageActivity', {
        originalData: request,
      });
    }
  }

  /* Delete Action */
  async deleteAction(data) {
    let baseUrl = this.configService.get('file.activityBaseUrl');
    const { request } = data;
    const { params, originalUrl } = request;

    if (originalUrl == baseUrl + `messages`) {
      await this.eventEmitter.emitAsync('deleteMessage', {
        originalData: request,
      });
    } else if (
      originalUrl ==
      baseUrl + `marketingPageAdditionalInfo/${params.additionalInfoId}`
    ) {
      await this.eventEmitter.emitAsync('deleteMarketingTestimonial', {
        originalData: request,
        record: this.deleteMaktTestimonialHookData.record,
      });
    }
  }
}
