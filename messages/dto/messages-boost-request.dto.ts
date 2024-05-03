import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
} from 'class-validator';

export class MessageBoostRequestDto {
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
  stallions: [];

  msgChannelId: number | null;
  fromMemberId: number | null;
}
