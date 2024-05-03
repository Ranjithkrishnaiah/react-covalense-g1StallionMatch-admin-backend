import { Module } from '@nestjs/common';
import { SocialLinksService } from './social-links.service';
import { SocialLiksController } from './social-links.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialLink } from './entities/social-link.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialLink])],
  controllers: [SocialLiksController],
  providers: [SocialLinksService],
})
export class SocialLinksModule {}
