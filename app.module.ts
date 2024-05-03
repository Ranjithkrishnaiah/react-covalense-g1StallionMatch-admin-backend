import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderResolver } from 'nestjs-i18n';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { I18nJsonParser } from 'nestjs-i18n/dist/parsers/i18n.json.parser';
import * as path from 'path';
import { AuthModule } from './auth/auth.module';
import { ColoursModule } from './colours/colours.module';
import { CommonUtilsModule } from './common-utils/common-utils.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import fileConfig from './config/file.config';
import mailConfig from './config/mail.config';
import { CountryModule } from './country/country.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { CurrencyRateModule } from './currency-rates/currency-rates.module';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DistanceUnitModule } from './distance-unit/distance-unit.module';
import { FarmAccessLevelsModule } from './farm-access-levels/farm-access-levels.module';
import { FarmGalleryImageModule } from './farm-gallery-images/farm-gallery-image.module';
import { FarmMediaInfoModule } from './farm-media-info/farm-media-info.module';
import { FarmProfileImageModule } from './farm-profile-image/farm-profile-image.module';
import { FarmsModule } from './farms/farms.module';
import { FileUploadsModule } from './file-uploads/file-uploads.module';
import { ForgotModule } from './forgot/forgot.module';
import { HorseTypesModule } from './horse-types/horse-types.module';
import { HorsesModule } from './horses/horses.module';
import { MailConfigService } from './mail/mail-config.service';
import { MailModule } from './mail/mail.module';
import { MarketingAdditionInfoMediaModule } from './marketing-addition-info-media/marketing-addition-info-media.module';
import { MarketingAdditonInfoModule } from './marketing-addition-info/marketing-addition-info.module';
import { MarketingMediaModule } from './marketing-media/marketing-media.module';
import { MarketingPageHomeModule } from './marketing-page-home/marketing-page-home.module';
import { MediaModule } from './media/media.module';
import { MemberAddressModule } from './member-address/member-address.module';
import { MemberFarmsModule } from './member-farms/member-farms.module';
import { MemberInvitationStallionsModule } from './member-invitation-stallions/member-invitation-stallions.module';
import { MemberInvitationsModule } from './member-invitations/member-invitations.module';
import { MemberStatusModule } from './member-status/member-status.module';
import { MembersModule } from './members/members.module';
import { NotificationTypeModule } from './notification-types/notification-types.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { RaceClassModule } from './race-class/race-class.module';
import { RaceStakeModule } from './race-stake/race-stake.module';
import { RaceStatusModule } from './race-status/race-status.module';
import { RaceTrackConditionModule } from './race-track-condition/race-track-condition.module';
import { RaceTrackTypeModule } from './race-track-type/race-track-type.module';
import { RaceTypeModule } from './race-type/race-type.module';
import { RaceWeatherModule } from './race-weather/race-weather.module';
import { RaceModule } from './race/race.module';
import { RegionsModule } from './regions/regions.module';
import { RunnerFinalPositionModule } from './runner-final-position/runner-final-position.module';
import { RunnerJockeyModule } from './runner-jockey/runner-jockey.module';
import { RunnerOwnerModule } from './runner-owner/runner-owner.module';
import { RunnerSilksColourModule } from './runner-silks-colour/runner-silks-colour.module';
import { RunnerTrainerModule } from './runner-trainer/runner-trainer.module';
import { RunnerModule } from './runner/runner.module';
import { SocialLinksModule } from './social-links/social-links.module';
import { SourceModule } from './source/source.module';
import { StallionProfileImageModule } from './stallion-profile-image/stallion-profile-image.module';
import { StallionPromotionModule } from './stallion-promotions/stallion-promotion.module';
import { StallionRetiredReasonsModule } from './stallion-retired-reasons/stallion-retired-reasons.module';
import { StallionsModule } from './stallions/stallions.module';
import { StatesModule } from './states/states.module';
import { VenueModule } from './venue/venue.module';
import { WeightUnitModule } from './weight-unit/weight-unit.module';

