import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMarketingAdditionInfoMediaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  marketingPageAdditionInfoId: number;

  @ApiProperty()
  @IsNumber()
  mediaId: number;
}
