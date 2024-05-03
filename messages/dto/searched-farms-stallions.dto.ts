import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  } from 'class-validator';

export class SearchedFarmsStallionsDto {
  @ApiPropertyOptional()
  @IsArray()
  farms: [];

  @ApiPropertyOptional()
  @IsArray()
  countries: [];

  @ApiPropertyOptional()
  @IsArray()
  states: [];

  @ApiPropertyOptional()
  @IsArray()
  stallions: [];

  @ApiPropertyOptional()
  @IsArray()
  damSireSearched: [];

  @ApiPropertyOptional()
  @IsArray()
  damSireTracked: [];

  @ApiPropertyOptional()
  @IsArray()
  farmsTracked: [];

  @ApiPropertyOptional()
  @IsArray()
  stallionsTracked: [];
}
