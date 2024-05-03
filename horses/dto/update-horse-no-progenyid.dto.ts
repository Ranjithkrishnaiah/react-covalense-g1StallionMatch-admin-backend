import { PartialType } from '@nestjs/swagger';
import { CreateHorseNoProgenyidDto } from './create-horse-no-progenyid.dto';

export class UpdateHorseNoProgenyidDto extends PartialType(CreateHorseNoProgenyidDto) {
  modifiedBy?: number | null;
}
