import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional
} from 'class-validator';

export class StallionPedigreeLevelDto {
  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  level?: number;
}
