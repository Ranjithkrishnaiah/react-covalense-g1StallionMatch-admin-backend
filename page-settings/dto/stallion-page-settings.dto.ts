import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class StallionPageSettingsDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: { name: 'Stallion', value: 'Stallion' } })
  @IsOptional()
  defaultDisplay: object;

  @ApiProperty({ example: 30 })
  @IsOptional()
  recentlyExpiredClassification: number;

  @ApiProperty({ example: 30 })
  @IsOptional()
  promotedGracePeriod: number;
}
