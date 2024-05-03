import { Module } from '@nestjs/common';
import { MarketingMediaService } from './marketing-media.service';
import { MarketingMediaController } from './marketing-media.controller';
import { MarketingMedia } from './entities/marketing-media.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [TypeOrmModule.forFeature([MarketingMedia]), MediaModule],
  controllers: [MarketingMediaController],
  providers: [MarketingMediaService],
  exports: [MarketingMediaService],
})
export class MarketingMediaModule {}
