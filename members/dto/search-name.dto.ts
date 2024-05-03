import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { ToBoolean } from 'src/utils/to-boolean';

export class SearchNameDto {
  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isNameExactSearch?: boolean;
}
