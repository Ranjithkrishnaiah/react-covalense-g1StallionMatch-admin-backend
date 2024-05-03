import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateRolePermissionDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  roleId: number;

  @ApiProperty({ example: 99 })
  @IsOptional()
  adminModuleAccessLevelId: number;

  createdBy?: number | null;
}
