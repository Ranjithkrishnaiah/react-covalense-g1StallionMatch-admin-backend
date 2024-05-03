import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateLotSettingsDto {
  @ApiProperty({ example: [1, 2] })
  @IsOptional()
  selectedLots?: [];

  @ApiProperty({ example: true })
  @IsOptional()
  isSelectedForSetting: boolean;

  @ApiProperty()
  @IsOptional()
  impactAnalysisTypeId: number;
}
