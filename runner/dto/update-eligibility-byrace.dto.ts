import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class EligibiltyByRaceIdDto {
  @ApiProperty({ example: true })
  @IsOptional()
  isEligible: boolean;

  modifiedBy: number | null;
}
