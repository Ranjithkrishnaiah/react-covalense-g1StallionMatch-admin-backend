import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class StallionGalleryImageDto {
  @ApiProperty()
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty()
  @IsUUID()
  mediauuid: string;

  @ApiProperty()
  @IsNumber()
  position: number;
}
