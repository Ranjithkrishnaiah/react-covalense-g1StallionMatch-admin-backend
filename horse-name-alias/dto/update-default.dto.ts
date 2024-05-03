import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateHorseNameAliasDto {
  @ApiProperty({ example: true })
  @IsOptional()
  isDefault: boolean;

  @ApiProperty({ example: true })
  @IsOptional()
  isActive: boolean;

  modifiedBy: number | null;
}
