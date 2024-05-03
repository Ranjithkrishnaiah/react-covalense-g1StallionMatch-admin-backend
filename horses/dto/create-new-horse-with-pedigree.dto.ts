import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateNewHorseWithPedigreeHorseItemDto } from './create-new-horse-with-pedigree-horseitem.dto';

export class CreateNewHorseWithPedigreeDto {
  @ApiProperty({ example: '220E4FA5-AFB4-EC11-B7F8-F4EE08D04E43' })
  @IsNotEmpty()
  @IsUUID()
  batch: string;

  @ApiProperty({ type: [CreateNewHorseWithPedigreeHorseItemDto] })
  @IsNotEmpty()
  data: CreateNewHorseWithPedigreeHorseItemDto[][];
}
