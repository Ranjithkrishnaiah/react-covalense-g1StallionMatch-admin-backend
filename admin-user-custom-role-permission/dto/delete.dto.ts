import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class DeleteDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  memberId: number;

  @ApiProperty({ example: 99 })
  @IsOptional()
  adminModuleAccessLevelId: number;
}
