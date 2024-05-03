import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class SearchOptionsDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  readonly keyWord?: string;
}
