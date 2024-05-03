import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCobAliasDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  countryId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  horseId: string;

  createdBy?: number | null;
  isDefault?: boolean | false;
  isActive?: boolean | false;
}
