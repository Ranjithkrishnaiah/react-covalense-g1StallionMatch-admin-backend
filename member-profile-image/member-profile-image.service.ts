import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberProfileImage } from './entities/member-profile-image.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Member } from 'src/members/entities/member.entity';

@Injectable()
export class MemberProfileImageService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberProfileImage)
    private memberProfileImageRepository: Repository<MemberProfileImage>,
  ) {}

  //Get record By MemberId
  async findByMemberId(memberId: number) {
    return await this.memberProfileImageRepository
      .createQueryBuilder('mpi')
      .select(
        'mpi.memberId, mpi.mediaId, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType, media.mediaFileSize',
      )
      .innerJoin('mpi.media', 'media')
      .andWhere('mpi.memberId = :memberId', { memberId: memberId })
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .getRawOne();
  }

  //Create a record
  async create(member: Member, mediaId: number) {
    return this.memberProfileImageRepository.save(
      this.memberProfileImageRepository.create({
        memberId: member['id'],
        mediaId: mediaId,
      }),
    );
  }
}
