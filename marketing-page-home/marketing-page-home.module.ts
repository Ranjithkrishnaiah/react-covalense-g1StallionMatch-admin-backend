import { Module } from '@nestjs/common';
import { MarketingPageHomeService } from './marketing-page-home.service';
import { MarketingPageHomeController } from './marketing-page-home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingPageHomeData } from './entities/marketing-page-home.entity';
import { MediaModule } from 'src/media/media.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { MarketingMediaModule } from 'src/marketing-media/marketing-media.module';
import { MarketingAdditonInfoModule } from 'src/marketing-addition-info/marketing-addition-info.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { FarmsModule } from 'src/farms/farms.module';
import { StallionTestimonialsModule } from 'src/stallion-testimonials/stallion-testimonials.module';
import { StallionTestimonialMediaModule } from 'src/stallion-testimonial-media/stallion-testimonial-media.module';
import { HorsesModule } from 'src/horses/horses.module';
import { FarmMediaInfoModule } from 'src/farm-media-info/farm-media-info.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketingPageHomeData]),
    MediaModule,
    FileUploadsModule,
    CommonUtilsModule,
    MarketingMediaModule,
    MarketingAdditonInfoModule,
    StallionsModule,
    FarmsModule,
    StallionTestimonialsModule,
    StallionTestimonialMediaModule,
    HorsesModule,
    FarmMediaInfoModule,
  ],
  controllers: [MarketingPageHomeController],
  providers: [MarketingPageHomeService],
  exports: [MarketingPageHomeService],
})
export class MarketingPageHomeModule {}
