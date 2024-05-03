import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LocationsListDto {
  @ApiProperty()
  @IsNotEmpty()
  locations: Array<number>;
}
