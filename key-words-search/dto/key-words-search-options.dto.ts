import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class KeyWordsSearchOptionsDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  readonly keyWord?: string;
}
