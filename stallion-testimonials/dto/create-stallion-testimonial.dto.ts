import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StallionTestimonialMediaDto } from 'src/stallion-testimonial-media/dto/stallion-testimonial-media.dto';

export class CreateStallionTestimonialDto {
  // If Update/Delete then we need this
  @ApiProperty()
  @IsOptional()
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

  isActive: boolean;
  createdBy?: number | null;

  //testimonialId is not null and if it is true then delete else update
  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({ type: [StallionTestimonialMediaDto] })
  @IsOptional()
  @Type(() => StallionTestimonialMediaDto)
  testimonialMedia: StallionTestimonialMediaDto[];
}
