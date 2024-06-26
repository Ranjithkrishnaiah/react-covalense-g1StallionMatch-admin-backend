import { PartialType } from '@nestjs/swagger';
import { CreateRaceDto } from './create-race.dto';
export class UpdateRaceDto extends PartialType(CreateRaceDto) {
  modifiedBy?: number | null;
  modifiedOn?: Date | null;
}
