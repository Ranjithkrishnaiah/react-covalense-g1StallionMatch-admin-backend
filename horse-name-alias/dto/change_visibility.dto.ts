import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateVisibilityDto {
  @ApiProperty({ example: true })
  @IsOptional()
  isActive: boolean;

  modifiedBy: number | null;
}
