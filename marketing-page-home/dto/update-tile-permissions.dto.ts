import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class UpdatTilePermissionsDto {
  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsUUID()
  id: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  isAnonymous: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  isRegistered: boolean;
}
