import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePreferedNotificationDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