import { FavouriteBroodmareSiresModule } from './favourite-broodmare-sires/favourite-broodmare-sires.module';
import { FavouriteFarmsModule } from './favourite-farms/favourite-farms.module';
import { FavouriteStallionsModule } from './favourite-stallions/favourite-stallions.module';
import { HorseCobAliasModule } from './horse-cob-alias/horse-cob-alias.module';
import { HorseNameAliasModule } from './horse-name-alias/horse-name-alias.module';
import { MarketingTilesModule } from './marketing-tiles/marketing-tiles.module';
import { OrderProductModule } from './order-product/order-product.module';
import { OrderTransactionModule } from './order-transaction/order-transaction.module';
import { OrderModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { RaceAgeRestrictionModule } from './race-age-restriction/race-age-restriction.module';
import { RaceSexRestrictionModule } from './race-sex-restriction/race-sex-restriction.module';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminModuleAccessLevelModule } from './admin-module-access-level/admin-module-access-level.module';
import { AuditModule } from './audit/audit.module';
import { CategoriesModule } from './categories/categories.module';
import { MaresListInfoModule } from './mares-list-info/mares-list-info.module';
import { MaresListModule } from './mares-list/mares-list.module';
import { MemberProfileImageModule } from './member-profile-image/member-profile-image.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PreferedNotificationsModule } from './prefered-notification/prefered-notifications.module';
import { PricingModule } from './pricing/pricing.module';
import { SalesModule } from './sales/sales.module';

import { FarmAuditModule } from './audit/farm-audit/farm-audit.module';
import { HorseAuditModule } from './audit/horse-audit/horse-audit.module';
import { MemberAuditModule } from './audit/members-audit/member-audit.module';
import { StallionAuditModule } from './audit/stallion-audit/stallion-audit.module';
import { ExcelModule } from './excel/excel.module';
import { ImportAssetModule } from './import-assets/import-asset.module';
import { OrderProductItemsModule } from './order-product-items/order-product-items.module';
import { PaymentStatusModule } from './payment-status/payment-status.module';
import { ReportTemplatesModule } from './report-templates/report-templates.module';
import { ReportModule } from './report/report.module';
import { SettingModule } from './setting/setting.module';

