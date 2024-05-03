import { Module } from '@nestjs/common';
import { SocialShareTypeController } from './social-share-type.controller';
import { SocialShareTypeService } from './social-share-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialShareType } from './entities/social-share-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialShareType])],
  controllers: [SocialShareTypeController],
  providers: [SocialShareTypeService],
})
export class SocialShareTypeModule {}
