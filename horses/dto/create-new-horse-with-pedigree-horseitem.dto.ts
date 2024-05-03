import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateHorseWithPedigreeDto } from './create-horse-with-pedigree.dto';

export class CreateNewHorseWithPedigreeHorseItemDto {
  @ApiProperty({ example: 'S' })
  @IsNotEmpty()
  tag: string;

  @ApiProperty({ example: '220E4FA5-AFB4-EC11-B7F8-F4EE08D04E43' })
  @IsNotEmpty()
  @IsUUID()
  olduuid: string;

  @ApiProperty({ type: CreateHorseWithPedigreeDto })
  horseData?: CreateHorseWithPedigreeDto | null;
}