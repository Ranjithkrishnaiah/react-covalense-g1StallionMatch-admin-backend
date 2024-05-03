import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class NotificationRequestDto {
  @ApiProperty()
  @IsNumber()
  notificationType: number;

  @ApiProperty()
  @IsString()
  messageTitle: string;

  @ApiProperty()
  @IsString()
  messageText: string;
}
