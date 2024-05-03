import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, Max } from 'class-validator';

export class CreateRunnerDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  raceId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  horseId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  number: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  barrier: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  finalPositionId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  margin: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @Max(2000)
  weight: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  weightUnitId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  jockeyId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  trainerId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  ownerId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  currencyId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  silksColourId: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  prizemoneyWon: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  startingPrice: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  sourceId: number;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isEligible: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isApprentice: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isScratched: boolean;

  createdBy?: number | null;
}
