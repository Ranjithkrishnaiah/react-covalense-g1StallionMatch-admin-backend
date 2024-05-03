import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class RacePageSettingsDto {
  @ApiProperty()
  @IsUUID()
  settingId: string;

  @ApiProperty()
  @IsOptional()
  defaultDisplay: object;

  @ApiProperty()
  @IsOptional()
  eligibleRaceCountries: Array<string>;

  @ApiProperty()
  @IsOptional()
  eligibleRaceTypes: Array<string>;

  @ApiProperty()
  @IsOptional()
  minimumStakesLevelIncluded: string;

  @ApiProperty({ example: '26-04-2023' })
  @IsOptional()
  eligibleRaceStartDate: string;
}
