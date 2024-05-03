import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
} from 'class-validator';

export class MessageExtendedBoostRequestDto {
  @ApiProperty()
  @IsString()
  fromName: string;

  @ApiProperty({ example: 'message info' })
  @IsString()
  message: string;

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

  msgChannelId: number | null;
  fromMemberId: number | null;
}
