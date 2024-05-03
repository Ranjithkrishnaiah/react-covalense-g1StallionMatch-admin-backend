import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FarmsListDto {
  @ApiProperty()
  @IsNotEmpty()
  farms: Array<string>;
}
