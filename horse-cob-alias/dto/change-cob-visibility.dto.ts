import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateCobVisibilityDto {
  @ApiProperty({ example: true })
  @IsOptional()
  isActive: boolean;

  modifiedBy: number | null;
}
