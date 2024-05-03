import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SettingItemDto {
  @ApiProperty()
  @IsString()
  smSettingKey: string;

  @ApiProperty()
  @IsString()
  smSettingValue: string;
}
