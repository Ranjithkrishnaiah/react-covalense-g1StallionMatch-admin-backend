import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class MessagesPageSettingsDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: 30 })
  @IsOptional()
  retainTrashPeriod: number;

  @ApiProperty({ example: 30 })
  @IsOptional()
  boostExpiryLength: number;
}
