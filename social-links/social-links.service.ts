import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialLink } from './entities/social-link.entity';

@Injectable()
export class SocialLinksService {
  constructor(
    @InjectRepository(SocialLink)
    private socialLinkRepository: Repository<SocialLink>,
  ) {}
 /* Get Social Links */
  findAll() {
    return this.socialLinkRepository.find();
  }
}
