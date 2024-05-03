import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class RunnerHorseNameSearchDto {
  @ApiProperty()
  @Type(() => String)
  @MinLength(3)
  @IsString()
  readonly horseName?: string;
}
