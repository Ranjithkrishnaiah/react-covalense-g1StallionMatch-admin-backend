import { PartialType } from '@nestjs/swagger';
import { CreateMarketingAdditionInfoMediaDto } from './create-marketing-addition-info-media.dto';

export class UpdateMarketingAdditionInfoMediaDto extends PartialType(
  CreateMarketingAdditionInfoMediaDto,
) {}
