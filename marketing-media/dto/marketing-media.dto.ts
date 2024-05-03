import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MarketingMediaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  marketingPageId: number;

  @ApiProperty()
  @IsNumber()
  marketingPageSectionId: number;

  @ApiProperty()
  @IsNumber()
  mediaId: number;
}
