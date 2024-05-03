import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class MatchedHorseSearchDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @MinLength(3)
  @IsString()
  @IsOptional()
  readonly name?: string;
}
