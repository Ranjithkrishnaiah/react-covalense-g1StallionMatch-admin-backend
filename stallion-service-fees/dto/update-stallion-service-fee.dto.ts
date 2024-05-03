import { PartialType } from '@nestjs/swagger';
import { CreateStallionServiceFeeDto } from './create-stallion-service-fee.dto';

export class UpdateStallionServiceFeeDto extends PartialType(
  CreateStallionServiceFeeDto,
) {
  modifiedBy?: number | null;
}
