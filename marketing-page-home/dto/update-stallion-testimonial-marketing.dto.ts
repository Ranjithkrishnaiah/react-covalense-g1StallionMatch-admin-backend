import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StallionTestimonialMediaDto } from 'src/stallion-testimonial-media/dto/stallion-testimonial-media.dto';

export class UpdateStallionTestimonialMarketingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  testimonialId: number;

  @ApiProperty({ example: 'Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Just a Description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Company' })
  @IsNotEmpty()
  @IsString()
  company: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({
    type: StallionTestimonialMediaDto,
  })
  @IsOptional()
  @IsNotEmpty()
  testimonialMedia?: StallionTestimonialMediaDto;
}
