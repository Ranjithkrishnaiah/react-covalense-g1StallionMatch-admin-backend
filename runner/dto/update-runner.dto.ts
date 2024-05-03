import { PartialType } from '@nestjs/swagger';
import { CreateRunnerDto } from './create-runner.dto';

export class UpdateRunnerDto extends PartialType(CreateRunnerDto) {
  modifiedBy?: number | null;
}
