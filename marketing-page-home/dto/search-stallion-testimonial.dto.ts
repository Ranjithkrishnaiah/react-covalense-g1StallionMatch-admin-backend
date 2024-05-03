import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class searchStallionTestimonial {
  @ApiPropertyOptional()
  @IsOptional()
  testimonialId: number;
}
