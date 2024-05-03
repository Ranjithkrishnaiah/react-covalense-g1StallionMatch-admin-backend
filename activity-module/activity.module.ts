import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { CountryModule } from 'src/country/country.module';
import { FarmsModule } from 'src/farms/farms.module';
import { HorsesModule } from 'src/horses/horses.module';
import { MemberAddressModule } from 'src/member-address/member-address.module';
import { MembersModule } from 'src/members/members.module';
import { MessageChannelModule } from 'src/message-channel/message-channel.module';
import { MessagesModule } from 'src/messages/messages.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { ActivityEntity } from './activity.entity';
import { ActivityService } from './activity.service';
import { PaymentMethodsModule } from 'src/payment-methods/payment-methods.module';
import { RaceModule } from 'src/race/race.module';
import { ProductsModule } from 'src/products/products.module';
import { MarketingPageHomeModule } from 'src/marketing-page-home/marketing-page-home.module';
import { MarketingAdditonInfoModule } from 'src/marketing-addition-info/marketing-addition-info.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityEntity]),
    MembersModule,
    HorsesModule,
    StallionsModule,
    FarmsModule,
    CommonUtilsModule,
    MessagesModule,
    MessageChannelModule,
    MemberAddressModule,
    CountryModule,
    PaymentMethodsModule,
    RaceModule,
    ProductsModule,
    MessagesModule,
    MarketingPageHomeModule,
    MarketingAdditonInfoModule,
  ],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