import { AppDashboardModule } from './app-dashboard/app-dashboard.module';
import { KeyWordsSearchModule } from './key-words-search/key-words-search.module';
import { MessageMediaModule } from './message-media/message-media.module';
import { OrderReportStatusModule } from './order-report-status/order-report-status.module';
import { OrderStatusModule } from './order-status/order-status.module';
import { SalesCompanyModule } from './sales-company/sales-company.module';
import { SalesLotInfoTempModule } from './sales-lot-info-temp/sales-lot-info-temp.module';
import { SalesLotsModule } from './sales-lots/sales-lots.module';
import { SalesStatusModule } from './sales-status/sales-status.module';
import { SalesTypeModule } from './sales-type/sales-type.module';
import { SearchStallionMatchModule } from './search-stallion-match/search-stallion-match.module';
import { StallionReportModule } from './stallion-report/stallion-report.module';
import { SystemActivitiesModule } from './system-activities/system-activities.module';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityModule } from './activity-module/activity.module';
import { AdminUserCustomRolePermissionModule } from './admin-user-custom-role-permission/admin-user-custom-role-permission.module';
import { AppPermissionModule } from './app-permission/app-permission.module';
import { MemberInterceptor } from './audit/smp-activity-tracker/member.interceptor';
import { SmpActivityTrackerModule } from './audit/smp-activity-tracker/smp-activity-tracker.module';
import ga4Config from './config/ga4.config';
import { HorseProfileImageModule } from './horse-profile-image/horse-profile-image.module';
import { ImpactAnalysisTypeModule } from './impact-analysis-type/impact-analysis-type.module';
import { MemberMaresModule } from './member-mares/member-mares.module';
import { PageSettingsModule } from './page-settings/page-settings.module';
import { RaceStakeCategoryModule } from './race-stake-category/race-stake-category.module';
import { SalesReportSettingsModule } from './sales-report-settings/sales-report-settings.module';
import { SocialShareTypeModule } from './social-share-type/social-share-type.module';
import { SocialShareModule } from './social-share/social-share.module';
import { UsersModule } from './users/users.module';
import { RaceHorseModule } from './race-horse/race-horse.module';
import { NominationPricingModule } from './nomination-pricing/nomination-pricing.module';
import { EmailModule } from './email/email.module';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MemberInterceptor,
    },
    FarmAuditModule,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        ga4Config,
      ],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('app.fallbackLanguage'),
        parserOptions: {
          path: path.join(
            configService.get('app.workingDirectory'),
            'src',
            'i18n',
            'translations',
          ),
        },
      }),
      parser: I18nJsonParser,
      inject: [ConfigService],
      resolvers: [new HeaderResolver(['x-custom-lang'])],
    }),
    MembersModule,
    CountryModule,
    AuthModule,
    ForgotModule,
    MailModule,
    FarmsModule,
    StatesModule,
    ColoursModule,
    HorsesModule,
    StallionsModule,
    RegionsModule,
    CurrenciesModule,
    AuditModule,
    HorseAuditModule,
    StallionAuditModule,
    FarmAuditModule,
    MemberAuditModule,
    MemberAddressModule,
    HorseTypesModule,
    StallionRetiredReasonsModule,
    PaymentMethodsModule,
    SocialLinksModule,
    NotificationTypeModule,
    MemberStatusModule,
    FarmProfileImageModule,
    MediaModule,
    StallionProfileImageModule,
    CommonUtilsModule,
    FileUploadsModule,
    MemberInvitationsModule,
    MemberFarmsModule,
    FarmAccessLevelsModule,
    MemberInvitationStallionsModule,
    StallionPromotionModule,
    RaceModule,
    RaceClassModule,
    RaceStakeModule,
    RaceStatusModule,
    RaceTypeModule,
    RaceTrackTypeModule,
    RaceTrackConditionModule,
    VenueModule,
    RunnerModule,
    FarmGalleryImageModule,
    FarmMediaInfoModule,
    CurrencyRateModule,
    MarketingAdditonInfoModule,
    MarketingPageHomeModule,
    RunnerFinalPositionModule,
    RunnerOwnerModule,
    RunnerJockeyModule,
    RunnerSilksColourModule,
    RunnerTrainerModule,
    SourceModule,
    WeightUnitModule,
    MarketingMediaModule,
    MarketingAdditionInfoMediaModule,
    DistanceUnitModule,
    RaceWeatherModule,
    RaceAgeRestrictionModule,
    RaceSexRestrictionModule,
    HorseNameAliasModule,
    HorseCobAliasModule,
    PromoCodesModule,
    ProductsModule,
    OrderModule,
    OrderProductModule,
    OrderTransactionModule,
    MarketingTilesModule,
    NotificationsModule,
    FavouriteStallionsModule,
    FavouriteFarmsModule,
    FavouriteBroodmareSiresModule,
    MaresListModule,
    MaresListInfoModule,
    PreferedNotificationsModule,
    MemberProfileImageModule,
    SalesModule,
    EventEmitterModule.forRoot(),
    MessagesModule,
    AdminModuleAccessLevelModule,
    CategoriesModule,
    PricingModule,
    ReportModule,
    PaymentStatusModule,
    OrderProductItemsModule,
    SettingModule,
    ImportAssetModule,
    ReportTemplatesModule,
    ExcelModule,
    OrderStatusModule,
    OrderReportStatusModule,
    MessageMediaModule,
    StallionReportModule,
    KeyWordsSearchModule,
    SalesCompanyModule,
    SalesTypeModule,
    SalesLotsModule,
    SalesStatusModule,
    SalesLotInfoTempModule,
    AppDashboardModule,
    SearchStallionMatchModule,
    SystemActivitiesModule,
    SmpActivityTrackerModule,
    ActivityModule,
    ImpactAnalysisTypeModule,
    SalesReportSettingsModule,
    AppPermissionModule,
    AdminUserCustomRolePermissionModule,
    UsersModule,
    PageSettingsModule,
    SocialShareModule,
    SocialShareTypeModule,
    HorseProfileImageModule,
    MemberMaresModule,
    RaceStakeCategoryModule,
    RaceHorseModule,
    NominationPricingModule,
    EmailModule,
  ],
})
export class AppModule {}