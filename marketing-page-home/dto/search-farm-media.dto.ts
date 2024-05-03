import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class searchFarmMedia {
  @ApiPropertyOptional()
  @IsOptional()
  mediaId: number;
}
