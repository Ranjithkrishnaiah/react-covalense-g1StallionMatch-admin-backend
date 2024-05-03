import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FarmMediaFileDto } from 'src/farm-media-files/dto/farm-media-file.dto';

export class CreatieFarmMediaMarketingDto {
  @ApiProperty({ example: 'Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Just a Description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ type: [FarmMediaFileDto] })
  @IsOptional()
  @Type(() => FarmMediaFileDto)
  mediaInfoFiles?: FarmMediaFileDto[];
}
