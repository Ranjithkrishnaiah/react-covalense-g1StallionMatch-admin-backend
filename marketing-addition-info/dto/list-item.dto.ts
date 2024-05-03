import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ListItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  marketingAdditonInfoId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  position: number;
}
