import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class MemberPageSettingsDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: { name: 'Nmae', value: 'Name' } })
  @IsOptional()
  defaultDisplay: object;
}
