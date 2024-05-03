import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MergeHorseDto {
  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsUUID()
  masterHorseId: string;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsUUID()
  slaveHorseId: string;
}
