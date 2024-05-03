import { PartialType } from '@nestjs/swagger';
import { CreateMarketingMediaDto } from './create-marketing-media.dto';

export class UpdateMarketingMediaDto extends PartialType(
  CreateMarketingMediaDto,
) {}
