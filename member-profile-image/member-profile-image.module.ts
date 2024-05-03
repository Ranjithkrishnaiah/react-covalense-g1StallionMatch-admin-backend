import { Module } from '@nestjs/common';
import { MemberProfileImageService } from './member-profile-image.service';
import { MemberProfileImageController } from './member-profile-image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberProfileImage } from './entities/member-profile-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberProfileImage])],
  controllers: [MemberProfileImageController],
  providers: [MemberProfileImageService],
  exports: [MemberProfileImageService],
})
export class MemberProfileImageModule {}
