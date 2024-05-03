import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialShareType } from './entities/social-share-type.entity';

@Injectable()
export class SocialShareTypeService {
  constructor(
    @InjectRepository(SocialShareType)
    private socialShareRepository: Repository<SocialShareType>,
  ) { }
  /* Get Social Share Type ListS */
  findAll() {
    return this.socialShareRepository.find();
  }
}
