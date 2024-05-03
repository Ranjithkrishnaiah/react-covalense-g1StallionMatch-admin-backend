import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class FarmGalleryImageDto {
  @ApiProperty({ default: false })
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty()
  @IsUUID()
  mediauuid: string;
}
