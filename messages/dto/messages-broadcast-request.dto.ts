import { ApiProperty} from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';

export class MessageBroadcastRequestDto {
  @ApiProperty()
  @IsOptional()
  stallionIds: Array<string>;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  fromName: string;

  @ApiProperty()
  @IsOptional()
  farmIds: Array<string>;

  @ApiProperty()
  @IsArray()
  farmMembers: Array<string>;

  @ApiProperty()
  @IsOptional()
  members: Array<string>;

  @ApiProperty()
  @IsOptional()
  userLocations: Array<number>;

  @ApiProperty({ example: [10] })
  @IsOptional()
  farmLocations: Array<number>;

  @ApiProperty({ default: 0 })
  @IsOptional()
  promotedStallions: boolean;

  @ApiProperty({ default: 0 })
  @IsOptional()
  previouslyOrdered: boolean;

  subject: string | null;
  channelId: number | 0;
}
