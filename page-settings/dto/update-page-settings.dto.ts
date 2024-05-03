import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject } from 'class-validator';

export class UpdatePageSettingsDto {
  @ApiProperty()
  @IsNumber()
  moduleId: number;

  @ApiProperty({ example: { defaultDisplay: 'horseName' } })
  @IsObject()
  payload: object;
}
