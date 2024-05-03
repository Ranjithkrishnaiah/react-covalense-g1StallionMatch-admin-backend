import { Module, forwardRef } from '@nestjs/common';
import { StallionsService } from './stallions.service';
import { StallionsController } from './stallions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stallion } from './entities/stallion.entity';

import { StallionServiceFeesModule } from 'src/stallion-service-fees/stallion-service-fees.module';
import { StallionLocationsModule } from 'src/stallion-locations/stallion-locations.module';
import { HorsesModule } from 'src/horses/horses.module';
import { FarmsModule } from 'src/farms/farms.module';
import { StallionProfileImageModule } from 'src/stallion-profile-image/stallion-profile-image.module';
import { MediaModule } from 'src/media/media.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { StallionPromotionModule } from 'src/stallion-promotions/stallion-promotion.module';
import { CountryModule } from 'src/country/country.module';
import { StallionGalleryImageModule } from 'src/stallion-gallery-images/stallion-gallery-image.module';
import { FarmLocationsModule } from 'src/farm-locations/farm-locations.module';
import { StallionTestimonialsModule } from 'src/stallion-testimonials/stallion-testimonials.module';
import { StallionTestimonialMediaModule } from 'src/stallion-testimonial-media/stallion-testimonial-media.module';
import { StallionsSubscriber } from './stallions.subscriber';
import { ExcelModule } from 'src/excel/excel.module';
import { HtmlToPdfService } from 'src/report-templates/html-to-pdf.service';
import { SearchStallionMatchModule } from 'src/search-stallion-match/search-stallion-match.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Stallion]),
    StallionLocationsModule,
    StallionServiceFeesModule,
    HorsesModule,
    FarmsModule,
    StallionProfileImageModule,
    MediaModule,
    CommonUtilsModule,
    FileUploadsModule,
    CurrenciesModule,
    CountryModule,
    StallionGalleryImageModule,
    FarmLocationsModule,
    StallionTestimonialsModule,
    StallionTestimonialMediaModule,
    SearchStallionMatchModule,
    forwardRef(() => StallionPromotionModule),
    ExcelModule,
  ],
  controllers: [StallionsController],
  providers: [StallionsService, StallionsSubscriber, HtmlToPdfService],
  exports: [StallionsService],
})
export class StallionsModule {}
