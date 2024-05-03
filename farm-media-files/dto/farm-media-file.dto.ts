import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class FarmMediaFileDto {
  @ApiProperty()
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({ default: false })
  @IsUUID()
  mediauuid: string;
}
