import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { StallionTestimonialMedia } from './entities/stallion-testimonial-media.entity';

@Injectable({ scope: Scope.REQUEST })
export class StallionTestimonialMediaService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionTestimonialMedia)
    private stallionTestimonialMediaRepository: Repository<StallionTestimonialMedia>,
  ) {}

  /* Create a media for testimonial */
  async create(testimonialId: number, mediaId: number) {
    return this.stallionTestimonialMediaRepository.save(
      this.stallionTestimonialMediaRepository.create({
        testimonialId: testimonialId,
        mediaId: mediaId,
      }),
    );
  }
  
/* Get Testomonial media */
  async findByTestimonialId(testimonialId: number) {
    return await this.stallionTestimonialMediaRepository.findOne({
      testimonialId: testimonialId,
    });
  }

/* Update Testimonial media */
  async updateByTestimonialId(testimonialId: number, mediaId: number) {
    return await this.stallionTestimonialMediaRepository.update(
      { testimonialId: testimonialId },
      { mediaId: mediaId },
    );
  }
}
