import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RaceHorseSort } from 'src/utils/constants/race-horse';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchOptionsDto extends PageOptionsDto {
    @ApiPropertyOptional({ enum: RaceHorseSort, default: RaceHorseSort.createddate })
    @IsEnum(RaceHorseSort)
    @IsOptional()
    readonly orderColumn?: RaceHorseSort = RaceHorseSort.createddate;
}
