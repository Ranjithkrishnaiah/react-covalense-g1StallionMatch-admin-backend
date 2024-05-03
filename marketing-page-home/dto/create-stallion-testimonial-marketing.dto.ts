import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StallionTestimonialMediaDto } from 'src/stallion-testimonial-media/dto/stallion-testimonial-media.dto';

export class CreatieStallionTestimonialMarketingDto {
  @ApiProperty({ example: 'Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Just a Description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    type: StallionTestimonialMediaDto,
  })
  @IsOptional()
  @IsNotEmpty()
  testimonialMedia?: StallionTestimonialMediaDto;

  @ApiProperty({ example: 'Title' })
  @IsOptional()
  @IsString()
  company: string;
}
