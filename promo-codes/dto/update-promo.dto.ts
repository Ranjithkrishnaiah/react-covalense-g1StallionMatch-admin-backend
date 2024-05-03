import { PartialType } from '@nestjs/swagger';
import { CreatePromoCodeDto } from './create-promo-code.dto';

export class UpdatePromoDto extends PartialType(CreatePromoCodeDto) {
  modifiedBy?: number | null;
}
