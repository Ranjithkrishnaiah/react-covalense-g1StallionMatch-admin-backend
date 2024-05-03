import { PartialType } from '@nestjs/swagger';
import { CreateSystemActivityDto } from './create-system-activity.dto';

export class UpdateSystemActivityDto extends PartialType(
  CreateSystemActivityDto,
) {}
