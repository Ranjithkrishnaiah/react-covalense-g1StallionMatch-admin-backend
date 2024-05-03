import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class HorseNameAliasDto {
  @ApiProperty({ example: 'Derbi king' })
  @IsNotEmpty()
  horseName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  horseId: string;

  createdBy?: number | null;
  isDefault?: boolean | false;
  isActive?: boolean | false;
}
