import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({ default: false })
  @IsBoolean()
  isRead: boolean;

  modifiedBy?: number | null;
}
