import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { SettingItemDto } from './setting-item.dto';

export class UpdateSettingDto {
  @ApiProperty({ type: [SettingItemDto] })
  @IsNotEmpty()
  @Type(() => SettingItemDto)
  settingData: [];

  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  blockedCountries: number[];
}
