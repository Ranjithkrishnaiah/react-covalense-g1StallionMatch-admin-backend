import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateRaceHorseUrlDto {
  @ApiProperty()
  @IsString()
  raceHorseUrl: string;
}
