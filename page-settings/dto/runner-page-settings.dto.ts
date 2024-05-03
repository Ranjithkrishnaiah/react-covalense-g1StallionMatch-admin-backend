import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class RunnerPageSettingsDto {
  @ApiProperty()
  @IsUUID()
  settingId: string;
  
  @ApiProperty()
  @IsOptional()
  defaultDisplay: object;

  @ApiProperty()
  @IsOptional()
  eligibleRunnerCOBCountries: Array<string>;
}
