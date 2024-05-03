import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class CreateProfileImageDto {
  @ApiProperty()
  @IsNumber()
  horseId: number;

  @ApiProperty()
  @IsUUID()
  mediaId: number;
}
