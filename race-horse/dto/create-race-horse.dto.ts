import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRaceHorseDto {
  @ApiProperty({ example: 'a78ae625-b29c-457e-a290-b4c6e7cc8e22' })
  @IsUUID()
  horseId: string;
}
