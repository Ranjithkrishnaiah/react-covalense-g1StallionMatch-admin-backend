import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { sortBy } from './sortby';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: sortBy, default: sortBy.name })
  @IsEnum(sortBy)
  @IsOptional()
  readonly sortBy?: sortBy = sortBy.name;
}
