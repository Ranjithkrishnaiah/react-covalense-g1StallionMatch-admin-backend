import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class HorsenameSearchOnlyDto {
  @ApiProperty({ example: 'i am' })
  @IsString()
  @MinLength(3)
  horseName: string;
}
