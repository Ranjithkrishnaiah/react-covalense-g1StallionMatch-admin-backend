import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRaceDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  sourceId: number;

  @ApiProperty({ example: '2007-05-01' })
  @IsOptional()
  raceDate: Date;

  @ApiProperty({ example: '14:22:42.0000000' })
  @IsString()
  raceTime: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  venueId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  trackTypeId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  trackConditionId: number;

  @ApiProperty({ example: 'MISSILE STAKES' })
  @IsString()
  displayName: string;

  @ApiProperty({ example: 2200.0 })
  @IsNumber()
  raceDistance: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  raceNumber: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  distanceUnitId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  raceAgeRestrictionId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  raceSexRestrictionId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  raceClassId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  raceStakeId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  currencyId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  racePrizemoney: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  raceTypeId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  raceWeatherId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  raceStatusId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isEligible: boolean;

  createdBy?: number | null;
}
