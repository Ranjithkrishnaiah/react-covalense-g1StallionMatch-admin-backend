import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class UpdateRolePermissionDto {
  @ApiProperty()
  @Type(() => Array)
  @IsArray()
  readonly permissions?: [];
}
