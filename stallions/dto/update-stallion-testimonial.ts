import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CreateStallionTestimonialDto } from 'src/stallion-testimonials/dto/create-stallion-testimonial.dto';

export class UpdateStallionTestimonialDto {
  @ApiProperty({ type: [CreateStallionTestimonialDto] })
  @IsOptional()
  @Type(() => CreateStallionTestimonialDto)
  testimonials: CreateStallionTestimonialDto[];
}
