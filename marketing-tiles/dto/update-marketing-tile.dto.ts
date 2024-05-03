import { PartialType } from '@nestjs/swagger';
import { CreateMarketingTileDto } from './create-marketing-tile.dto';

export class UpdateMarketingTileDto extends PartialType(
  CreateMarketingTileDto,
) {}
