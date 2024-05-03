import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { HorseProgenySort } from 'src/utils/constants/horse-progeny-sort';

export class ProgenyDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: HorseProgenySort,
    default: HorseProgenySort.NAME,
  })
  @IsEnum(HorseProgenySort)
  @IsString()
  @IsOptional()
  readonly sortBy?: HorseProgenySort = HorseProgenySort.NAME;
}
